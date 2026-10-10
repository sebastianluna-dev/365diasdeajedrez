import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { isVictoryPlayable, progressBeforeVictory } from "@/services/adventure/adventure-rules";
import type { AdventureProgressView } from "@/services/adventure/adventure.types";

// The victory over a rival, played on the map the person comes back to: the
// mockup's `simularVictoria` as a machine of phases. The map is mounted in the
// state BEFORE the win (the rival to play, the next one locked) and moves to
// the state after it one phase at a time; each phase is a class the pieces
// draw (`_phase_*`) and, when it needs to move on its own (the seam, the
// needle, the token), a duration the layer animates over. The durations start
// from the mockup's.

/** The phases of the sequence, in order. `rest` is the map as it was; `done` is the map as it is. */
export const VICTORY_PHASES = [
  "rest",
  "release",
  "postmark",
  "stars",
  "keepsake",
  "seam",
  "unlock",
  "arrive",
  "token",
  "done",
] as const;
export type VictoryPhase = (typeof VICTORY_PHASES)[number];

/** How long each phase lasts before the next one, in milliseconds. `done` is the end. */
export const VICTORY_DURATIONS: Record<VictoryPhase, number> = {
  // The map settles and the person sees where they stand.
  rest: 700,
  // The pin comes out of the stamp.
  release: 500,
  // The postmark lands.
  postmark: 800,
  // Three stars, 260 ms apart, and a breath.
  stars: 1080,
  // The keepsake is stuck down.
  keepsake: 900,
  // The seam is sewn to the next rival, the needle leading.
  seam: 1800,
  // The padlock of the next stamp falls.
  unlock: 1100,
  // The stamp is inked and pinned.
  arrive: 500,
  // The token hops along the seam.
  token: 1400,
  done: 0,
};

/** A victory being played: which rival was beaten, where the sequence is, and whether there is a next one to open. */
export interface VictorySequence {
  order: number;
  phase: VictoryPhase;
  /** False for the last page: there is no seam to sew, no rival to unlock and no token to move. */
  hasNext: boolean;
}

const isBefore = (phase: VictoryPhase, other: VictoryPhase) =>
  VICTORY_PHASES.indexOf(phase) < VICTORY_PHASES.indexOf(other);

/** Whether `phase` is `from` or later, and before `until` (to the end when left out). */
export const inPhases = (phase: VictoryPhase, from: VictoryPhase, until?: VictoryPhase) =>
  !isBefore(phase, from) && (until === undefined || isBefore(phase, until));

/**
 * The map shown at a phase of the sequence. The rival won is back to play
 * until its stamp is cancelled; the next one stays locked until its padlock
 * falls; the HUD's count and the person's place (the seam, the token, the
 * pages) change at the end of what is walked, and what is earned counts only
 * once the sequence is over.
 */
export function progressAt(
  after: AdventureProgressView,
  before: AdventureProgressView,
  { order, phase, hasNext }: VictorySequence,
): AdventureProgressView {
  if (phase === "done") return after;
  const won = after.encounters.find((encounter) => encounter.order === order)!;
  const encounters = before.encounters.map((encounter) => {
    if (encounter.order === order && inPhases(phase, "postmark")) return won;
    if (hasNext && encounter.order === order + 1 && inPhases(phase, "arrive"))
      return after.encounters.find((candidate) => candidate.order === order + 1)!;
    return encounter;
  });
  const opened = hasNext && inPhases(phase, "arrive");
  return {
    ...before,
    encounters,
    current: opened ? (encounters.find((encounter) => encounter.order === order + 1) ?? null) : before.current,
  };
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Whether the person asked for less motion; the server, which cannot know, plays the sequence. */
function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

/** What the sequence needs of the page: the progress as it was told, and the order the address asked to play. */
interface VictorySequenceOptions {
  progress: AdventureProgressView;
  /** The order of the rival just beaten, from `?victoria=`; null for none. */
  victory: number | null;
}

/**
 * Plays the victory over a rival when the person comes back to the map from
 * its game. It only plays a win that is real (`isVictoryPlayable`) and only
 * once: it takes `?victoria=` off the address on mount, so going back does not
 * repeat it. With «reducir movimiento» it does not animate: the map is at its
 * end from the first paint of the client. Returns the progress to draw and the
 * sequence's phase (null when there is nothing to play).
 */
export function useVictorySequence({ progress, victory }: VictorySequenceOptions): {
  progress: AdventureProgressView;
  sequence: VictorySequence | null;
} {
  // What the address asked for, read once: a refresh of the page later does not bring it back.
  const [asked] = useState(() => (victory !== null && isVictoryPlayable(progress, victory) ? victory : null));
  const before = useMemo(
    () => (asked === null ? null : progressBeforeVictory(progress, asked)),
    // The first answer is where the map starts; a later refresh only brings the new count.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- read once, on mount
    [asked],
  );
  const hasNext = asked !== null && progress.encounters.some((encounter) => encounter.order === asked + 1);
  const [phase, setPhase] = useState<VictoryPhase | null>(asked === null ? null : "rest");
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (asked === null) return;
    // Taken off the address so that going back (or reloading) does not play it again.
    const url = new URL(window.location.href);
    if (url.searchParams.has("victoria")) {
      url.searchParams.delete("victoria");
      window.history.replaceState(window.history.state, "", url);
    }

    // Without motion there is nothing to play: the map is at its end (the render below).
    if (reducedMotion) return;

    // The next phase after each one's duration; the last phase ends the chain. A phase with nothing to do
    // (the last page has no seam, no padlock and no token) is skipped.
    const skipped: readonly VictoryPhase[] = hasNext ? [] : ["seam", "unlock", "arrive", "token"];
    const steps = VICTORY_PHASES.filter((candidate) => !skipped.includes(candidate));
    const timers: number[] = [];
    let elapsed = 0;
    steps.slice(0, -1).forEach((step, index) => {
      elapsed += VICTORY_DURATIONS[step];
      timers.push(window.setTimeout(() => setPhase(steps[index + 1]!), elapsed));
    });
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [asked, hasNext, reducedMotion]);

  if (asked === null || before === null || phase === null || reducedMotion) return { progress, sequence: null };
  const sequence: VictorySequence = { order: asked, phase, hasNext };
  return { progress: progressAt(progress, before, sequence), sequence };
}

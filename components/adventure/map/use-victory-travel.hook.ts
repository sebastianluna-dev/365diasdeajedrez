import { useEffect, type RefObject } from "react";
import { VICTORY_DURATIONS, type VictoryPhase } from "@/components/adventure/map/use-victory-sequence.hook";
import type { AdventureLayout } from "@/lib/adventure/adventure.types";
import type { Travel } from "@/lib/adventure/map-geometry";

// The two steps of the victory that are not a class but a movement along the
// path: the seam sewn to the next rival with the needle leading, and the token
// hopping over it. Both are driven here, frame by frame, on the elements of
// the layer that is SHOWN (the other two layouts are `display: none`), and
// both end exactly where the final render puts the same elements, so the
// hand-over to React is not seen.

/** The ease the mockup moves the seam and the token with: slow, quick, slow. */
const easeInOut = (u: number) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);

const round = (value: number) => Math.round(value * 1000) / 1000;

/** Calls `frame` with the progress (0 to 1) of a run of `duration` ms on every animation frame; returns what stops it. */
function runFrames(duration: number, frame: (progress: number) => void): () => void {
  let handle = 0;
  const start = performance.now();
  const step = (now: number) => {
    const progress = Math.min(1, (now - start) / duration);
    frame(progress);
    if (progress < 1) handle = requestAnimationFrame(step);
  };
  handle = requestAnimationFrame(step);
  return () => cancelAnimationFrame(handle);
}

/** Whether the layer is the one shown: a hidden one has no box and nobody sees what moves in it. */
const isShown = (element: Element | null) => element !== null && element.getClientRects().length > 0;

interface SeamTravelOptions {
  phase: VictoryPhase;
  travel: Travel | null;
  layout: AdventureLayout;
  worldRef: RefObject<HTMLDivElement | null>;
  /** The mask's path: its dash offset uncovers the sewn stretch. */
  maskRef: RefObject<SVGPathElement | null>;
  needleRef: RefObject<SVGGElement | null>;
  needleThreadRef: RefObject<SVGPathElement | null>;
}

/**
 * Sews the stretch to the next rival during the `seam` phase: the mask
 * uncovers it, the needle runs ahead of the stitches and its thread follows.
 * When the two stamps do not fit the window together, the camera follows the
 * needle (the sequence is only played without «reducir movimiento», so the
 * scroll may move on its own).
 */
export function useSeamTravel({
  phase,
  travel,
  layout,
  worldRef,
  maskRef,
  needleRef,
  needleThreadRef,
}: SeamTravelOptions) {
  useEffect(() => {
    const world = worldRef.current;
    const mask = maskRef.current;
    if (phase !== "seam" || !travel || !world || !mask || !isShown(world)) return;

    const rect = world.getBoundingClientRect();
    const scale = rect.width / layout.width;
    const top = window.scrollY + rect.top;
    const from = travel.pointAt(0);
    const to = travel.pointAt(1);
    const follows = Math.abs(to.y - from.y) * scale > window.innerHeight * 0.5;

    return runFrames(VICTORY_DURATIONS.seam, (progress) => {
      const eased = easeInOut(progress);
      mask.style.strokeDashoffset = String(1 - eased);
      const needle = travel.needleAt(eased);
      needleRef.current?.setAttribute(
        "transform",
        `translate(${needle.x} ${needle.y}) rotate(${needle.rotation}) scale(${needle.scale})`,
      );
      needleThreadRef.current?.setAttribute("d", needle.thread);
      if (follows) window.scrollTo({ top: top + needle.y * scale - window.innerHeight * 0.55, behavior: "instant" });
    });
  }, [phase, travel, layout, worldRef, maskRef, needleRef, needleThreadRef]);
}

interface TokenTravelOptions {
  phase: VictoryPhase;
  travel: Travel | null;
  layout: AdventureLayout;
  /** The order of the rival just beaten: the token leaves its stamp for the next one's. */
  order: number | null;
  worldRef: RefObject<HTMLDivElement | null>;
  tokenRef: RefObject<HTMLSpanElement | null>;
}

/**
 * Hops the person's token along the seam from the rival beaten to the next
 * during the `token` phase: it follows the path, its offset beside each stamp
 * changes from one to the other, and it jumps four times on the way.
 */
export function useTokenTravel({ phase, travel, layout, order, worldRef, tokenRef }: TokenTravelOptions) {
  useEffect(() => {
    const token = tokenRef.current;
    if (phase !== "token" || !travel || order === null || !token || !isShown(worldRef.current)) return;

    const before = layout.token.byOrder[order] ?? layout.token.offset;
    const after = layout.token.byOrder[order + 1] ?? layout.token.offset;
    return runFrames(VICTORY_DURATIONS.token, (progress) => {
      const eased = easeInOut(progress);
      const point = travel.pointAt(eased);
      const hop = Math.abs(Math.sin(eased * Math.PI * 4)) * 22;
      const x = point.x + before[0] + (after[0] - before[0]) * eased;
      const y = point.y + before[1] + (after[1] - before[1]) * eased - hop;
      token.style.left = `${round((x / layout.width) * 100)}%`;
      token.style.top = `${round((y / layout.height) * 100)}%`;
    });
  }, [phase, travel, layout, order, worldRef, tokenRef]);
}

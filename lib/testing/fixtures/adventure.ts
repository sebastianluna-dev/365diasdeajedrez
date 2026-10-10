import { CUADERNO_DEL_VIAJERO } from "@/lib/adventure/adventures/cuaderno-del-viajero";
import { adventureBotSlug } from "@/lib/adventure/adventures";
import { botSeedOf } from "@/lib/chess/bots/roster";
import type { AdventureProgressView, EncounterStars, EncounterView } from "@/services/adventure/adventure.types";
import type { OpenGameSummary } from "@/services/play/play.types";
import { avatarOf } from "./bots";

// «El cuaderno del viajero» at any point of the story, for the stories of the
// adventure's screens. The progress is what `getAdventureProgress` gives
// (`AdventureProgressView`), built here from the content and a count instead
// of from games, so a story says «four beaten» and gets exactly that. Never
// read by the app.

/** What a story can say about where the person stands. */
export interface FixtureAdventureOptions {
  /** How many pages are written, 0 to 12; the next one is the available one. */
  beaten?: number;
  /** The stars each beaten page earned, in order; 3 for any that is not given. */
  stars?: readonly EncounterStars[];
  /** Games already lost or drawn against the available rival. */
  attemptsOnNext?: number;
  /**
   * The person's open game: against the available rival of the adventure
   * (`"adventure"`) or against a gallery bot, a free game (`"free"`).
   */
  openGame?: "adventure" | "free";
}

/** The adventure with `beaten` pages written, as the screens read it. */
export function fixtureAdventureProgress({
  beaten = 4,
  stars = [3, 2, 1, 3],
  attemptsOnNext = 0,
  openGame,
}: FixtureAdventureOptions = {}): AdventureProgressView {
  const adventure = CUADERNO_DEL_VIAJERO;
  const encounters: EncounterView[] = adventure.encounters.map((seed) => {
    const isBeaten = seed.order <= beaten;
    const isNext = seed.order === beaten + 1;
    const earned = isBeaten ? (stars[seed.order - 1] ?? 3) : 0;
    return {
      order: seed.order,
      state: isBeaten ? "beaten" : isNext ? "available" : "locked",
      attempts: isBeaten ? (earned === 3 ? 1 : earned === 2 ? 2 : 4) : isNext ? attemptsOnNext : 0,
      stars: earned,
      slug: seed.slug,
      botSlug: adventureBotSlug(adventure.slug, seed.slug),
      name: seed.name,
      role: seed.role,
      zone: seed.zone,
      zoneName: adventure.zones.find((zone) => zone.slug === seed.zone)?.name ?? "",
      place: seed.place,
      elo: botSeedOf(seed.strengthOf)?.elo ?? 0,
      difficulty: seed.difficulty,
      difficultyLabel: adventure.difficultyLabels[seed.difficulty],
      phrase: seed.phrase,
      opening: seed.opening,
      style: seed.style,
      keepsake: seed.keepsake,
      portrait: seed.portrait,
      isFinal: seed.isFinal === true,
      beatenAt: isBeaten ? new Date(Date.UTC(2026, 8, 14 + 7 * (seed.order - 1), 18)) : null,
      winPlies: isBeaten ? [48, 82, 104, 38, 66, 90, 72, 120, 84, 96, 110, 130][seed.order - 1]! : null,
    };
  });
  const current = encounters.find((encounter) => encounter.state === "available") ?? null;

  let open: OpenGameSummary | null = null;
  if (openGame === "adventure" && current) {
    open = {
      id: "open0001",
      rival: {
        kind: "bot",
        botId: 40 + current.order,
        name: current.name,
        slug: current.botSlug,
        elo: current.elo,
        title: null,
        avatar: avatarOf(current.name, current.botSlug, { country: "MEX" }),
      },
      color: "white",
      plyCount: 14,
    };
  } else if (openGame === "free") {
    open = {
      id: "open0002",
      rival: {
        kind: "bot",
        botId: 4,
        name: "Lupita",
        slug: "lupita",
        elo: 668,
        title: null,
        avatar: avatarOf("Lupita", "lupita", { country: "MEX" }),
      },
      color: "black",
      plyCount: 6,
    };
  }

  return {
    slug: adventure.slug,
    title: adventure.title,
    subtitle: adventure.subtitle,
    premise: adventure.premise,
    encounters,
    current,
    beaten,
    total: encounters.length,
    stars: encounters.reduce((sum, encounter) => sum + encounter.stars, 0),
    isComplete: beaten === encounters.length,
    openGame: open,
    openGameEncounter: openGame === "adventure" && current ? current.order : null,
  };
}

import type { AdventureOpeningSeed, AdventurePortraitSeed, ComingAdventureSeed } from "@/lib/adventure/adventure.types";
import type { OpenGameSummary } from "@/services/play/play.types";

// What the adventure screens read. The content comes from
// `lib/adventure/adventures/*`; what a person has done, from their played
// games: nothing here is stored.

/** Where a person stands with one rival. */
export type EncounterState = "beaten" | "available" | "locked";

/** The stars a beaten encounter earned: 3 at the first try, 2 at the second or third, 1 after. */
export type EncounterStars = 0 | 1 | 2 | 3;

/** What a person's games say about one encounter. */
export interface EncounterProgress {
  /** Its place in the story, 1 to 12. */
  order: number;
  state: EncounterState;
  /** Games that counted against this rival, up to the first win inclusive. */
  attempts: number;
  /** 0 until the rival is beaten. */
  stars: EncounterStars;
}

/** A rival as the map and its sheet draw it: the story's content with the person's progress. */
export interface EncounterView extends EncounterProgress {
  slug: string;
  /** The slug of the bot that plays it. */
  botSlug: string;
  name: string;
  role: string;
  zone: string;
  zoneName: string;
  place: string;
  /** The label of the strength it borrows. */
  elo: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  difficultyLabel: string;
  phrase: string;
  opening: AdventureOpeningSeed;
  style: string[];
  keepsake: string;
  portrait: AdventurePortraitSeed;
  isFinal: boolean;
  /** When the game that beat it ended; null until it is beaten. */
  beatenAt: Date | null;
  /** The half-moves of that game, for «Ganaste en 24 jugadas»; null until it is beaten. */
  winPlies: number | null;
}

/** One adventure for one person: every encounter with where they stand, and the totals. */
export interface AdventureProgressView {
  slug: string;
  title: string;
  subtitle: string;
  premise: string;
  encounters: EncounterView[];
  /** The one available to play next; null when the adventure is complete. */
  current: EncounterView | null;
  beaten: number;
  total: number;
  /** Stars earned over the most there are (3 each). */
  stars: number;
  isComplete: boolean;
  /** The person's open game against any bot, if they have one. */
  openGame: OpenGameSummary | null;
  /** The order of the encounter that open game plays, when it is this adventure's. */
  openGameEncounter: number | null;
}

/** A notebook of the shelf that can be opened, with how far the person is in it. */
export interface ShelfNotebook {
  slug: string;
  title: string;
  place: string;
  beaten: number;
  total: number;
  stars: number;
}

/** The adventure shelf: the notebooks to open and the ones that are not open yet. */
export interface AdventureShelfView {
  notebooks: ShelfNotebook[];
  coming: readonly ComingAdventureSeed[];
}

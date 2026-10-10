import type { BotGroupCode } from "@/constants/platform/play-codes.const";

// The shape of an adventure: a story told over a map, with its rivals. Pure
// data and no Prisma: the adventures are code, like `BOT_ROSTER`, and a new
// one is a seed file, an art file and a line in `adventures.ts`. How far a
// person has got is never stored here — it is derived from their games
// (`services/adventure`).

/** A zone of the story: a place of the map with its page of the notebook. */
export interface AdventureZoneSeed {
  /** Where the zone is in the art: `plaza`, `club`... Unique within the adventure. */
  slug: string;
  name: string;
  /** What kind of place it is, as copy. */
  kind: string;
  /** The title of the notebook's page read on arriving. */
  chapter: string;
  /** The page of the notebook, read on arriving. */
  note: string;
  /** Who signs the page and when. */
  signature: string;
  /** The page was torn out: it is drawn with a ragged edge. */
  torn?: boolean;
}

/** How a rival is drawn: the inputs of the generated portrait. */
export interface AdventurePortraitSeed {
  age: string;
  skin: string;
  hair: string;
  features: string[];
  clothing: string;
  background: string;
}

/** An opening a rival favours, in the notation the notebook is written in. */
export interface AdventureOpeningSeed {
  name: string;
  /** Spanish algebraic notation, as the card shows it: `1.e4 e5 2.Cf3 Cc6`. */
  moves: string;
}

export interface AdventureEncounterSeed {
  /** Its place in the story, 1 to 12 with no gaps. The map and the progress go by it. */
  order: number;
  /** The rival's address inside the adventure; the bot's slug is `<adventure>-<this>`. */
  slug: string;
  name: string;
  role: string;
  /** The zone it belongs to (`AdventureZoneSeed.slug`). */
  zone: string;
  /** Where in the zone the game is played. */
  place: string;
  /** The slug of the gallery bot whose strength this rival borrows. */
  strengthOf: string;
  /** 1 to 5, relative to this adventure. */
  difficulty: 1 | 2 | 3 | 4 | 5;
  phrase: string;
  opening: AdventureOpeningSeed;
  style: string[];
  /** What the rival leaves in the notebook when beaten. */
  keepsake: string;
  portrait: AdventurePortraitSeed;
  /** The last page: it opens only after the other eleven are beaten. */
  isFinal?: boolean;
}

/** A shelf entry for an adventure that is playable. */
export interface AdventureShelfSeed {
  /** Where it takes place, as copy: «La ciudad». */
  place: string;
}

export interface AdventureSeed {
  /** Its address: `/jugar/aventura/<slug>`, and the prefix of its bots' slugs. */
  slug: string;
  title: string;
  subtitle: string;
  premise: string;
  /** The hidden bot group its rivals belong to (`BOT_GROUP_LISTED` is false for it). */
  botGroup: BotGroupCode;
  /** What each difficulty is called, 1 to 5. */
  difficultyLabels: Record<1 | 2 | 3 | 4 | 5, string>;
  zones: AdventureZoneSeed[];
  encounters: AdventureEncounterSeed[];
  shelf: AdventureShelfSeed;
}

/** A notebook on the shelf that is not open yet: «Próximamente», with no date. */
export interface ComingAdventureSeed {
  slug: string;
  title: string;
  /** What it will explore, as copy. */
  reason: string;
}

// --- The art: where everything alive sits over the static scenery -------------

/** A point of the art, in its own units (x from the left, y from the top). */
export type ArtPoint = readonly [x: number, y: number];

/** A waypoint of the path; the third value is the encounter whose stamp sits on it. */
export type ArtPathStop = readonly [x: number, y: number, order?: number];

/** A zone's band of the art, from `from` to `to` on the y axis. */
export interface ArtZoneBand {
  zone: string;
  from: number;
  to: number;
  /** Drawn at night. */
  isNight?: boolean;
}

/** A page of the notebook: [x, y, rotation in degrees, width]. */
export type ArtPagePlacement = readonly [x: number, y: number, rotation: number, width: number];

/** A keepsake: [x, y, rotation in degrees, width]. */
export type ArtKeepsakePlacement = readonly [x: number, y: number, rotation: number, width: number];

/** A note in pencil: a short text and the arrow that points from it. */
export interface ArtPencilNote {
  text: string;
  x: number;
  y: number;
  rotation: number;
  arrow: readonly ArtPoint[];
  /** Font size, when the layout draws it other than by default. */
  size?: number;
  /** A light ink, for a note over a dark sky. */
  isLight?: boolean;
}

/** The note that points at the stamp of the encounter that is available. */
export interface ArtHint {
  x: number;
  y: number;
  rotation: number;
  arrow: readonly ArtPoint[];
}

/** One layout of the map: its own size, its own path, its own placements. */
export interface AdventureLayout {
  width: number;
  height: number;
  zones: ArtZoneBand[];
  /** Stamp widths: the others, the one available and the last. */
  stamp: { size: number; available: number; final: number };
  /** The tilt of each encounter's stamp, in degrees, by order. */
  tilt: Readonly<Record<number, number>>;
  /** The red seam: the width of its tape, the stitch spacing, the clear space around a stamp. */
  seam: { tape: number; stitch: number; clearance: number };
  /** The needle that leads the seam: its step, scale and tilt. */
  needle: { step: number; scale: number; tilt: number };
  path: readonly ArtPathStop[];
  /** Each zone's page, by zone slug. */
  pages: Readonly<Record<string, ArtPagePlacement>>;
  /** Where each keepsake is stuck, by order; only the ones the art has room drawn for. */
  keepsakes: Readonly<Record<number, ArtKeepsakePlacement>>;
  /** The player's token beside a stamp: its offset by order, and the default. */
  token: { byOrder: Readonly<Record<number, ArtPoint>>; offset: ArtPoint };
  /** The note that points at the stamp available, by order. */
  hints: Readonly<Record<number, ArtHint>>;
  /** Notes in pencil on the margins of the pages. */
  notes: readonly ArtPencilNote[];
  /** Where the journey starts (the «Salida» flag). */
  start: { x: number; y: number };
}

/** The cover's miniature of the whole journey: only a path over its own scenery. */
export interface AdventureMiniature {
  width: number;
  height: number;
  /** The viewBox: [x, y, width, height]. */
  viewBox: readonly [number, number, number, number];
  path: readonly ArtPathStop[];
}

/**
 * Where an adventure's live layer sits over its static art. Three layouts
 * picked by the viewport, and two miniatures for the cover: a tall one for
 * the open notebook and a wide one for phones.
 */
export interface AdventureArt {
  desktop: AdventureLayout;
  tablet: AdventureLayout;
  mobile: AdventureLayout;
  miniature: { tall: AdventureMiniature; wide: AdventureMiniature };
}

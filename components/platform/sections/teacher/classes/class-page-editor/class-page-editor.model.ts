import { INITIAL_FEN } from "chessops/fen";
import { writeDiagramPgn } from "@/lib/chess/diagram-notation";

// The blocks of the class editor (2026-10-19, option A of the editor canvas:
// one page, as in Notion), front-only: what the teacher writes lives in the
// editor's state and nothing stores it yet. The kinds are the editor's own
// and not the catalog's (`CLASS_BLOCK_KIND`): when the editor is wired to the
// database, each one maps to a row of that catalog, and the text kinds will
// likely share one.

export const TEXT_KINDS = ["text", "heading", "subheading", "list", "quote", "callout"] as const;
export type TextKind = (typeof TEXT_KINDS)[number];

export type EditorKind =
  TextKind | "divider" | "diagram" | "question" | "game" | "lesson" | "exercises" | "video" | "file";

/** A game a block can cite: who played it, where, and the position its small board shows. */
export interface EditorGame {
  id: string;
  white: string;
  black: string;
  event: string;
  result: string;
  /** The position its small board shows; a game cited without one draws no board. */
  fen?: string;
  /** Where «Abrir en el tablero» leads: the game in its study; without one, the analysis board. */
  href?: string;
}

export interface EditorLesson {
  id: string;
  title: string;
  /** «Finales de torres · 2»; none when the page does not know it. */
  course?: string;
}

/** A series of the exercise bank, by the titles of its exercises. */
export interface EditorSeries {
  id: string;
  title: string;
  exercises: string[];
}

export interface EditorFile {
  name: string;
  /** «240 KB»; none for a file already in the class. */
  size?: string;
}

/** An option of an «Ahora tú» question, with the line the student reads on choosing it. */
export interface QuestionOption {
  id: string;
  label: string;
  why: string;
  correct: boolean;
}

/** A block is the class's content, all of it, with no section of its own: who sees what is no longer the block's to say. */
interface BlockBase {
  id: string;
}

export type EditorBlock = BlockBase &
  (
    | { kind: TextKind; text: string; lead?: boolean }
    | { kind: "divider" }
    /** The position, the caption and its marks, as one PGN (`lib/chess/diagram-notation`). */
    | { kind: "diagram"; pgn: string }
    | { kind: "question"; fen: string; orientation: "white" | "black"; prompt: string; options: QuestionOption[] }
    /** `null` until the teacher picks one: the block is then a picker. */
    | { kind: "game"; game: EditorGame | null }
    | { kind: "lesson"; lesson: EditorLesson | null }
    | { kind: "exercises"; series: EditorSeries | null }
    | { kind: "video"; url: string | null }
    | { kind: "file"; file: EditorFile | null }
  );

export type TextBlock = Extract<EditorBlock, { kind: TextKind }>;

/** What a class block can cite, the suggestions of the pickers. */
export interface ClassPageEditorOptions {
  games: EditorGame[];
  lessons: EditorLesson[];
  series: EditorSeries[];
}

export type BlockGroup = "Texto" | "Ajedrez" | "Práctica" | "Referencias";

export interface BlockKindInfo {
  kind: EditorKind;
  group: BlockGroup;
  label: string;
  /** The line under its name in the «/» menu. */
  hint: string;
  /** More words the «/» menu finds it by, without accents. */
  words: string;
}

export const BLOCK_GROUPS: BlockGroup[] = ["Texto", "Ajedrez", "Práctica", "Referencias"];

/** Every kind the «/» menu offers, in its order. */
export const BLOCK_KINDS: BlockKindInfo[] = [
  { kind: "text", group: "Texto", label: "Texto", hint: "Un párrafo del artículo", words: "parrafo" },
  { kind: "heading", group: "Texto", label: "Título", hint: "Abre una sección · «# »", words: "seccion" },
  { kind: "subheading", group: "Texto", label: "Subtítulo", hint: "Una parte de la sección · «## »", words: "" },
  { kind: "list", group: "Texto", label: "Lista", hint: "Un punto de una lista · «- »", words: "punto vineta" },
  { kind: "quote", group: "Texto", label: "Cita", hint: "Lo que dijo alguien · «> »", words: "" },
  { kind: "callout", group: "Texto", label: "Destacado", hint: "Una nota que resalta", words: "nota aviso" },
  { kind: "divider", group: "Texto", label: "Separador", hint: "Una raya entre dos partes", words: "linea raya" },
  {
    kind: "diagram",
    group: "Ajedrez",
    label: "Diagrama",
    hint: "Un tablero con flechas, que no se mueve",
    words: "tablero posicion flechas",
  },
  { kind: "game", group: "Ajedrez", label: "Partida", hint: "Una partida, con su tablero aparte", words: "pgn" },
  {
    kind: "question",
    group: "Práctica",
    label: "Ahora tú",
    hint: "Una pregunta con opciones",
    words: "pregunta quiz opciones",
  },
  { kind: "exercises", group: "Práctica", label: "Ejercicios", hint: "Para resolver en el tablero", words: "serie" },
  { kind: "lesson", group: "Referencias", label: "Lección", hint: "Una lección de un curso", words: "curso" },
  { kind: "video", group: "Referencias", label: "Video", hint: "De YouTube o Vimeo", words: "youtube vimeo" },
  { kind: "file", group: "Referencias", label: "Archivo", hint: "Un PDF o una imagen", words: "pdf imagen" },
];

export function kindInfo(kind: EditorKind): BlockKindInfo {
  return BLOCK_KINDS.find((info) => info.kind === kind) ?? (BLOCK_KINDS[0] as BlockKindInfo);
}

export function isTextKind(kind: EditorKind): kind is TextKind {
  return (TEXT_KINDS as readonly string[]).includes(kind);
}

export function isTextBlock(block: EditorBlock): block is TextBlock {
  return isTextKind(block.kind);
}

/** Lower case and without accents: «Lección» is found by «leccion». */
function folded(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** The kinds the «/» menu shows for what was typed after the slash, in the menu's order. */
export function matchKinds(query: string): BlockKindInfo[] {
  const wanted = folded(query.trim());
  if (!wanted) return BLOCK_KINDS;
  return BLOCK_KINDS.filter((info) => folded(`${info.label} ${info.words}`).includes(wanted));
}

const SHORTCUTS: [prefix: string, kind: TextKind][] = [
  ["## ", "subheading"],
  ["# ", "heading"],
  ["- ", "list"],
  ["* ", "list"],
  ["> ", "quote"],
];

/**
 * The kind a paragraph turns into when it starts with a markdown mark and a
 * space, and what is left of its text; null for any other text. A
 * contenteditable types the space as a no-break space, which counts.
 */
export function markdownShortcut(text: string): { kind: TextKind; rest: string } | null {
  const plain = text.replace(/ /g, " ");
  const found = SHORTCUTS.find(([prefix]) => plain.startsWith(prefix));
  return found ? { kind: found[1], rest: plain.slice(found[0].length) } : null;
}

/** A new, empty block of a kind. */
export function newBlock(kind: EditorKind, makeId: () => string): EditorBlock {
  const base = { id: makeId() };
  if (isTextKind(kind)) return { ...base, kind, text: "" };
  switch (kind) {
    case "divider":
      return { ...base, kind };
    case "diagram":
      return {
        ...base,
        kind,
        pgn: writeDiagramPgn({ fen: INITIAL_FEN, orientation: "white", caption: "", circles: [], arrows: [] }),
      };
    case "question":
      return {
        ...base,
        kind,
        fen: INITIAL_FEN,
        orientation: "white",
        prompt: "",
        options: [
          { id: makeId(), label: "", why: "", correct: true },
          { id: makeId(), label: "", why: "", correct: false },
        ],
      };
    case "game":
      return { ...base, kind, game: null };
    case "lesson":
      return { ...base, kind, lesson: null };
    case "exercises":
      return { ...base, kind, series: null };
    case "video":
      return { ...base, kind, url: null };
    case "file":
      return { ...base, kind, file: null };
  }
}

/**
 * The block turned into another kind of text, keeping its id and its words;
 * only a paragraph opens the article in larger type.
 */
export function convertText(block: TextBlock, kind: TextKind, text = block.text): TextBlock {
  return { id: block.id, kind, text };
}

/** The list with `block` after the block `afterId`, or at the end when `afterId` is null. */
export function insertAfter(blocks: EditorBlock[], afterId: string | null, block: EditorBlock): EditorBlock[] {
  const index = afterId === null ? -1 : blocks.findIndex((item) => item.id === afterId);
  if (index < 0) return [...blocks, block];
  return [...blocks.slice(0, index + 1), block, ...blocks.slice(index + 1)];
}

/**
 * The list with a dragged block in the place of the one it was dropped on,
 * as dnd-kit says a move (`SortableDnd`'s `onMove`): moving down it lands
 * after that block, moving up, before it.
 */
export function moveTo(blocks: EditorBlock[], id: string, overId: string): EditorBlock[] {
  const from = blocks.findIndex((item) => item.id === id);
  const to = blocks.findIndex((item) => item.id === overId);
  if (from < 0 || to < 0 || from === to) return blocks;
  const next = [...blocks];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved as EditorBlock);
  return next;
}

/** A copy of a block right after it, with ids of its own (its options' too). */
export function duplicateBlock(blocks: EditorBlock[], id: string, makeId: () => string): EditorBlock[] {
  const original = blocks.find((item) => item.id === id);
  if (!original) return blocks;
  const copy: EditorBlock =
    original.kind === "question"
      ? { ...original, id: makeId(), options: original.options.map((option) => ({ ...option, id: makeId() })) }
      : { ...structuredClone(original), id: makeId() };
  return insertAfter(blocks, id, copy);
}

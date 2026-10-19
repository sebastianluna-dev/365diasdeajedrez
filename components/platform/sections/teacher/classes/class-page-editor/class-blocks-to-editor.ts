import { writeDiagramPgn } from "@/lib/chess/diagram-notation";
import { finalFenOf } from "@/lib/chess/replay";
import type { ClassBlockView } from "@/services/classes/classes.types";
import type {
  PickableExercise,
  ReferenceableGameGroup,
  TeacherClassBlock,
} from "@/services/teacher-classes/teacher-classes.types";
import type { ClassPageEditorOptions, EditorBlock, EditorGame } from "./class-page-editor.model";

// The class's stored blocks read into the editor (2026-10-19, front-only):
// the editor starts from what the class has, all of it as one content with no
// sections, and nothing it does is stored back. Each stored kind becomes the
// editor's closest one; a block's title becomes a heading over it, its caption
// a paragraph under it.

/** «Luis M. – Sofía R.» into its two players; a label without the dash is the white side's alone. */
function playersOf(label: string): { white: string; black: string } {
  const [white = label, black = ""] = label.split(/\s+[–-]\s+/);
  return { white, black };
}

function fenOf(pgn: string): string | undefined {
  try {
    return finalFenOf(pgn);
  } catch {
    return undefined;
  }
}

/** A text's paragraphs, each one a block: a blank line parts them. */
function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((part) => part.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

function blocksOf(view: ClassBlockView): EditorBlock[] {
  const id = view.id;
  const heading: EditorBlock[] =
    view.title && view.kind === "TEXT" ? [{ id: `${id}:title`, kind: "heading", text: view.title }] : [];
  const caption: EditorBlock[] =
    view.caption && view.kind !== "POSITION_REF" ? [{ id: `${id}:caption`, kind: "text", text: view.caption }] : [];

  switch (view.kind) {
    case "TEXT":
      return [
        ...heading,
        ...paragraphs(view.text).map((text, index): EditorBlock => ({ id: `${id}:${index}`, kind: "text", text })),
      ];
    case "VIDEO":
      return [{ id, kind: "video", url: view.videoUrl }, ...caption];
    case "GAME_REF": {
      const { game } = view;
      const names = game.players
        ? { white: game.players.white.name, black: game.players.black.name }
        : playersOf(game.label);
      return [
        {
          id,
          kind: "game",
          game: {
            id: game.id,
            ...names,
            event: game.players ? game.label : "",
            result: game.result ?? "",
            fen: fenOf(game.pgn),
            href: game.href,
          },
        },
        ...caption,
      ];
    }
    case "LESSON_REF":
      if (view.lesson.missing) return caption;
      return [{ id, kind: "lesson", lesson: { id: view.lesson.id, title: view.lesson.name } }, ...caption];
    case "POSITION_REF":
      return [
        {
          id,
          kind: "diagram",
          pgn: writeDiagramPgn({
            fen: view.position.fen,
            orientation: view.position.orientation,
            caption: view.caption ?? view.position.title ?? "",
            circles: [],
            arrows: [],
          }),
        },
      ];
    case "FILE":
      return [{ id, kind: "file", file: { name: view.title ?? "Archivo" } }, ...caption];
    case "EXERCISE":
      return [
        {
          id,
          kind: "exercises",
          series: {
            id,
            title: view.title ?? "Ejercicios de la clase",
            exercises: view.exercises.map((item) => item.title),
          },
        },
        ...caption,
      ];
  }
}

/**
 * The class's blocks as the editor's, in the class's order: every block,
 * whichever section it was stored in, since the class is one content now.
 */
export function editorBlocksOf(blocks: TeacherClassBlock[], views: ClassBlockView[]): EditorBlock[] {
  const byId = new Map(views.map((view) => [view.id, view]));
  return [...blocks]
    .sort((a, b) => a.order - b.order)
    .flatMap((block) => {
      const view = byId.get(block.id);
      return view ? blocksOf(view) : [];
    });
}

/** What the editor's pickers offer from what the page has: the teacher's games and exercises (no lessons yet). */
export function editorOptionsOf(
  games: ReferenceableGameGroup[],
  exercises: PickableExercise[],
): ClassPageEditorOptions {
  return {
    games: games.flatMap((group) =>
      group.games.map((game): EditorGame => ({
        id: game.id,
        ...playersOf(game.label),
        event: `${group.ownerLabel} · ${group.studyName}`,
        result: "",
      })),
    ),
    lessons: [],
    series: exercises.map((exercise) => ({ id: exercise.id, title: exercise.title, exercises: [exercise.title] })),
  };
}

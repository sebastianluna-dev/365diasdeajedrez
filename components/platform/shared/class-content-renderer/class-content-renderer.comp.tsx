import Link from "next/link";
import { ArrowUpRightFromSquareIcon } from "@/components/icons/arrow-up-right-from-square-icon.comp";
import { BookOpenIcon } from "@/components/icons/book-open-icon.comp";
import { ChessKnightIcon } from "@/components/icons/chess-knight-icon.comp";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { CircleXmarkIcon } from "@/components/icons/circle-xmark-icon.comp";
import { ParagraphIcon } from "@/components/icons/paragraph-icon.comp";
import { PuzzlePieceIcon } from "@/components/icons/puzzle-piece-icon.comp";
import { VideoIcon } from "@/components/icons/video-icon.comp";
import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import {
  ClassGameSave,
  type SaveClassGameAction,
} from "@/components/platform/shared/class-game-save/class-game-save.comp";
import { CLASS_BLOCK_VISIBILITY, type ClassBlockVisibilityCode } from "@/constants/platform/class-codes.const";
import type { ClassBlockExerciseView, ClassBlockView } from "@/services/classes/classes.types";
import "./class-content-renderer.comp.css";

interface ClassContentRendererProps {
  blocks: ClassBlockView[];
  /**
   * `none` (default): the blocks one after the other, in their order.
   * `byVisibility`: a `<details>` per visibility — «Para preparar», «Después
   * de la clase», «Guion del profesor» —, the script folded: for whoever sees
   * every block (the staff's sheet).
   */
  groups?: "none" | "byVisibility";
  /** With it, «Guardar en un estudio» under each game: the student's studies and the action, bound to the class. */
  saveGame?: SaveGameOffer;
}

export interface SaveGameOffer {
  classId: string;
  studies: { id: string; name: string }[];
  action: SaveClassGameAction;
}

const KIND_ICONS = {
  TEXT: ParagraphIcon,
  VIDEO: VideoIcon,
  GAME_REF: ChessKnightIcon,
  LESSON_REF: BookOpenIcon,
  POSITION_REF: ChessKnightIcon,
  FILE: ParagraphIcon,
  EXERCISE: PuzzlePieceIcon,
} as const;

/** The heading a block gets without a title of its own: the material's name, or the kind's word. */
function headingOf(block: ClassBlockView): string {
  if (block.title) return block.title;
  switch (block.kind) {
    case "GAME_REF":
      return block.game.label;
    case "LESSON_REF":
      return block.lesson.name;
    case "POSITION_REF":
      return block.position.title ?? "Posición";
    case "VIDEO":
      return "Video";
    case "FILE":
      return "Archivo";
    case "EXERCISE":
      return block.exercises.length === 1 ? "Ejercicio" : "Ejercicios";
    default:
      return "Nota";
  }
}

const GROUP_LABELS: Record<ClassBlockVisibilityCode, string> = {
  [CLASS_BLOCK_VISIBILITY.BEFORE]: "Para preparar",
  [CLASS_BLOCK_VISIBILITY.AFTER]: "Después de la clase",
  [CLASS_BLOCK_VISIBILITY.TEACHER]: "Guion del profesor",
};

const GROUP_ORDER: ClassBlockVisibilityCode[] = [
  CLASS_BLOCK_VISIBILITY.BEFORE,
  CLASS_BLOCK_VISIBILITY.AFTER,
  CLASS_BLOCK_VISIBILITY.TEACHER,
];

function TextBlock({ text }: { text: string }) {
  // The block's text is simple markdown; at this stage it is rendered as plain
  // paragraphs ("## " lines are treated as subheadings). A blank line is
  // looked for with CR or without: a form sends a textarea's line breaks as
  // CRLF, and blocks saved before the form helpers turned them into LF still
  // have them.
  const paragraphs = text.split(/(?:\r?\n){2,}/);
  return (
    <div className="class-content__text">
      {paragraphs.map((paragraph, index) =>
        paragraph.startsWith("## ") ? (
          <h4 key={index} className="class-content__text-heading">
            {paragraph.slice(3)}
          </h4>
        ) : (
          <p key={index} className="class-content__text-paragraph">
            {paragraph}
          </p>
        ),
      )}
    </div>
  );
}

/**
 * One exercise of an EXERCISE block (D29): the start drawn small, its number,
 * title and facts, and, for the student, their mark in THIS block — «Resuelto»
 * or «Fallado», always written beside its icon — and «Resolver», which opens
 * it under the class's address («Volver a ver» once it is solved: the way in
 * is the same, the verb is not). The teacher and the staff read the same row
 * with the count instead («2 de 3 lo resolvieron») and no way to solve.
 */
function ExerciseRow({ item }: { item: ClassBlockExerciseView }) {
  return (
    <li className="class-content__exercise">
      <span className="class-content__exercise-diagram">
        <StaticDiagram fen={item.startFen} orientation={item.orientation} />
      </span>
      <span className="class-content__exercise-body">
        <span className="class-content__exercise-title">
          {item.n}. {item.title}
        </span>
        <span className="class-content__exercise-facts">
          {item.facts}
          {item.solvedLabel && ` · ${item.solvedLabel}`}
        </span>
        {item.unavailable && (
          <span className="platform-tag platform-tag_variant_warning class-content__exercise-tag">
            Ya no está disponible
          </span>
        )}
      </span>
      {item.mark === "solved" && (
        <span className="class-content__exercise-mark class-content__exercise-mark_state_solved">
          <CircleCheckIcon variant="classic-solid" className="class-content__exercise-mark-icon" />
          Resuelto
        </span>
      )}
      {item.mark === "failed" && (
        <span className="class-content__exercise-mark class-content__exercise-mark_state_failed">
          <CircleXmarkIcon variant="classic-solid" className="class-content__exercise-mark-icon" />
          Fallado
        </span>
      )}
      {item.href && (
        <Link href={item.href} className="platform-button platform-button_size_sm class-content__exercise-action">
          {item.mark === "solved" ? "Volver a ver" : "Resolver"}
        </Link>
      )}
    </li>
  );
}

function Block({ block, saveGame }: { block: ClassBlockView; saveGame?: SaveGameOffer }) {
  const Icon = KIND_ICONS[block.kind];
  const headingId = `bloque-${block.id}`;
  return (
    <article
      className={`class-content__block class-content__block_kind_${block.kind.toLowerCase()}`}
      aria-labelledby={headingId}
    >
      <header className="class-content__head">
        <Icon className="class-content__kind-icon" />
        <h3 id={headingId} className="class-content__title">
          {headingOf(block)}
        </h3>
        {block.isNew && <span className="platform-tag platform-tag_variant_accent">Nuevo</span>}
      </header>
      {block.caption && block.kind !== "POSITION_REF" && <p className="class-content__caption">{block.caption}</p>}

      {block.kind === "TEXT" && <TextBlock text={block.text} />}

      {block.kind === "VIDEO" && (
        <a href={block.videoUrl} target="_blank" rel="noreferrer" className="class-content__link-card">
          <span className="class-content__link-label">{block.caption ?? block.videoUrl}</span>
          <ArrowUpRightFromSquareIcon variant="classic-solid" className="class-content__link-icon" />
          <span className="class-content__sr">(se abre en una pestaña nueva)</span>
        </a>
      )}

      {block.kind === "GAME_REF" && (
        <div className="class-content__game">
          <GameViewer
            pgn={block.game.pgn}
            title={block.game.label}
            initialPath={block.game.movePath}
            orientation={block.game.orientation}
            players={block.game.players}
            result={block.game.result}
            pinnedComment={block.game.pinnedComment}
            hideNextMoves={block.game.conceal}
          />
          {(block.game.href || saveGame) && (
            <div className="class-content__game-actions">
              {block.game.href && (
                <Link href={block.game.href} className="class-content__game-link">
                  Abrir la partida
                </Link>
              )}
              {saveGame && (
                <ClassGameSave
                  classId={saveGame.classId}
                  blockId={block.id}
                  title={block.game.label}
                  studies={saveGame.studies}
                  action={saveGame.action}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* The lesson is viewed INSIDE the class, just like the game: the
          link stays below to open it in full with its navigation. */}
      {block.kind === "LESSON_REF" &&
        (block.lesson.missing ? (
          <p className="class-content__missing">La lección que citaba este bloque ya no existe.</p>
        ) : (
          <div className="class-content__game">
            <GameViewer
              pgn={block.lesson.pgn}
              title={block.lesson.name}
              orientation={block.lesson.orientation}
              initialPath={block.lesson.movePath}
            />
            <Link href={block.lesson.href} className="class-content__game-link">
              Abrir la lección
            </Link>
          </div>
        ))}

      {block.kind === "POSITION_REF" && (
        <StaticDiagram
          fen={block.position.fen}
          orientation={block.position.orientation}
          caption={block.caption ?? block.position.title}
        />
      )}

      {block.kind === "FILE" && (
        <div className="class-content__link-card">
          <span className="class-content__link-label">{block.caption ?? "Material de la clase"}</span>
        </div>
      )}

      {block.kind === "EXERCISE" && (
        <ol className="class-content__exercises">
          {block.exercises.map((item) => (
            <ExerciseRow key={item.id} item={item} />
          ))}
        </ol>
      )}
    </article>
  );
}

/**
 * A class's material, block by block in its order, each an article with the
 * icon of its kind, its heading and its lead: text as paragraphs, a video as
 * an outgoing link, a game and a lesson inside `GameViewer` (with the game's
 * players and result when its record has them, and with its next moves
 * hidden when its study says so), a position as a `StaticDiagram`, and the
 * exercises of an EXERCISE block as rows with the student's mark and
 * «Resolver» (D29). The chess blocks are references to the original
 * material, not copies; with `saveGame`, the student may copy a game into a
 * study of their own. A block the teacher added after the class started wears
 * «Nuevo».
 *
 * No `"use client"` and no reads, so it is also mounted inside a client
 * component.
 */
export function ClassContentRenderer({ blocks, groups = "none", saveGame }: ClassContentRendererProps) {
  if (groups === "byVisibility") {
    return (
      <div className="class-content class-content_groups_visibility">
        {GROUP_ORDER.map((visibility) => {
          const own = blocks.filter((block) => block.visibility === visibility);
          if (own.length === 0) return null;
          return (
            <details
              key={visibility}
              className="class-content__group"
              open={visibility !== CLASS_BLOCK_VISIBILITY.TEACHER}
            >
              <summary className="class-content__group-summary">
                {GROUP_LABELS[visibility]}
                <span className="class-content__group-count">{own.length}</span>
              </summary>
              <div className="class-content__group-body">
                {own.map((block) => (
                  <Block key={block.id} block={block} saveGame={saveGame} />
                ))}
              </div>
            </details>
          );
        })}
      </div>
    );
  }
  return (
    <div className="class-content">
      {blocks.map((block) => (
        <Block key={block.id} block={block} saveGame={saveGame} />
      ))}
    </div>
  );
}

import Link from "next/link";
import { ArrowUpRightFromSquareIcon } from "@/components/icons/arrow-up-right-from-square-icon.comp";
import { BookOpenIcon } from "@/components/icons/book-open-icon.comp";
import { ChessKnightIcon } from "@/components/icons/chess-knight-icon.comp";
import { ParagraphIcon } from "@/components/icons/paragraph-icon.comp";
import { VideoIcon } from "@/components/icons/video-icon.comp";
import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import { CLASS_BLOCK_VISIBILITY, type ClassBlockVisibilityCode } from "@/constants/platform/class-codes.const";
import type { ClassBlockView } from "@/services/classes/classes.types";
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
}

const KIND_ICONS = {
  TEXT: ParagraphIcon,
  VIDEO: VideoIcon,
  GAME_REF: ChessKnightIcon,
  LESSON_REF: BookOpenIcon,
  POSITION_REF: ChessKnightIcon,
  FILE: ParagraphIcon,
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

function Block({ block }: { block: ClassBlockView }) {
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
          {block.game.href && (
            <Link href={block.game.href} className="class-content__game-link">
              Abrir la partida en Mis estudios
            </Link>
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
    </article>
  );
}

/**
 * A class's material, block by block in its order, each an article with the
 * icon of its kind, its heading and its lead: text as paragraphs, a video as
 * an outgoing link, a game and a lesson inside `GameViewer` (with the game's
 * players and result when its record has them, and with its next moves
 * hidden when its study says so), a position as a `StaticDiagram`. The chess
 * blocks are references to the original material, not copies. A block the
 * teacher added after the class started wears «Nuevo».
 *
 * No `"use client"` and no reads, so it is also mounted inside a client
 * component.
 */
export function ClassContentRenderer({ blocks, groups = "none" }: ClassContentRendererProps) {
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
                  <Block key={block.id} block={block} />
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
        <Block key={block.id} block={block} />
      ))}
    </div>
  );
}

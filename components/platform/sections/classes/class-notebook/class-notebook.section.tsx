import Link from "next/link";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import { ArrowLeftIcon } from "@/components/icons/arrow-left-icon.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { WhatsappIcon } from "@/components/icons/whatsapp-icon.comp";
import { CopyLinkButton } from "@/components/platform/shared/copy-link-button/copy-link-button.comp";
import { meetingJoinState } from "@/components/platform/shared/meeting-join-card/meeting-join-card.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import {
  PlatformSideNav,
  type PlatformSideNavLink,
} from "@/components/platform/shared/platform-side-nav/platform-side-nav.comp";
import type { StaticDiagramTone } from "@/components/chess/static-diagram-arrows";
import { readDiagramPgn, type DiagramColor } from "@/lib/chess/diagram-notation";
import { finalFenOf } from "@/lib/chess/replay";
import { mdButton, mdIconButton } from "@/lib/material/material-classes";
import { platformRoutes } from "@/lib/platform-routes";
import { joinSpanish } from "@/services/shared/class-rules";
import type { ClassBlockView, ClassDetailView } from "@/services/classes/classes.types";
import { ClassJoinSide } from "./class-join-side.comp";
import { NOTEBOOK_SAMPLE, type NotebookSampleBlock } from "./class-notebook.sample";
import { NotebookProgress, NotebookProgressBar, NotebookQuestion } from "./notebook-progress.comp";
import "./class-notebook.section.css";

interface ClassNotebookSectionProps {
  classDetail: ClassDetailView;
  notice?: string;
  errorMessage?: string;
}

type NotebookBlock = ClassBlockView | NotebookSampleBlock;
type ExerciseBlock = Extract<ClassBlockView, { kind: "EXERCISE" }>;

/** How a diagram's colours are painted: the board's four tones. */
const DIAGRAM_TONE: Record<DiagramColor, StaticDiagramTone> = {
  green: "success",
  red: "danger",
  blue: "info",
  yellow: "warning",
};

/** The anchor of a block in the article, for the index of the side column. */
const anchorOf = (block: { id: string }) => `bloque-${block.id}`;

/** The anchors of the side column's fixed entries. */
const QUESTIONS_ANCHOR = "ahora-tu";
const TAKEAWAYS_ANCHOR = "lo-que-te-llevas";

/** «Jueves 22 de octubre · 18:00», in the class's time zone. */
function dateline(classDetail: ClassDetailView): string {
  const start = new Date(classDetail.startIso);
  const day = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: classDetail.timeZone,
  }).format(start);
  const hour = new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: classDetail.timeZone,
  }).format(start);
  return `${day} · ${hour}`;
}

/** Minutes to read the article's text, at 200 words a minute; at least one. */
function readingMinutes(blocks: NotebookBlock[]): number {
  const words = blocks
    .flatMap((block) => (block.kind === "TEXT" ? [block.text] : block.kind === "ARTICLE_TEXT" ? block.paragraphs : []))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** «Posición · juegan blancas», from the FEN's side to move. */
function positionLabel(fen: string): string {
  return `Posición · juegan ${fen.split(" ")[1] === "b" ? "negras" : "blancas"}`;
}

/** The heading a block opens with in the article, if it has one: what the index lists. */
function headingOf(block: NotebookBlock): string | null {
  if (block.kind === "ARTICLE_TEXT") return block.heading ?? null;
  if (block.kind === "TEXT" || block.kind === "GAME_REF") return block.title ?? null;
  return null;
}

/** A teacher's text block as headings («## ») and paragraphs. */
function TextBlock({ text }: { text: string }) {
  const parts = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
  return (
    <>
      {parts.flatMap((part, index) =>
        part.split("\n").map((line, lineIndex) =>
          line.startsWith("## ") ? (
            <h2 key={`${index}-${lineIndex}`} className="class-notebook__heading">
              {line.slice(3)}
            </h2>
          ) : line.trim() ? (
            <p key={`${index}-${lineIndex}`} className="class-notebook__paragraph">
              {line}
            </p>
          ) : null,
        ),
      )}
    </>
  );
}

/** A block's heading, with the anchor the index leads to. */
function BlockHeading({ block, text }: { block: { id: string }; text: string }) {
  return (
    <h2 id={anchorOf(block)} className="class-notebook__heading">
      {text}
    </h2>
  );
}

/** One block of the article, in the notebook's reading style. */
function NotebookBlockView({
  block,
  questionPosition,
  questionAnchor,
}: {
  block: NotebookBlock;
  questionPosition: string;
  questionAnchor?: string;
}) {
  switch (block.kind) {
    case "ARTICLE_TEXT":
      return (
        <>
          {block.heading && <BlockHeading block={block} text={block.heading} />}
          {block.paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className={`class-notebook__paragraph${block.lead ? " class-notebook__paragraph_role_lead" : ""}`}
            >
              {paragraph}
            </p>
          ))}
        </>
      );
    case "TEXT":
      return (
        <>
          {block.title && <BlockHeading block={block} text={block.title} />}
          <TextBlock text={block.text} />
        </>
      );
    case "DIAGRAM": {
      const diagram = readDiagramPgn(block.pgn);
      if (!diagram) return null;
      return (
        <figure className="class-notebook__figure">
          <p className="class-notebook__label">{positionLabel(diagram.fen)}</p>
          <div className="class-notebook__figure-board">
            <StaticDiagram
              fen={diagram.fen}
              orientation={diagram.orientation}
              look="material"
              arrows={diagram.arrows.map((arrow) => ({
                from: arrow.from,
                to: arrow.to,
                tone: DIAGRAM_TONE[arrow.color],
              }))}
              circles={diagram.circles.map((circle) => ({ square: circle.square, tone: DIAGRAM_TONE[circle.color] }))}
            />
          </div>
          {diagram.caption && (
            <figcaption className="class-notebook__caption">
              <strong>{block.label}</strong> {diagram.caption}
            </figcaption>
          )}
        </figure>
      );
    }
    case "POSITION_REF":
      return (
        <figure className="class-notebook__figure">
          <p className="class-notebook__label">{positionLabel(block.position.fen)}</p>
          <div className="class-notebook__figure-board">
            <StaticDiagram fen={block.position.fen} orientation={block.position.orientation} look="material" />
          </div>
          {(block.position.title ?? block.caption) && (
            <figcaption className="class-notebook__caption">{block.position.title ?? block.caption}</figcaption>
          )}
        </figure>
      );
    case "QUESTION":
      return <NotebookQuestion question={block} position={questionPosition} anchorId={questionAnchor} />;
    case "GAME_REF": {
      const { game } = block;
      const href = game.href ?? platformRoutes.analysisBoard({ fen: finalFenOf(game.pgn) });
      const players = game.players ? `${game.players.white.name} – ${game.players.black.name}` : game.label;
      return (
        <>
          {block.title && <BlockHeading block={block} text={block.title} />}
          {block.caption && <p className="class-notebook__paragraph">{block.caption}</p>}
          <div className="class-notebook__widget">
            <div className="class-notebook__widget-board">
              <StaticDiagram fen={finalFenOf(game.pgn)} orientation={game.orientation ?? "white"} look="material" />
            </div>
            <div className="class-notebook__widget-text">
              <strong className="class-notebook__widget-title">{players}</strong>
              <span className="class-notebook__widget-meta">
                {game.result ? `${game.result} · ` : ""}Partida
                {game.pinnedComment ? ` · «${game.pinnedComment}»` : ""}
              </span>
            </div>
            <Link href={href} className={`${mdButton("tonal", "sm")} class-notebook__widget-action`}>
              Abrir en el tablero
            </Link>
          </div>
        </>
      );
    }
    case "LESSON_REF":
      return block.lesson.missing ? (
        <p className="class-notebook__muted">La lección que citaba este bloque ya no existe.</p>
      ) : (
        <Link href={block.lesson.href} className="class-notebook__card-link">
          <span className="class-notebook__label">Lección</span>
          <strong className="class-notebook__card-title">{block.lesson.name}</strong>
          <span className="class-notebook__card-action">
            Ir a la lección
            <ChevronRightIcon variant="classic-solid" className="class-notebook__card-icon" />
          </span>
        </Link>
      );
    case "EXERCISE":
      return <ExercisesCard block={block} />;
    case "VIDEO":
      return (
        <a href={block.videoUrl} target="_blank" rel="noreferrer" className="class-notebook__card-link">
          <span className="class-notebook__label">Video</span>
          <strong className="class-notebook__card-title">{block.title ?? block.caption ?? "Video de la clase"}</strong>
          <span className="class-notebook__card-action">
            Ver el video
            <ChevronRightIcon variant="classic-solid" className="class-notebook__card-icon" />
          </span>
          <span className="class-notebook__sr">(se abre en una pestaña nueva)</span>
        </a>
      );
    case "FILE":
      return <p className="class-notebook__muted">{block.caption ?? "Material de la clase"}</p>;
  }
}

/**
 * An EXERCISE block as a card of the panel's side: its title and one row per
 * exercise — its number and name, the facts while it is untried, «Resuelto»
 * or «Fallado» once tried —, and «Resolver» (or «Volver a ver» once solved)
 * where the student may solve it. An attempt from here counts for the class,
 * not the streak (D49): the solver says so.
 */
function ExercisesCard({ block }: { block: ExerciseBlock }) {
  const titleId = anchorOf(block);
  return (
    <section className="class-notebook__card" aria-labelledby={titleId}>
      <h2 id={titleId} className="class-notebook__label">
        {block.title ?? "Ejercicios"}
      </h2>
      <ul className="class-notebook__exercises">
        {block.exercises.map((exercise) => (
          <li key={exercise.id} className="class-notebook__exercise">
            <span className="class-notebook__exercise-text">
              <span className="class-notebook__exercise-name">
                <b>{exercise.n}.</b> {exercise.title}
              </span>
              {exercise.mark === null && <span className="class-notebook__exercise-facts">{exercise.facts}</span>}
            </span>
            {exercise.mark && (
              <span className={`class-notebook__mark class-notebook__mark_tone_${exercise.mark}`}>
                {exercise.mark === "solved" ? "Resuelto" : "Fallado"}
              </span>
            )}
            {exercise.href && (
              <Link href={exercise.href} className={mdButton(exercise.mark === "solved" ? "text" : "tonal", "sm")}>
                {exercise.mark === "solved" ? "Volver a ver" : "Resolver"}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * The student's class page as a notebook (2026-10-19, option 5c of the class
 * page canvas), in the new design system (2026-10-23, «M4» of the owner's
 * canvas). The side column holds the way in — «Entrar a la clase» as the
 * extended FAB while the link is open, the recording after the class —,
 * what there is to do counted on its bar, the article's index (its
 * headings, «Ahora tú», the exercises, «Lo que te llevas») and the classes
 * left. The panel has the trail back to «Clases» and the link to copy, and
 * the article: the teacher's blocks read as one — text, diagrams on
 * Material's blue board, a game in a small widget that opens on the board,
 * the lessons it cites — with «Ahora tú» questions inside the text, and the
 * class's exercises in their own column beside it. After the class, the
 * teacher's summary over the article.
 *
 * Front-only: the diagrams, the questions, the course, the takeaways and the
 * next class are `NOTEBOOK_SAMPLE`, the same for every class.
 */
export function ClassNotebookSection({ classDetail, notice, errorMessage }: ClassNotebookSectionProps) {
  const sample = NOTEBOOK_SAMPLE;
  const cancelled = classDetail.cancelled !== null;
  const after = classDetail.view === "review";
  const blocks: NotebookBlock[] = cancelled ? [] : [...sample.blocks, ...classDetail.blocks];
  const reading = blocks.filter((block) => block.kind !== "EXERCISE");
  const exerciseBlocks = blocks.filter((block): block is ExerciseBlock => block.kind === "EXERCISE");
  const exercises = exerciseBlocks.flatMap((block) => block.exercises);
  const questions = blocks.filter((block) => block.kind === "QUESTION");
  const total = exercises.length + questions.length;
  const done = exercises.filter((exercise) => exercise.mark !== null).length;
  const kind = classDetail.classmates.length > 0 ? "Clase grupal" : "Clase individual";
  const joinState = meetingJoinState(classDetail.join);
  const copyable =
    !cancelled && !after && classDetail.join.meetingUrl !== null && joinState !== "closed" && joinState !== "none";
  let questionIndex = 0;

  const index: PlatformSideNavLink[] = [
    ...reading.flatMap((block): PlatformSideNavLink[] => {
      const heading = headingOf(block);
      return heading
        ? [
            {
              label: heading,
              href: `#${anchorOf(block)}`,
              icon: block.kind === "GAME_REF" ? "chess-board" : "book-open",
            },
          ]
        : [];
    }),
    ...(questions.length > 0
      ? [{ label: "Ahora tú", href: `#${QUESTIONS_ANCHOR}`, icon: "circle-question" as const, count: questions.length }]
      : []),
    ...exerciseBlocks.map((block): PlatformSideNavLink => ({
      label: block.title ?? "Ejercicios",
      href: `#${anchorOf(block)}`,
      icon: "trophy",
      count: `${block.exercises.filter((exercise) => exercise.mark !== null).length}/${block.exercises.length}`,
    })),
    ...(cancelled ? [] : [{ label: "Lo que te llevas", href: `#${TAKEAWAYS_ANCHOR}`, icon: "circle-check" as const }]),
  ];

  return (
    <NotebookProgress initialDone={done} total={total}>
      <div className="platform-workspace class-notebook">
        <div className="platform-workspace__side class-notebook__side">
          <ClassJoinSide classDetail={classDetail} />
          {index.length > 0 && (
            <div className="class-notebook__index">
              <p className="class-notebook__index-title">Contenido de la clase</p>
              <NotebookProgressBar />
              <PlatformSideNav label="Contenido de la clase" groups={[{ links: index }]} />
            </div>
          )}
          {classDetail.balanceLine && <p className="class-notebook__balance">{classDetail.balanceLine}</p>}
        </div>

        <section className="platform-workspace__panel class-notebook__panel" aria-labelledby="class-notebook-title">
          <div className="class-notebook__toolbar">
            <nav className="class-notebook__trail" aria-label="Dónde estás en tus clases">
              <Link href={platformRoutes.classes} className={mdIconButton("standard", "sm")} aria-label="Mis clases">
                <ArrowLeftIcon variant="classic-solid" className="platform-md-icon" />
              </Link>
              <Link href={platformRoutes.classes} className="class-notebook__crumb">
                Clases
              </Link>
              <ChevronRightIcon variant="classic-solid" className="class-notebook__crumb-step" />
              <span className="class-notebook__crumb-here" aria-current="page">
                {classDetail.title}
              </span>
            </nav>
            {copyable && classDetail.join.meetingUrl && (
              <CopyLinkButton url={classDetail.join.meetingUrl} label="Copiar el enlace" material="icon" />
            )}
          </div>

          <div className={`class-notebook__body${exerciseBlocks.length > 0 ? " class-notebook__body_aside_on" : ""}`}>
            <article className="class-notebook__column">
              <header className="class-notebook__head">
                <p className="class-notebook__eyebrow">
                  {kind} · {dateline(classDetail)}
                </p>
                <h1 id="class-notebook-title" className="class-notebook__title">
                  {classDetail.title}
                </h1>
                <div className="class-notebook__byline">
                  <span className="class-notebook__avatar" aria-hidden="true">
                    {classDetail.teacherName
                      .split(/\s+/)
                      .filter((word) => /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]/.test(word))
                      .slice(0, 2)
                      .map((word) => word[0])
                      .join("")}
                  </span>
                  <span className="class-notebook__byline-text">
                    <strong>{classDetail.teacherName}</strong>
                    <span>
                      {" · "}
                      {classDetail.classmates.length > 0 ? `Con ${joinSpanish(classDetail.classmates)} · ` : ""}
                      {sample.course.name} · clase {sample.course.index} de {sample.course.total} · lectura de{" "}
                      {readingMinutes(blocks)} min
                    </span>
                  </span>
                </div>
              </header>

              {errorMessage && <PlatformNotice message={errorMessage} />}
              {notice && <PlatformNotice message={notice} variant="success" />}
              {classDetail.cancelled && (
                <PlatformNotice
                  variant="warning"
                  message={[
                    "Esta clase se canceló.",
                    classDetail.cancelled.note,
                    classDetail.cancelled.returnedToPayment
                      ? "Tu clase pagada sigue en pie: la programaremos contigo."
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              )}
              {classDetail.rescheduled && (
                <PlatformNotice
                  variant="info"
                  message={`Reprogramada desde el ${classDetail.rescheduled.previousLabel}.${classDetail.rescheduled.note ? ` Nota: ${classDetail.rescheduled.note}` : ""}`}
                />
              )}
              {classDetail.makeUp && <PlatformNotice variant="info" message={classDetail.makeUp.label} />}
              {classDetail.moved && <PlatformNotice variant="warning" message={classDetail.moved.label} />}

              {after && classDetail.summary && (
                <section className="class-notebook__summary" aria-label="Después de la clase">
                  <p className="class-notebook__label">Después de la clase</p>
                  <p className="class-notebook__summary-text">{classDetail.summary}</p>
                </section>
              )}

              <div id="para-preparar" className="class-notebook__reading">
                {reading.map((block) => {
                  if (block.kind === "QUESTION") questionIndex += 1;
                  return (
                    <NotebookBlockView
                      key={block.id}
                      block={block}
                      questionPosition={`pregunta ${questionIndex} de ${questions.length}`}
                      questionAnchor={block.kind === "QUESTION" && questionIndex === 1 ? QUESTIONS_ANCHOR : undefined}
                    />
                  );
                })}
              </div>

              {!cancelled && (
                <section className="class-notebook__takeaways" aria-labelledby={TAKEAWAYS_ANCHOR}>
                  <h2 id={TAKEAWAYS_ANCHOR} className="class-notebook__heading">
                    Lo que te llevas
                  </h2>
                  <ol className="class-notebook__takeaway-list">
                    {sample.takeaways.map((takeaway) => (
                      <li key={takeaway}>{takeaway}</li>
                    ))}
                  </ol>
                </section>
              )}

              <footer className="class-notebook__foot">
                {after && (
                  <p className="class-notebook__next">
                    <span className="class-notebook__label">Tu próxima clase</span>
                    <span>
                      <strong>{sample.nextClass.title}</strong> · {sample.nextClass.when}
                    </span>
                  </p>
                )}
                <p className="class-notebook__muted">
                  {sample.course.previous && <>Antes: «{sample.course.previous}». </>}
                  {sample.course.next && <>Después: «{sample.course.next}».</>}
                </p>
                <p className="class-notebook__foot-links">
                  <Link href={platformRoutes.classes} className={mdButton("text", "sm")}>
                    Ver mis clases
                  </Link>
                  <a
                    href={classDetail.whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className={mdButton("text", "sm")}
                  >
                    <WhatsappIcon className="platform-md-icon" />
                    ¿Algún problema? Escríbenos
                    <span className="class-notebook__sr">(se abre en una pestaña nueva)</span>
                  </a>
                </p>
              </footer>
            </article>

            {exerciseBlocks.length > 0 && (
              <aside className="class-notebook__aside" aria-label="Ejercicios de la clase">
                {exerciseBlocks.map((block) => (
                  <ExercisesCard key={block.id} block={block} />
                ))}
              </aside>
            )}
          </div>
        </section>
      </div>
    </NotebookProgress>
  );
}

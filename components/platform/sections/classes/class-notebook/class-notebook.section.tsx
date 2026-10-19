import Link from "next/link";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { MeetingJoinCard } from "@/components/platform/shared/meeting-join-card/meeting-join-card.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { finalFenOf } from "@/lib/chess/replay";
import { platformRoutes } from "@/lib/platform-routes";
import type { ClassBlockView, ClassDetailView } from "@/services/classes/classes.types";
import { NOTEBOOK_SAMPLE, type NotebookSampleBlock } from "./class-notebook.sample";
import { NotebookProgress, NotebookProgressBar, NotebookQuestion } from "./notebook-progress.comp";
import "./class-notebook.section.css";

interface ClassNotebookSectionProps {
  classDetail: ClassDetailView;
  notice?: string;
  errorMessage?: string;
}

type NotebookBlock = ClassBlockView | NotebookSampleBlock;

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

/** One block of the article, in the notebook's reading style. */
function NotebookBlockView({ block, questionPosition }: { block: NotebookBlock; questionPosition: string }) {
  switch (block.kind) {
    case "ARTICLE_TEXT":
      return (
        <>
          {block.heading && <h2 className="class-notebook__heading">{block.heading}</h2>}
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
          {block.title && <h2 className="class-notebook__heading">{block.title}</h2>}
          <TextBlock text={block.text} />
        </>
      );
    case "DIAGRAM":
      return (
        <figure className="class-notebook__figure">
          <div className="class-notebook__figure-board">
            <StaticDiagram fen={block.fen} orientation={block.orientation} arrows={block.arrows} />
          </div>
          <figcaption className="class-notebook__caption">
            <strong>{block.label}</strong> {block.caption}
          </figcaption>
        </figure>
      );
    case "POSITION_REF":
      return (
        <figure className="class-notebook__figure">
          <div className="class-notebook__figure-board">
            <StaticDiagram fen={block.position.fen} orientation={block.position.orientation} />
          </div>
          {(block.position.title ?? block.caption) && (
            <figcaption className="class-notebook__caption">{block.position.title ?? block.caption}</figcaption>
          )}
        </figure>
      );
    case "QUESTION":
      return <NotebookQuestion question={block} position={questionPosition} />;
    case "GAME_REF": {
      const { game } = block;
      const href = game.href ?? platformRoutes.analysisBoard({ fen: finalFenOf(game.pgn) });
      const players = game.players ? `${game.players.white.name} – ${game.players.black.name}` : game.label;
      return (
        <>
          {block.title && <h2 className="class-notebook__heading">{block.title}</h2>}
          {block.caption && <p className="class-notebook__paragraph">{block.caption}</p>}
          <div className="class-notebook__widget">
            <div className="class-notebook__widget-board">
              <StaticDiagram fen={finalFenOf(game.pgn)} orientation={game.orientation ?? "white"} />
            </div>
            <div className="class-notebook__widget-text">
              <strong className="class-notebook__widget-title">{players}</strong>
              <span className="class-notebook__widget-meta">
                {game.result ? `${game.result} · ` : ""}Partida
                {game.pinnedComment ? ` · «${game.pinnedComment}»` : ""}
              </span>
            </div>
            <Link href={href} className="platform-button platform-button_variant_accent">
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
          <span className="class-notebook__card-kind">Lección</span>
          <strong className="class-notebook__card-title">{block.lesson.name}</strong>
          <span className="class-notebook__card-action">Ir a la lección →</span>
        </Link>
      );
    case "EXERCISE":
      return (
        <>
          <h2 className="class-notebook__heading">{block.title ?? "Ejercicios"}</h2>
          <ul className="class-notebook__exercises">
            {block.exercises.map((exercise) => (
              <li key={exercise.id} className="class-notebook__exercise">
                <div className="class-notebook__exercise-board">
                  <StaticDiagram fen={exercise.startFen} orientation={exercise.orientation} />
                </div>
                <span className="class-notebook__exercise-text">
                  <strong>
                    {exercise.n}. {exercise.title}
                  </strong>
                  <span
                    className={`class-notebook__mark${exercise.mark ? ` class-notebook__mark_tone_${exercise.mark}` : ""}`}
                  >
                    {exercise.mark === "solved" ? "Resuelto" : exercise.mark === "failed" ? "Fallado" : exercise.facts}
                  </span>
                </span>
                {exercise.href && (
                  <Link href={exercise.href} className="platform-button platform-button_size_sm">
                    {exercise.mark === "solved" ? "Volver a ver" : "Resolver"}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </>
      );
    case "VIDEO":
      return (
        <a href={block.videoUrl} target="_blank" rel="noreferrer" className="class-notebook__card-link">
          <span className="class-notebook__card-kind">Video</span>
          <strong className="class-notebook__card-title">{block.title ?? block.caption ?? "Video de la clase"}</strong>
          <span className="class-notebook__card-action">Ver el video →</span>
        </a>
      );
    case "FILE":
      return <p className="class-notebook__muted">{block.caption ?? "Material de la clase"}</p>;
  }
}

/**
 * The student's class page as a notebook (2026-10-19, option 5c of the class
 * page canvas): one column to read, with the class's way in on a strip that
 * stays at the top, and what there is to do counted on its bar. The
 * teacher's blocks read as an article — text, static diagrams, a game in a
 * small widget that opens on the board, the lessons it cites, its exercises —
 * and «Ahora tú» questions sit inside the text. Before the class, the strip
 * is the access card; after it, whether the student came and the recording,
 * with the teacher's summary over the article.
 *
 * Front-only: the diagrams, the questions, the course, the takeaways and the
 * next class are `NOTEBOOK_SAMPLE`, the same for every class.
 */
export function ClassNotebookSection({ classDetail, notice, errorMessage }: ClassNotebookSectionProps) {
  const sample = NOTEBOOK_SAMPLE;
  const cancelled = classDetail.cancelled !== null;
  const after = classDetail.view === "review";
  const blocks: NotebookBlock[] = cancelled ? [] : [...sample.blocks, ...classDetail.blocks];
  const exercises = blocks.flatMap((block) => (block.kind === "EXERCISE" ? block.exercises : []));
  const questions = blocks.filter((block) => block.kind === "QUESTION");
  const total = exercises.length + questions.length;
  const done = exercises.filter((exercise) => exercise.mark !== null).length;
  const kind = classDetail.classmates.length > 0 ? "Clase grupal" : "Clase individual";
  let questionIndex = 0;

  return (
    <NotebookProgress initialDone={done} total={total}>
      <div className="class-notebook">
        <div className="class-notebook__strip">
          <div className="class-notebook__strip-inner">
            {after ? (
              <span className="class-notebook__strip-status">
                {classDetail.attended === true && <strong className="class-notebook__attended">Asististe</strong>}
                {classDetail.attended === false && <strong className="class-notebook__missed">No asististe</strong>}
                {classDetail.recordingUrl && (
                  <a href={classDetail.recordingUrl} target="_blank" rel="noreferrer">
                    Ver la grabación
                  </a>
                )}
              </span>
            ) : (
              !cancelled && <MeetingJoinCard {...classDetail.join} audience="student" density="compact" />
            )}
            <NotebookProgressBar />
          </div>
        </div>

        <article className="class-notebook__column">
          <Link href={platformRoutes.classes} className="platform-page__back">
            <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
            Mis clases
          </Link>

          <p className="class-notebook__eyebrow">
            {kind} · {dateline(classDetail)}
          </p>
          <h1 className="class-notebook__title">{classDetail.title}</h1>
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
                {classDetail.classmates.length > 0 ? `Con ${classDetail.classmates.join(" y ")} · ` : ""}
                {sample.course.name} · clase {sample.course.index} de {sample.course.total} · lectura de{" "}
                {readingMinutes(blocks)} min
              </span>
            </span>
          </div>

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
            <section className="class-notebook__summary">
              <p className="class-notebook__eyebrow">Después de la clase</p>
              <p className="class-notebook__summary-text">{classDetail.summary}</p>
            </section>
          )}

          <div className="class-notebook__body">
            {blocks.map((block) => {
              if (block.kind === "QUESTION") questionIndex += 1;
              return (
                <NotebookBlockView
                  key={block.id}
                  block={block}
                  questionPosition={`pregunta ${questionIndex} de ${questions.length}`}
                />
              );
            })}
          </div>

          {!cancelled && (
            <section className="class-notebook__takeaways">
              <h2 className="class-notebook__heading">Lo que te llevas</h2>
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
                <span className="class-notebook__eyebrow">Tu próxima clase</span>
                <span>
                  <strong>{sample.nextClass.title}</strong> · {sample.nextClass.when}
                </span>
              </p>
            )}
            <p className="class-notebook__muted">
              {sample.course.previous && <>Antes: «{sample.course.previous}». </>}
              {sample.course.next && <>Después: «{sample.course.next}».</>}
            </p>
            {classDetail.balanceLine && <p className="class-notebook__muted">{classDetail.balanceLine}</p>}
            <p className="class-notebook__muted">
              <Link href={platformRoutes.classes}>Ver mis clases</Link> · ¿Algún problema?{" "}
              <a href={classDetail.whatsappHref} target="_blank" rel="noreferrer">
                Escríbenos por WhatsApp
              </a>
            </p>
          </footer>
        </article>
      </div>
    </NotebookProgress>
  );
}

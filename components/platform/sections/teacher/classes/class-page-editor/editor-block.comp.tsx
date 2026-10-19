"use client";

import Link from "next/link";
import { useId, useState, type KeyboardEvent, type MouseEvent } from "react";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import type { StaticDiagramTone } from "@/components/chess/static-diagram-arrows";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { LightbulbIcon } from "@/components/icons/lightbulb-icon.comp";
import { PenToSquareIcon } from "@/components/icons/pen-to-square-icon.comp";
import { PlusIcon } from "@/components/icons/plus-icon.comp";
import { XmarkIcon } from "@/components/icons/xmark-icon.comp";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformSearchField } from "@/components/platform/shared/platform-search-field/platform-search-field.comp";
import { readDiagramPgn, writeDiagramPgn, type DiagramColor } from "@/lib/chess/diagram-notation";
import { platformRoutes } from "@/lib/platform-routes";
import { BlockKindIcon } from "./block-kind-icon.comp";
import {
  type ClassPageEditorOptions,
  type EditorBlock,
  type QuestionOption,
  type TextBlock,
} from "./class-page-editor.model";
import { EditableText } from "./editable-text.comp";
import "./editor-block.comp.css";

const TONE: Record<DiagramColor, StaticDiagramTone> = {
  green: "success",
  red: "danger",
  blue: "info",
  yellow: "warning",
};

/** Everything a text block needs from the editor, which knows the blocks around it. */
export interface TextEditing {
  onKeyDown: (block: TextBlock, event: KeyboardEvent<HTMLElement>) => void;
  onInput: (block: TextBlock, text: string) => void;
  register: (id: string, element: HTMLElement | null) => void;
}

interface EditorBlockProps {
  block: EditorBlock;
  /** `edit`: typed in place, with its controls; `student`: drawn as the student will read it. */
  mode: "edit" | "student";
  options: ClassPageEditorOptions;
  onChange: (block: EditorBlock) => void;
  text: TextEditing;
  /** Opens the diagram editor on a diagram, or on a question's position. */
  onEditBoard: (event: MouseEvent<HTMLElement>, block: Extract<EditorBlock, { kind: "diagram" | "question" }>) => void;
}

/**
 * One block of the class, by kind: in the editor, typed where it stands, as
 * the student will read it; in the student's view, read only. A block that
 * cites something (a game, a lesson, a series, a video, a file) starts as a
 * picker and becomes its card once chosen.
 */
export function EditorBlockView(props: EditorBlockProps) {
  return (
    <div className="editor-block">
      <BlockBody {...props} />
    </div>
  );
}

function BlockBody({ block, mode, options, onChange, text, onEditBoard }: EditorBlockProps) {
  const editing = mode === "edit";

  switch (block.kind) {
    case "text":
    case "heading":
    case "subheading":
    case "list":
    case "quote":
    case "callout":
      return <TextBlockView block={block} editing={editing} text={text} />;

    case "divider":
      return <hr className="editor-block__divider" />;

    case "diagram": {
      const diagram = readDiagramPgn(block.pgn);
      if (!diagram) return null;
      return (
        <figure className="editor-block__figure">
          <div className="editor-block__figure-board">
            <StaticDiagram
              fen={diagram.fen}
              orientation={diagram.orientation}
              arrows={diagram.arrows.map((arrow) => ({ from: arrow.from, to: arrow.to, tone: TONE[arrow.color] }))}
              circles={diagram.circles.map((circle) => ({ square: circle.square, tone: TONE[circle.color] }))}
            />
            {editing && (
              <button
                type="button"
                className="platform-button platform-button_size_sm editor-block__board-edit"
                onClick={(event) => onEditBoard(event, block)}
              >
                <PenToSquareIcon variant="classic-solid" className="platform-button__icon" />
                Editar el diagrama
              </button>
            )}
          </div>
          {editing ? (
            <EditableText
              className="editor-block__caption"
              text={diagram.caption}
              label="Pie del diagrama"
              placeholder="Escribe el pie del diagrama"
              onText={(caption) => onChange({ ...block, pgn: writeDiagramPgn({ ...diagram, caption }) })}
            />
          ) : (
            diagram.caption && <figcaption className="editor-block__caption">{diagram.caption}</figcaption>
          )}
        </figure>
      );
    }

    case "question":
      return editing ? (
        <QuestionEditor block={block} onChange={onChange} onEditBoard={onEditBoard} />
      ) : (
        <QuestionView block={block} />
      );

    case "game": {
      if (!block.game) {
        return editing ? (
          <Picker
            kind="game"
            title="Elige una partida de tus estudios"
            search="Busca por jugador o evento"
            items={options.games.map((game) => ({
              id: game.id,
              label: `${game.white} – ${game.black}`,
              meta: game.event,
              pick: () => onChange({ ...block, game }),
            }))}
          />
        ) : null;
      }
      const game = block.game;
      return (
        <div className="editor-block__widget">
          {game.fen && (
            <div className="editor-block__widget-board">
              <StaticDiagram fen={game.fen} />
            </div>
          )}
          <div className="editor-block__widget-text">
            <span className="editor-block__eyebrow">Partida</span>
            <strong className="editor-block__widget-title">
              {game.white} – {game.black}
            </strong>
            <span className="editor-block__meta">{[game.event, game.result].filter(Boolean).join(" · ")}</span>
            <div className="editor-block__actions">
              <Link
                href={game.href ?? platformRoutes.analysisBoard(game.fen ? { fen: game.fen } : { partida: game.id })}
                className="platform-button platform-button_size_sm"
              >
                Abrir en el tablero
              </Link>
              {editing && (
                <button
                  type="button"
                  className="platform-button platform-button_size_sm platform-button_variant_quiet"
                  onClick={() => onChange({ ...block, game: null })}
                >
                  Cambiar la partida
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    case "lesson": {
      if (!block.lesson) {
        return editing ? (
          <Picker
            kind="lesson"
            title="Elige una lección"
            search="Busca una lección"
            items={options.lessons.map((lesson) => ({
              id: lesson.id,
              label: lesson.title,
              meta: lesson.course ?? "",
              pick: () => onChange({ ...block, lesson }),
            }))}
          />
        ) : null;
      }
      return (
        <ReferenceCard
          kind="lesson"
          eyebrow={block.lesson.course ? `Lección · ${block.lesson.course}` : "Lección"}
          title={block.lesson.title}
          onChange={editing ? () => onChange({ ...block, lesson: null }) : undefined}
        />
      );
    }

    case "exercises": {
      if (!block.series) {
        return editing ? (
          <Picker
            kind="exercises"
            title="Elige una serie del banco de ejercicios"
            search="Busca una serie"
            items={options.series.map((series) => ({
              id: series.id,
              label: series.title,
              meta: series.exercises.length === 1 ? "1 ejercicio" : `${series.exercises.length} ejercicios`,
              pick: () => onChange({ ...block, series }),
            }))}
          />
        ) : null;
      }
      return (
        <div className="editor-block__card">
          <ReferenceCard
            kind="exercises"
            eyebrow={`Ejercicios · ${block.series.exercises.length}`}
            title={block.series.title}
            onChange={editing ? () => onChange({ ...block, series: null }) : undefined}
            flat
          />
          <ol className="editor-block__exercise-list">
            {block.series.exercises.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ol>
        </div>
      );
    }

    case "video": {
      if (!block.url) return editing ? <VideoPicker onUrl={(url) => onChange({ ...block, url })} /> : null;
      return (
        <ReferenceCard
          kind="video"
          eyebrow="Video"
          title={block.url}
          onChange={editing ? () => onChange({ ...block, url: null }) : undefined}
        />
      );
    }

    case "file": {
      if (!block.file) return editing ? <FilePicker onFile={(file) => onChange({ ...block, file })} /> : null;
      return (
        <ReferenceCard
          kind="file"
          eyebrow={block.file.size ? `Archivo · ${block.file.size}` : "Archivo"}
          title={block.file.name}
          onChange={editing ? () => onChange({ ...block, file: null }) : undefined}
        />
      );
    }
  }
}

const TEXT_LABELS: Record<TextBlock["kind"], { label: string; placeholder: string }> = {
  text: { label: "Párrafo", placeholder: "Escribe, o «/» para agregar un bloque" },
  heading: { label: "Título", placeholder: "Título" },
  subheading: { label: "Subtítulo", placeholder: "Subtítulo" },
  list: { label: "Punto de la lista", placeholder: "Un punto de la lista" },
  quote: { label: "Cita", placeholder: "Una cita" },
  callout: { label: "Destacado", placeholder: "Una nota que resalta" },
};

const TEXT_TAGS = {
  text: "p",
  heading: "h2",
  subheading: "h3",
  list: "span",
  quote: "blockquote",
  callout: "p",
} as const;

function TextBlockView({ block, editing, text }: { block: TextBlock; editing: boolean; text: TextEditing }) {
  const className = `editor-block__${block.kind}${block.kind === "text" && block.lead ? " editor-block__text_role_lead" : ""}`;
  const Tag = TEXT_TAGS[block.kind];
  const body = editing ? (
    <EditableText
      // Another kind is another element: mounted anew, it is written with the text again.
      key={block.kind}
      inline={block.kind === "list"}
      className={block.kind === "list" || block.kind === "callout" ? "editor-block__inline" : className}
      text={block.text}
      label={TEXT_LABELS[block.kind].label}
      placeholder={TEXT_LABELS[block.kind].placeholder}
      onText={(value) => text.onInput(block, value)}
      onKeyDown={(event) => text.onKeyDown(block, event)}
      elementRef={(element) => text.register(block.id, element)}
    />
  ) : (
    <Tag className={block.kind === "list" || block.kind === "callout" ? "editor-block__inline" : className}>
      {block.text}
    </Tag>
  );

  if (block.kind === "list") return <div className={className}>{body}</div>;
  if (block.kind === "callout") {
    return (
      <div className={className}>
        <LightbulbIcon variant="classic-solid" className="editor-block__callout-icon" />
        {body}
      </div>
    );
  }
  return body;
}

interface QuestionProps {
  block: Extract<EditorBlock, { kind: "question" }>;
}

/** «Ahora tú» being written: the position with its way to change it, the prompt, and the options with the right one marked. */
function QuestionEditor({
  block,
  onChange,
  onEditBoard,
}: QuestionProps & Pick<EditorBlockProps, "onChange" | "onEditBoard">) {
  const setOption = (id: string, change: Partial<QuestionOption>) =>
    onChange({
      ...block,
      options: block.options.map((option) => (option.id === id ? { ...option, ...change } : option)),
    });

  return (
    <section className="editor-block__question" aria-label="Ahora tú">
      <div className="editor-block__question-board">
        <StaticDiagram fen={block.fen} orientation={block.orientation} />
        <button
          type="button"
          className="platform-button platform-button_size_sm"
          onClick={(event) => onEditBoard(event, block)}
        >
          Cambiar la posición
        </button>
      </div>
      <div className="editor-block__question-body">
        <span className="editor-block__eyebrow">Ahora tú</span>
        <EditableText
          className="editor-block__question-prompt"
          text={block.prompt}
          label="Pregunta"
          placeholder="Escribe la pregunta"
          onText={(prompt) => onChange({ ...block, prompt })}
        />
        <ul className="editor-block__options">
          {block.options.map((option, index) => (
            <li key={option.id} className="editor-block__option">
              <button
                type="button"
                className={`editor-block__mark${option.correct ? " editor-block__mark_state_on" : ""}`}
                aria-pressed={option.correct}
                aria-label={`La opción ${index + 1} es la correcta`}
                onClick={() =>
                  onChange({
                    ...block,
                    options: block.options.map((item) => ({ ...item, correct: item.id === option.id })),
                  })
                }
              >
                <CheckIcon variant="classic-solid" />
              </button>
              <div className="editor-block__option-text">
                <EditableText
                  className="editor-block__option-label"
                  text={option.label}
                  label={`Opción ${index + 1}`}
                  placeholder={`Opción ${index + 1}`}
                  onText={(label) => setOption(option.id, { label })}
                />
                <EditableText
                  className="editor-block__option-why"
                  text={option.why}
                  label={`Por qué de la opción ${index + 1}`}
                  placeholder="Por qué: lo lee al elegirla"
                  onText={(why) => setOption(option.id, { why })}
                />
              </div>
              {block.options.length > 2 && (
                <button
                  type="button"
                  className="platform-button platform-button_variant_quiet platform-button_size_sm platform-button_shape_square"
                  aria-label={`Quitar la opción ${index + 1}`}
                  onClick={() => {
                    const rest = block.options.filter((item) => item.id !== option.id);
                    // The right answer never goes with its option: the first one left takes it.
                    const hasRight = rest.some((item) => item.correct);
                    onChange({
                      ...block,
                      options: rest.map((item, at) => (hasRight || at > 0 ? item : { ...item, correct: true })),
                    });
                  }}
                >
                  <XmarkIcon variant="classic-solid" className="platform-button__icon" />
                </button>
              )}
            </li>
          ))}
        </ul>
        {block.options.length < 5 && (
          <button
            type="button"
            className="platform-button platform-button_size_sm platform-button_variant_quiet editor-block__add-option"
            onClick={() =>
              onChange({
                ...block,
                options: [...block.options, { id: crypto.randomUUID(), label: "", why: "", correct: false }],
              })
            }
          >
            <PlusIcon variant="classic-solid" className="platform-button__icon" />
            Agregar opción
          </button>
        )}
      </div>
    </section>
  );
}

/** «Ahora tú» as the student answers it: an option says at once whether it was right, and why. */
function QuestionView({ block }: QuestionProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const chosen = block.options.find((option) => option.id === picked) ?? null;
  return (
    <section className="editor-block__question" aria-label="Ahora tú">
      <div className="editor-block__question-board">
        <StaticDiagram fen={block.fen} orientation={block.orientation} />
      </div>
      <div className="editor-block__question-body">
        <span className="editor-block__eyebrow">Ahora tú</span>
        <p className="editor-block__question-prompt">{block.prompt}</p>
        <div className="editor-block__answers" role="group" aria-label="Opciones">
          {block.options.map((option) => {
            const state = picked === option.id ? (option.correct ? "right" : "wrong") : "idle";
            return (
              <button
                key={option.id}
                type="button"
                className={`editor-block__answer editor-block__answer_state_${state}`}
                aria-pressed={picked === option.id}
                onClick={() => setPicked(option.id)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <p
          className={`editor-block__feedback${chosen ? ` editor-block__feedback_tone_${chosen.correct ? "right" : "wrong"}` : ""}`}
          aria-live="polite"
        >
          {chosen?.why ?? ""}
        </p>
      </div>
    </section>
  );
}

interface PickerItem {
  id: string;
  label: string;
  meta: string;
  pick: () => void;
}

/** An empty citing block: what to choose, a search that narrows the choices, and the choices. */
function Picker({
  kind,
  title,
  search,
  items,
}: {
  kind: "game" | "lesson" | "exercises";
  title: string;
  search: string;
  items: PickerItem[];
}) {
  const [query, setQuery] = useState("");
  const wanted = query.trim().toLowerCase();
  const shown = wanted ? items.filter((item) => `${item.label} ${item.meta}`.toLowerCase().includes(wanted)) : items;
  return (
    <div className="editor-block__picker">
      <p className="editor-block__picker-title">
        <span className="editor-block__picker-icon">
          <BlockKindIcon kind={kind} />
        </span>
        {title}
      </p>
      <PlatformSearchField label={search} placeholder={search} onValueChange={setQuery} />
      <ul className="editor-block__choices">
        {shown.map((item) => (
          <li key={item.id}>
            <button type="button" className="editor-block__choice" onClick={item.pick}>
              <span>{item.label}</span>
              <span className="editor-block__meta">{item.meta}</span>
            </button>
          </li>
        ))}
        {shown.length === 0 && (
          <li className="editor-block__meta">
            {items.length === 0 ? "No hay nada para elegir todavía." : `Nada coincide con «${query.trim()}».`}
          </li>
        )}
      </ul>
    </div>
  );
}

/** An empty video block: the link, checked as a URL by the browser. */
function VideoPicker({ onUrl }: { onUrl: (url: string) => void }) {
  return (
    <PlatformForm
      className="editor-block__picker"
      onSubmit={(event) => {
        event.preventDefault();
        const url = new FormData(event.currentTarget).get("url");
        if (typeof url === "string" && url.trim()) onUrl(url.trim());
      }}
    >
      <p className="editor-block__picker-title">
        <span className="editor-block__picker-icon">
          <BlockKindIcon kind="video" />
        </span>
        Pega el enlace del video
      </p>
      <div className="editor-block__inline-form">
        <PlatformFormField name="url" label="Enlace de YouTube o Vimeo" messages={{ typeMismatch: "Pega un enlace." }}>
          <input type="url" required placeholder="https://youtube.com/…" />
        </PlatformFormField>
        <button type="submit" className="platform-button platform-button_variant_ink">
          Agregar video
        </button>
      </div>
    </PlatformForm>
  );
}

function sizeOf(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

/** An empty file block: a PDF or an image, kept by its name while nothing uploads it. */
function FilePicker({ onFile }: { onFile: (file: { name: string; size: string }) => void }) {
  const id = useId();
  return (
    <div className="editor-block__picker">
      <p className="editor-block__picker-title">
        <span className="editor-block__picker-icon">
          <BlockKindIcon kind="file" />
        </span>
        Sube un PDF o una imagen
      </p>
      <label htmlFor={id} className="editor-block__file-label">
        Elige el archivo
      </label>
      <input
        id={id}
        type="file"
        accept="application/pdf,image/*"
        className="editor-block__file-input"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) onFile({ name: file.name, size: sizeOf(file.size) });
        }}
      />
    </div>
  );
}

/** A lesson, a video or a file the article cites, with its way to choose another while it is edited. */
function ReferenceCard({
  kind,
  eyebrow,
  title,
  onChange,
  flat = false,
}: {
  kind: "lesson" | "exercises" | "video" | "file";
  eyebrow: string;
  title: string;
  onChange?: () => void;
  /** Inside a card of its own: no frame. */
  flat?: boolean;
}) {
  return (
    <div className={`editor-block__reference${flat ? " editor-block__reference_flat" : ""}`}>
      <span className="editor-block__picker-icon">
        <BlockKindIcon kind={kind} />
      </span>
      <span className="editor-block__reference-text">
        <span className="editor-block__meta">{eyebrow}</span>
        <strong className="editor-block__reference-title">{title}</strong>
      </span>
      {onChange && (
        <button
          type="button"
          className="platform-button platform-button_size_sm platform-button_variant_quiet"
          onClick={onChange}
        >
          Cambiar
        </button>
      )}
    </div>
  );
}

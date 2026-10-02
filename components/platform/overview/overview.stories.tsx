import { useRef, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import { ActivityList } from "@/components/platform/shared/activity-list/activity-list.comp";
import { BoardLoading } from "@/components/platform/shared/board-loading/board-loading.comp";
import { EditGame } from "@/components/platform/shared/edit-game/edit-game.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { FormField, FormFieldset } from "@/components/platform/shared/form-field/form-field.comp";
import { LocalDateTime } from "@/components/platform/shared/local-datetime/local-datetime.comp";
import { PlatformCheckCards } from "@/components/platform/shared/platform-check-cards/platform-check-cards.comp";
import { PlatformChoiceCards } from "@/components/platform/shared/platform-choice-cards/platform-choice-cards.comp";
import { PlatformDatePicker } from "@/components/platform/shared/platform-date-picker/platform-date-picker.comp";
import { PlatformError } from "@/components/platform/shared/platform-error/platform-error.comp";
import { PlatformInfoTip } from "@/components/platform/shared/platform-info-tip/platform-info-tip.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import {
  PlatformTable,
  PlatformTableCell,
  PlatformTableRow,
} from "@/components/platform/shared/platform-table/platform-table.comp";
import { ProgressIndicator } from "@/components/platform/shared/progress-indicator/progress-indicator.comp";
import { StudyStreak } from "@/components/platform/shared/study-streak/study-streak.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { GAME_RESULT } from "@/constants/platform/study-codes.const";
import "./overview.css";

/** A tile: the piece's name, a link to its Docs page in Storybook, and the piece itself. */
function Tile({ name, docs, children }: { name: string; docs: string; children: ReactNode }) {
  return (
    <section className="overview__tile" aria-label={name}>
      <div className="overview__tile-head">
        <h3 className="overview__tile-name">{name}</h3>
        {/* `_top`: the link leaves the preview's frame and opens the page in Storybook itself. */}
        <a className="overview__tile-link" href={`./?path=/docs/${docs}--docs`} target="_top">
          Docs →
        </a>
      </div>
      {children}
    </section>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overview__section" aria-label={title}>
      <h2 className="overview__section-title">{title}</h2>
      <div className="overview__grid">{children}</div>
    </section>
  );
}

const SWATCHES = [
  "accent",
  "accent-soft",
  "text",
  "text-muted",
  "surface",
  "bg",
  "success-ink",
  "danger",
  "warning-ink",
  "progress",
];

const TYPE_SAMPLE = [
  "--platform-type-2xs",
  "--platform-type-sm",
  "--platform-type-lg",
  "--platform-type-xl",
  "--platform-type-2xl",
  "--platform-type-3xl",
];

const SPACE_SAMPLE = [
  "--platform-space-1",
  "--platform-space-2",
  "--platform-space-3",
  "--platform-space-4",
  "--platform-space-6",
  "--platform-space-8",
  "--platform-space-12",
];

const LEVELS = [
  { value: "inicial", label: "Inicial" },
  { value: "intermedio", label: "Intermedio" },
  { value: "avanzado", label: "Avanzado" },
];

/** Stands in for a server action: it settles at once, so nothing is left pending. */
const settles = async () => {};

function DialogTrigger() {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        className="platform-button platform-button_size_compact"
        onClick={() => dialog.current?.showModal()}
      >
        Abrir el diálogo
      </button>
      <dialog ref={dialog} className="platform-dialog" aria-label="Un diálogo de la plataforma">
        <form method="dialog" className="overview__stack" style={{ padding: "var(--platform-space-6)" }}>
          <h3 className="platform-card__title">Un diálogo de la plataforma</h3>
          <button type="submit" className="platform-button platform-button_variant_ink">
            Cerrar
          </button>
        </form>
      </dialog>
    </>
  );
}

function OverviewPage() {
  return (
    <div className="platform-page overview">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Overview</h1>
        <p className="platform-page__subtitle">Every piece of the platform at a glance, each linked to its own page.</p>
      </header>

      <Section title="Foundations">
        <Tile name="Colours" docs="platform-foundations-colours">
          <div className="overview__row">
            {SWATCHES.map((token) => (
              <span
                key={token}
                className="overview__swatch"
                title={token}
                style={{ background: `var(--platform-${token})` }}
              />
            ))}
          </div>
        </Tile>
        <Tile name="Type scale" docs="platform-foundations-type-scale">
          <div className="overview__stack">
            {TYPE_SAMPLE.map((token) => (
              <span key={token} style={{ fontSize: `var(${token})` }}>
                Siguiente lección · {token.split("-").pop()}
              </span>
            ))}
          </div>
        </Tile>
        <Tile name="Spacing scale" docs="platform-foundations-spacing-scale">
          <div className="overview__stack">
            {SPACE_SAMPLE.map((token) => (
              <span key={token} className="overview__space">
                <code className="overview__space-name">{token.split("-").pop()}</code>
                <span className="overview__bar" style={{ width: `var(${token})` }} />
              </span>
            ))}
          </div>
        </Tile>
      </Section>

      <Section title="Actions">
        <Tile name="Button" docs="platform-primitives-button">
          <div className="overview__row">
            <button type="button" className="platform-button">
              Cancelar
            </button>
            <button type="button" className="platform-button platform-button_variant_accent">
              Aprender
            </button>
            <button type="button" className="platform-button platform-button_variant_ink">
              Crear
            </button>
            <button type="button" className="platform-button platform-button_variant_danger">
              Eliminar
            </button>
            <button type="button" className="platform-button platform-button_size_compact">
              Gestionar
            </button>
            <button type="button" className="platform-button" disabled>
              Deshabilitado
            </button>
          </div>
        </Tile>
        <Tile name="SubmitButton" docs="platform-shared-submitbutton">
          <form action={settles}>
            <SubmitButton pendingLabel="Creando…">Crear estudio</SubmitButton>
          </form>
        </Tile>
        <Tile name="RowAction" docs="platform-primitives-rowaction">
          <div className="overview__row">
            <button type="button" className="platform-row-action">
              Editar
            </button>
            <button type="button" className="platform-row-action">
              Quitar
            </button>
            <button type="button" className="platform-row-action platform-row-action_variant_danger">
              Eliminar
            </button>
          </div>
        </Tile>
        <Tile name="Tag" docs="platform-primitives-tag">
          <div className="overview__row">
            <span className="platform-tag">Sólo lectura</span>
            <span className="platform-tag platform-tag_variant_accent">Desactualizado</span>
          </div>
        </Tile>
      </Section>

      <Section title="Forms">
        <Tile name="FormField" docs="platform-shared-formfield">
          <div className="overview__stack">
            <FormField label="Nombre para mostrar" hint="Cómo lo verán sus alumnos.">
              <input type="text" name="displayName" defaultValue="Fernanda Ríos" />
            </FormField>
            <FormField label="Email" error="Ya existe una cuenta con ese email.">
              <input type="email" name="email" defaultValue="fernanda@ejemplo.com" />
            </FormField>
          </div>
        </Tile>
        <Tile name="PlatformSelect" docs="platform-shared-platformselect">
          <PlatformSelect aria-label="Nivel" defaultValue="intermedio" options={LEVELS} />
        </Tile>
        <Tile name="PlatformDatePicker" docs="platform-shared-platformdatepicker">
          <PlatformDatePicker name="playedAt" defaultValue="2026-10-02" />
        </Tile>
        <Tile name="PlatformChoiceCards" docs="platform-shared-platformchoicecards">
          <PlatformChoiceCards
            name="kind"
            defaultValue="STUDY"
            options={[
              { value: "STUDY", label: "Estudio", description: "Partidas que analizas." },
              { value: "TOURNAMENT", label: "Torneo", description: "Las de una competición." },
            ]}
          />
        </Tile>
        <Tile name="PlatformCheckCards" docs="platform-shared-platformcheckcards">
          <PlatformCheckCards
            name="contentTypes"
            aria-label="Tipos de contenido"
            layout="line"
            defaultValue={["ENDGAMES"]}
            options={[
              { value: "OPENINGS", label: "Aperturas" },
              { value: "TACTICS", label: "Táctica" },
              { value: "ENDGAMES", label: "Finales" },
            ]}
          />
        </Tile>
        <Tile name="FormFieldset" docs="platform-shared-formfield">
          <FormFieldset legend="Temas">
            {["Aperturas", "Táctica", "Finales"].map((topic, index) => (
              <label key={topic}>
                <input type="checkbox" name="topics" value={topic} defaultChecked={index === 1} />
                {topic}
              </label>
            ))}
          </FormFieldset>
        </Tile>
        <Tile name="PlatformInfoTip" docs="platform-shared-platforminfotip">
          <div className="overview__row">
            <span>Slug del curso</span>
            <PlatformInfoTip label="Sobre el slug" text="Se actualiza al cambiar el nombre." />
          </div>
        </Tile>
      </Section>

      <Section title="Feedback">
        <Tile name="PlatformNotice" docs="platform-shared-platformnotice">
          <div className="overview__stack">
            <PlatformNotice message="No se puede eliminar: el curso ya tiene alumnos." />
            <PlatformNotice message="Cuenta creada." variant="success" />
            <PlatformNotice message="Se importaron 498 de 500 partidas." variant="info" />
          </div>
        </Tile>
        <Tile name="EmptyState" docs="platform-shared-emptystate">
          <EmptyState
            title="No tienes clases programadas"
            description="Cuando tu profesor agende una clase aparecerá aquí."
            actionLabel="Ver mis clases"
            actionHref="/clases"
          />
        </Tile>
        <Tile name="ProgressIndicator" docs="platform-shared-progressindicator">
          <div className="overview__stack">
            <ProgressIndicator percent={43} detail="3 de 7 lecciones" />
            <ProgressIndicator percent={100} detail="7 de 7 lecciones" layout="stacked" />
          </div>
        </Tile>
        <Tile name="BoardLoading" docs="platform-shared-boardloading">
          <div className="overview__loading">
            <BoardLoading label="Preparando el tablero…" />
          </div>
        </Tile>
        <Tile name="PlatformError" docs="platform-shared-platformerror">
          <PlatformError retry={() => {}} digest="2817393054" />
        </Tile>
      </Section>

      <Section title="Data">
        <Tile name="PlatformTable" docs="platform-shared-platformtable">
          <PlatformTable columns={["Clase", { label: "Alumnos", align: "right" }]} minWidth={240}>
            <PlatformTableRow>
              <PlatformTableCell strong>Finales de torres</PlatformTableCell>
              <PlatformTableCell align="right">6</PlatformTableCell>
            </PlatformTableRow>
            <PlatformTableRow>
              <PlatformTableCell strong>La defensa siciliana</PlatformTableCell>
              <PlatformTableCell align="right">8</PlatformTableCell>
            </PlatformTableRow>
          </PlatformTable>
        </Tile>
        <Tile name="ActivityList" docs="platform-shared-activitylist">
          <ActivityList
            items={[
              {
                id: "a1",
                typeLabel: "Lección completada",
                subjectName: "Torre activa",
                topicLabel: "Finales",
                dateLabel: "1 de octubre, 2026",
              },
              { id: "a2", typeLabel: "Clase asistida", subjectName: "Najdorf", dateLabel: "29 de septiembre, 2026" },
            ]}
          />
        </Tile>
        <Tile name="StudyStreak" docs="platform-shared-studystreak">
          <StudyStreak streak={{ days: 3, studiedToday: true }} />
        </Tile>
        <Tile name="LocalDateTime" docs="platform-shared-localdatetime">
          <LocalDateTime iso="2026-10-06T23:00:00.000Z" fallback="6 de octubre, 2026 · 23:00 h" />
        </Tile>
      </Section>

      <Section title="Overlays and chess">
        <Tile name="Dialog" docs="platform-primitives-dialog">
          <DialogTrigger />
        </Tile>
        <Tile name="EditGame" docs="platform-shared-editgame">
          <EditGame
            action={settles}
            values={{ white: "Kasparov, Garry", black: "Topalov, Veselin", resultCode: GAME_RESULT.WHITE_WINS }}
            results={[
              { code: GAME_RESULT.WHITE_WINS, label: "1-0" },
              { code: GAME_RESULT.BLACK_WINS, label: "0-1" },
              { code: GAME_RESULT.DRAW, label: "1/2-1/2" },
              { code: GAME_RESULT.ONGOING, label: "*" },
            ]}
            titleHint="Cómo identificas esta partida dentro del estudio."
          />
        </Tile>
        <Tile name="StaticDiagram" docs="platform-shared-classcontentrenderer">
          <StaticDiagram fen="1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1" caption="La posición de Lucena" />
        </Tile>
      </Section>
    </div>
  );
}

const meta = {
  title: "platform/Overview",
  // The sheet already is a page: a Docs page around it would only draw it a
  // second time, inside a frame, so the sidebar opens it on the canvas.
  tags: ["!autodocs"],
  render: () => <OverviewPage />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every piece of the platform at a glance, each linked to its own page. */
export const Overview: Story = {};

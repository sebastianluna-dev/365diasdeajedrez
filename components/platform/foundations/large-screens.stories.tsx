import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { ProgressIndicator } from "@/components/platform/shared/progress-indicator/progress-indicator.comp";
import {
  PlatformTable,
  PlatformTableCell,
  PlatformTableRow,
} from "@/components/platform/shared/platform-table/platform-table.comp";
import { FROM_2XL, FROM_2XL_PROPERTIES, SPACE_STEPS, TYPE_STEPS } from "./scales.const";
import "./foundations.css";

const SAMPLE = "Siguiente lección";

/**
 * A piece of a platform screen, made of the platform's own primitives and shared pieces. It is drawn twice, so
 * its table, a named region, takes a name for each.
 */
function Sample({ tableLabel }: { tableLabel: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--platform-space-4)" }}>
      <section className="platform-card">
        <h3 className="platform-card__title">Continuar</h3>
        <p style={{ margin: "0 0 var(--platform-space-3)", fontSize: "var(--platform-type-lg)" }}>
          Finales de torres · Lección 3: el puente de Lucena
        </p>
        <ProgressIndicator percent={43} detail="3 de 7 lecciones" />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--platform-space-3)",
            marginTop: "var(--platform-space-4)",
          }}
        >
          <button type="button" className="platform-button platform-button_variant_accent">
            Aprender
          </button>
          <button type="button" className="platform-button">
            Ver el curso
          </button>
          <span className="platform-tag">Finales</span>
        </div>
      </section>
      <PlatformNotice message="Cuenta creada." variant="success" />
      <PlatformTable
        label={tableLabel}
        columns={["Clase", "Fecha", { label: "Alumnos", align: "right" }]}
        minWidth={320}
      >
        <PlatformTableRow>
          <PlatformTableCell strong>Finales de torres</PlatformTableCell>
          <PlatformTableCell>6 de octubre</PlatformTableCell>
          <PlatformTableCell align="right">6</PlatformTableCell>
        </PlatformTableRow>
        <PlatformTableRow>
          <PlatformTableCell strong>La defensa siciliana</PlatformTableCell>
          <PlatformTableCell>29 de septiembre</PlatformTableCell>
          <PlatformTableCell align="right">8</PlatformTableCell>
        </PlatformTableRow>
      </PlatformTable>
    </div>
  );
}

function LargeScreensPage() {
  return (
    <div className="platform-page foundations">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Large screens</h1>
        <p className="platform-page__subtitle">The scales from 1536px wide, where there is room to spare.</p>
      </header>
      <p className="foundations__lead">
        From Tailwind&apos;s <code>2xl</code>, 1536px, the type and the spaces take a step up: one block in{" "}
        <code>platform.css</code>, <code>@media (width &gt;= 1536px)</code>, gives each token the value on the right.
        Below, every step at both sizes, and the same piece of a screen drawn at the scale below 1536px and at the one
        above — on any screen, so the two can be compared side by side.
      </p>

      <section className="foundations__group" aria-labelledby="large-screens-sample">
        <h2 id="large-screens-sample" className="foundations__group-title">
          The same piece of a screen
        </h2>
        <div className="foundations__compare">
          <div className="foundations__compare-side">
            <span className="foundations__count">Below 1536px</span>
            <Sample tableLabel="Clases, por debajo de 1536px" />
          </div>
          <div className="foundations__compare-side" style={FROM_2XL_PROPERTIES as CSSProperties}>
            <span className="foundations__count">From 1536px</span>
            <Sample tableLabel="Clases, desde 1536px" />
          </div>
        </div>
      </section>

      <section className="foundations__group" aria-labelledby="large-screens-type">
        <h2 id="large-screens-type" className="foundations__group-title">
          Type
        </h2>
        <ul className="foundations__steps">
          {TYPE_STEPS.map((step) => (
            <li key={step.token} className="foundations__pair">
              <code className="foundations__name">{step.token}</code>
              <span className="foundations__step-specimen" style={{ fontSize: `${step.px}px` }}>
                {step.px}px · {SAMPLE}
              </span>
              <span className="foundations__step-specimen" style={{ fontSize: `${FROM_2XL[step.token] ?? step.px}px` }}>
                {FROM_2XL[step.token] ?? step.px}px · {SAMPLE}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="foundations__group" aria-labelledby="large-screens-space">
        <h2 id="large-screens-space" className="foundations__group-title">
          Space
        </h2>
        <ul className="foundations__steps">
          {SPACE_STEPS.map((step) => (
            <li key={step.token} className="foundations__pair">
              <code className="foundations__name">{step.token}</code>
              <span>
                <span className="foundations__count">{step.px}px</span>
                <span className="foundations__bar" style={{ width: `${step.px}px` }} />
              </span>
              <span>
                <span className="foundations__count">{FROM_2XL[step.token] ?? step.px}px</span>
                <span className="foundations__bar" style={{ width: `${FROM_2XL[step.token] ?? step.px}px` }} />
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const meta = {
  title: "platform/foundations/Large screens",
  parameters: {
    docs: {
      description: {
        component: `
The value each type and space token takes from 1536px wide (Tailwind's
\`2xl\`), read from the \`@media (width >= 1536px)\` block of
\`app/(platform)/platform.css\`: every step at both sizes, and a piece of a
screen drawn at the two scales side by side. The right-hand column sets the
larger values as custom properties, so the real components inside it are
drawn at that scale on any screen.

Reference: [Styling & design tokens › Type and space](/ui/styling#type-and-space) in the docs site.
`,
      },
    },
  },
  render: () => <LargeScreensPage />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The scales from 1536px beside those below it, and a piece of a screen at both. */
export const LargeScreens: Story = { name: "Large screens" };

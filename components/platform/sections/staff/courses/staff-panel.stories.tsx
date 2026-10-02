import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StaffPanel } from "./staff-panel.comp";

// The cards' contents are plain markup with inline styles: in the app each
// section brings its own list and its own sheet, and the card only places it.

const list: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--platform-space-3)",
  margin: 0,
  padding: 0,
  listStyle: "none",
};

const row: CSSProperties = { display: "flex", flexDirection: "column", gap: "var(--platform-space-0-5)" };

const detail: CSSProperties = { fontSize: "var(--platform-type-sm)", color: "var(--platform-text-muted)" };

/** Public historic games, as a chapter's collection lists them. */
const GAMES = [
  { title: "Morphy – Duque de Brunswick y conde Isouard", detail: "París 1858 · 17 jugadas · en 2 lecciones" },
  { title: "Anderssen – Kieseritzky", detail: "Londres 1851 · 23 jugadas · en 1 lección" },
  { title: "Anderssen – Dufresne", detail: "Berlín 1852 · 24 jugadas" },
];

const meta = {
  title: "platform/sections/staff/courses/StaffPanel",
  component: StaffPanel,
  parameters: {
    docs: {
      description: {
        component: `
A card of the courses panel: a header with the title, a short fact and the
card's action at its right edge, an optional sentence under it, and the
content. The header's rule reaches both edges — negative margins cancel the
padding — because a line that stops short reads as an underline of the title
and not as the card's division.

\`action\` and \`children\` are slots from before the rule that a component
receives data: here they are filled with plain markup, where in the app each
section brings its own list, form or dialog.

Source: \`components/platform/sections/staff/courses/staff-panel.comp.tsx\`.
Reference page: [Components › StaffPanel](/components/platform/sections/staff/courses/staff-panel) in the docs site.
`,
      },
    },
  },
  args: {
    title: "Colección de partidas",
    meta: `${GAMES.length}`,
    description:
      "Las lecciones de este capítulo eligen de aquí, y corregir una partida arregla todas las lecciones que la usan.",
    children: (
      <ul style={list}>
        {GAMES.map((game) => (
          <li key={game.title} style={row}>
            <strong>{game.title}</strong>
            <span style={detail}>{game.detail}</span>
          </li>
        ))}
      </ul>
    ),
  },
  argTypes: {
    title: { control: "text", description: "The card's `<h2>`." },
    meta: { control: "text", description: "A short fact next to the title: «5 capítulos · 30 lecciones»." },
    description: {
      control: "text",
      description: "A sentence under the header, when the card does not explain itself.",
    },
    action: { control: false, description: "The card's action, at the right edge of its header." },
    children: { control: false, description: "The content." },
  },
  decorators: [
    // The page's column in the shell (platform-shell.section.css), on the page's grey.
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StaffPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A chapter's collection: the title, its count beside it and a sentence that says what the card is for. */
export const Default: Story = {};

/** With an action: «Agregar fuente» at the right edge of the header, as the course's sources card draws it. */
export const WithAction: Story = {
  args: {
    title: "Procedencia del recurso",
    meta: undefined,
    description: undefined,
    action: (
      <button type="button" className="platform-button platform-button_size_compact">
        Agregar fuente
      </button>
    ),
    children: (
      <ul style={list}>
        <li style={row}>
          <strong>Material de elaboración propia</strong>
          <span style={detail}>Redactado por el equipo de contenidos</span>
        </li>
      </ul>
    ),
  },
};

/** The title alone, in the narrow column of a record: the facts of a chapter and the note under them. */
export const TitleOnly: Story = {
  args: {
    title: "Resumen",
    meta: undefined,
    description: undefined,
    children: (
      <div style={list}>
        <dl style={{ ...list, gap: "var(--platform-space-2)" }}>
          {[
            ["Lecciones", "4"],
            ["Con PGN", "3"],
            ["Ejercicios", "7"],
            ["Duración", "38 min"],
          ].map(([term, value]) => (
            <div key={term} style={{ display: "flex", justifyContent: "space-between" }}>
              <dt style={detail}>{term}</dt>
              <dd style={{ margin: 0, fontWeight: 700 }}>{value}</dd>
            </div>
          ))}
        </dl>
        <p style={{ ...detail, margin: 0 }}>
          La duración es la suma de los minutos de sus lecciones: se recalcula al guardar una.
        </p>
      </div>
    ),
  },
  decorators: [
    // The record's aside (staff-editor.comp.css): 360px.
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};

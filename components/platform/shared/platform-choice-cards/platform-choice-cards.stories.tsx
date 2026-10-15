import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlatformChoiceCards } from "./platform-choice-cards.comp";

const KINDS = [
  { value: "TOURNAMENT", label: "Torneo", description: "Tus partidas de competición" },
  { value: "STUDY", label: "Estudio", description: "Estudio libre de posiciones" },
  { value: "COLLECTION", label: "Colección", description: "Para compartir con tus alumnos" },
];

const meta = {
  title: "platform/shared/PlatformChoiceCards",
  component: PlatformChoiceCards,
  parameters: {
    docs: {
      description: {
        component: `
One choice among a few, each drawn as a card, on Radix's \`RadioGroup\`
primitive: the whole card is the radio, the arrows move the choice, and inside
a form it submits through the hidden native radio the primitive keeps.

Source: \`components/platform/shared/platform-choice-cards/platform-choice-cards.comp.tsx\`.
Reference page: [Components › PlatformChoiceCards](/components/platform/shared/platform-choice-cards) in the docs site.
`,
      },
    },
  },
  args: {
    options: KINDS,
    defaultValue: "STUDY",
    disabled: false,
    "aria-label": "Tipo de estudio",
  },
  argTypes: {
    options: { control: "object", description: "Value, label and one-line description per card." },
    defaultValue: { control: "select", options: KINDS.map((kind) => kind.value), description: "Initial choice." },
    disabled: { control: "boolean" },
    layout: { control: "inline-radio", options: ["stacked", "line"], description: "`line`: a row of narrow cells." },
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 560, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlatformChoiceCards>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Three kinds, one chosen: accent border and wash on the chosen card. */
export const Default: Story = {};

/** Two cards without descriptions: the label alone. */
export const LabelsOnly: Story = {
  args: { options: KINDS.slice(0, 2).map(({ value, label }) => ({ value, label })), defaultValue: "TOURNAMENT" },
};

const COUNTS = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "4", label: "4" },
  { value: "8", label: "8" },
  { value: "other", label: "Otra" },
];

/** `layout="line"`: a row of narrow cells for options that are a figure («¿Cuántas clases?»), one chosen. */
export const Line: Story = {
  args: { layout: "line", options: COUNTS, defaultValue: "4", "aria-label": "Clases" },
};

/** A line with a cell that cannot be chosen: offered, greyed, skipped by the arrows. */
export const LineWithDisabled: Story = {
  name: "Line with disabled",
  args: {
    layout: "line",
    options: [
      { value: "yes", label: "Asistió" },
      { value: "no", label: "Faltó" },
      { value: "moved", label: "Reprogramada", disabled: true },
    ],
    defaultValue: "yes",
    "aria-label": "Asistencia",
  },
};

/** Required and nothing chosen yet: every mark is an empty ring; the form that holds it will not submit until one is. */
export const RequiredUnanswered: Story = {
  name: "Required, unanswered",
  args: { layout: "line", options: COUNTS, defaultValue: undefined, required: true, "aria-label": "Clases" },
};

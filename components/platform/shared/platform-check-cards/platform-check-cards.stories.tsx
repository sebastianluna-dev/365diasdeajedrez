import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlatformCheckCards } from "./platform-check-cards.comp";

const CONTENT_TYPES = [
  { value: "OPENINGS", label: "Aperturas", description: "Principios, repertorio, variantes y planes típicos." },
  { value: "TACTICS", label: "Táctica", description: "Dobles ataques, clavadas, desviaciones y mates." },
  {
    value: "CALCULATION",
    label: "Cálculo y visualización",
    description: "Jugadas candidatas y cálculo de respuestas.",
  },
  { value: "ENDGAMES", label: "Finales", description: "Oposición, peones pasados, finales de torres." },
];

const meta = {
  title: "platform/shared/PlatformCheckCards",
  component: PlatformCheckCards,
  parameters: {
    docs: {
      description: {
        component: `
Several choices among a few, each drawn as a card, on Radix's \`Checkbox\`
primitive: the whole card is the box, Space toggles it, and inside a form
every chosen card submits through its hidden native checkbox.

Source: \`components/platform/shared/platform-check-cards/platform-check-cards.comp.tsx\`.
Reference page: [Components › PlatformCheckCards](/components/platform/shared/platform-check-cards) in the docs site.
`,
      },
    },
  },
  args: {
    options: CONTENT_TYPES,
    defaultValue: ["TACTICS", "ENDGAMES"],
    disabled: false,
    "aria-label": "Tipo de contenido",
  },
  argTypes: {
    options: { control: "object", description: "Value, label and one-line description per card." },
    defaultValue: { control: "object", description: "Initial set of chosen values." },
    layout: {
      control: "inline-radio",
      options: ["stacked", "line"],
      description: "`line`: two columns and each card's text on a single line.",
    },
    disabled: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 640, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlatformCheckCards>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Four cards, two chosen: accent border, wash and the tick on those two. */
export const Default: Story = {};

/** Nothing chosen yet: every mark is an empty ring. */
export const Empty: Story = {
  args: { defaultValue: [] },
};

/** Two columns, one line per card: the level's name with its range beside it. */
export const Line: Story = {
  args: {
    layout: "line",
    options: [
      { value: "iniciacion", label: "Iniciación", meta: "Elo menos de 800" },
      { value: "principiante", label: "Principiante", meta: "Elo 800–1199" },
      { value: "intermedio", label: "Intermedio", meta: "Elo 1200–1599" },
      { value: "avanzado", label: "Avanzado", meta: "Elo 1600–1999" },
    ],
    defaultValue: ["intermedio"],
    "aria-label": "Niveles",
  },
};

/** Labels alone, without descriptions. */
export const LabelsOnly: Story = {
  args: {
    options: CONTENT_TYPES.slice(0, 3).map(({ value, label }) => ({ value, label })),
    defaultValue: ["OPENINGS"],
  },
};

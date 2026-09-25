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

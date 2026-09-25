import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { PlatformSelect } from "./platform-select.comp";

const STUDY_KINDS = [
  { value: "personal", label: "Estudio personal" },
  { value: "opening", label: "Repertorio de aperturas" },
  { value: "collection", label: "Colección" },
];

const meta = {
  title: "platform/shared/PlatformSelect",
  component: PlatformSelect,
  parameters: {
    docs: {
      description: {
        component: `
The platform's select on Radix's \`Select\` primitive: a trigger that looks like
the platform's inputs and a list drawn with the platform's tokens, keyboard
navigable and typeahead searchable. Inside a form it submits through a hidden
native \`<select name>\` the primitive keeps in sync.

The list is rendered next to the trigger, not portalled to \`<body>\`, so it
also works inside a modal \`<dialog>\`.

Source: \`components/platform/shared/platform-select/platform-select.comp.tsx\`.
Reference page: [Components › PlatformSelect](/components/platform/shared/platform-select) in the docs site.
`,
      },
    },
  },
  args: {
    options: STUDY_KINDS,
    defaultValue: "personal",
    placeholder: "Elige un tipo",
    disabled: false,
    "aria-label": "Tipo de estudio",
  },
  argTypes: {
    options: { control: "object", description: "The choices, value and label." },
    defaultValue: { control: "select", options: STUDY_KINDS.map((kind) => kind.value), description: "Initial choice." },
    placeholder: { control: "text", description: "Trigger text while nothing is chosen." },
    disabled: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 360, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlatformSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A choice already made, the usual case in the platform's forms. */
export const Default: Story = {};

/** Nothing chosen yet: the trigger shows the placeholder in the muted colour. */
export const WithPlaceholder: Story = {
  args: { defaultValue: undefined },
};

/** Disabled: faint text, no pointer. */
export const Disabled: Story = {
  args: { disabled: true },
};

/** The list open, as the keyboard or a click leaves it: the chosen item carries the check. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("combobox"));
  },
};

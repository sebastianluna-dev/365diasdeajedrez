import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { PlatformLookContext } from "@/components/platform/shared/platform-look";
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
    tone: {
      control: "inline-radio",
      options: ["selection", "accent"],
      description:
        "`selection` (a form's blue) or `accent` (the brand's red, for a filter or an order outside a form).",
    },
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
  parameters: {
    // While the list is open the primitive marks everything outside it
    // aria-hidden, the trigger included, and the trigger keeps its tab stop:
    // axe reports aria-hidden-focus. Nothing can focus it then (the list
    // holds the focus and swallows Tab, and a pointer outside closes the list
    // first, which takes the aria-hidden off), so the rule is kept for every
    // other hidden element and only the trigger is left out. The
    // component's page in the docs says how this was checked.
    a11y: {
      config: {
        rules: [{ id: "aria-hidden-focus", selector: '[aria-hidden="true"]:not(.platform-select__trigger)' }],
      },
    },
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("combobox"));
  },
};

/**
 * The accent tone, for a select that sorts or filters outside a form (the order of «Mis estudios»): the list open, the
 * option under the pointer in the brand's red instead of a form's blue.
 */
export const Accent: Story = {
  args: { tone: "accent", "aria-label": "Ordenar" },
  parameters: Open.parameters,
  play: Open.play,
};

/** Inside a popup of a page moved to the new design system (its look set here by hand, on the dialog's surface). */
const materialDialog: NonNullable<Story["decorators"]> = [
  (Story) => (
    <PlatformLookContext value="material">
      <div style={{ padding: 24, borderRadius: 28, background: "var(--platform-m3-dialog)" }}>
        <Story />
      </div>
    </PlatformLookContext>
  ),
];

/** Material's look, closed: the trigger is the outlined text field, with its caret at the end. */
export const Material: Story = { decorators: materialDialog };

/**
 * Material's look, open: the trigger's outline in the primary at 2px and the list as Material's menu — 48px options
 * on the container, the chosen one on the secondary container, no tick.
 */
export const MaterialOpen: Story = {
  name: "Material open",
  decorators: materialDialog,
  parameters: Open.parameters,
  play: Open.play,
};

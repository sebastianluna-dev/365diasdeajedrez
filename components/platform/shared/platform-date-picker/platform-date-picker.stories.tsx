import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { PlatformDatePicker } from "./platform-date-picker.comp";

const meta = {
  title: "platform/shared/PlatformDatePicker",
  component: PlatformDatePicker,
  parameters: {
    docs: {
      description: {
        component: `
The platform's date picker: a trigger that looks like the platform's inputs
and, on Radix's \`Popover\`, a month calendar of our own (Radix has no date
primitive), keyboard navigable, with "Hoy" and "Borrar". Inside a form it
submits like \`<input type="date">\` through a hidden native date input,
which also keeps \`required\`, \`min\` and \`max\`.

The calendar is rendered next to the trigger, not portalled to \`<body>\`,
so it also works inside a modal \`<dialog>\`.

Source: \`components/platform/shared/platform-date-picker/platform-date-picker.comp.tsx\`.
Reference page: [Components › PlatformDatePicker](/components/platform/shared/platform-date-picker) in the docs site.
`,
      },
    },
  },
  args: {
    defaultValue: "2026-09-25",
    placeholder: "Elige una fecha",
    disabled: false,
    "aria-label": "Fecha de la partida",
  },
  argTypes: {
    defaultValue: { control: "text", description: "Initial date, yyyy-mm-dd." },
    placeholder: { control: "text", description: "Trigger text while no date is chosen." },
    min: { control: "text", description: "Earliest choosable day, yyyy-mm-dd." },
    max: { control: "text", description: "Latest choosable day, yyyy-mm-dd." },
    disabled: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 360, padding: 24, minHeight: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlatformDatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A date already chosen, the usual case when editing. */
export const Default: Story = {};

/** Nothing chosen yet: the trigger shows the placeholder in the muted colour. */
export const WithPlaceholder: Story = {
  args: { defaultValue: undefined },
};

/** Only a window of days can be chosen; the rest are disabled. */
export const WithRange: Story = {
  args: { min: "2026-09-10", max: "2026-09-30" },
};

/** Disabled: faint text, no pointer. */
export const Disabled: Story = {
  args: { disabled: true },
};

/** The calendar open on the chosen day's month. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Fecha de la partida" }));
  },
};

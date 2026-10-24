import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { PlatformLookContext } from "@/components/platform/shared/platform-look";
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
primitive), keyboard navigable, with "Hoy" and "Quitar". Inside a form it
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

/**
 * Inside a popup of a page moved to the new design system (its look set here by hand, on the dialog's surface), open:
 * the trigger is the outlined text field with the calendar at its end, and the calendar Material's docked one — round
 * days, the chosen one a circle of the primary, today ringed in it, «Hoy» and «Quitar» as text buttons.
 */
export const MaterialOpen: Story = {
  name: "Material open",
  decorators: [
    (Story) => (
      <PlatformLookContext value="material">
        <div style={{ padding: 24, borderRadius: 28, background: "var(--platform-m3-dialog)" }}>
          <Story />
        </div>
      </PlatformLookContext>
    ),
  ],
  play: Open.play,
};

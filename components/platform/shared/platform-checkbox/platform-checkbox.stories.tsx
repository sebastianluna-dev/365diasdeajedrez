import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlatformCheckbox } from "./platform-checkbox.comp";

const meta = {
  title: "platform/shared/PlatformCheckbox",
  component: PlatformCheckbox,
  parameters: {
    docs: {
      description: {
        component: `
The platform's single checkbox, on Radix's \`Checkbox\` primitive: a box and
what it says, with a line under it when ticking it has consequences. The whole
row is the label; inside a form it submits through its hidden native checkbox.
Ticked, the box keeps its outline and takes the accent in it.

Source: \`components/platform/shared/platform-checkbox/platform-checkbox.comp.tsx\`.
Reference page: [Components › PlatformCheckbox](/components/platform/shared/platform-checkbox) in the docs site.
`,
      },
    },
  },
  args: {
    name: "isPriority",
    label: "Lección de prioridad",
    hint: "Entra en el recorrido corto de quien estudia con poco tiempo.",
    defaultChecked: true,
    disabled: false,
  },
  argTypes: {
    label: { control: "text", description: "What is ticked, beside the box." },
    hint: { control: "text", description: "A line under the label: what ticking it does." },
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 420, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlatformCheckbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Ticked, with its hint: the accent's border and wash around the tick. */
export const Default: Story = {};

/** Not ticked: the empty box in the strong border's grey. */
export const Unticked: Story = {
  args: { defaultChecked: false },
};

/** A name alone, as a student's row in the attendance. */
export const LabelOnly: Story = {
  args: { name: "attended", value: "student-1", label: "Ana Torres", hint: undefined },
};

/** Switched off: the row in the faint grey, and the pointer no longer promises. */
export const Disabled: Story = {
  args: { disabled: true },
};

/** The accent tone with a count, as the catalog's filters draw it: ticked in the brand's red, outside any form. */
export const FilterAccent: Story = {
  args: { label: "Intermedio", hint: undefined, tone: "accent", count: 5, defaultChecked: true },
};

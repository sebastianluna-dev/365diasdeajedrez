import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlatformSwitch } from "./platform-switch.comp";

const meta = {
  title: "platform/shared/PlatformSwitch",
  component: PlatformSwitch,
  parameters: {
    docs: {
      description: {
        component: `
An on/off that takes effect the moment it is pressed, on Radix's \`Switch\`
primitive: the whole row is the switch. Off, the row is grey and sunk; on, it
is a white card lifted off what holds it and the knob has crossed to the accent.

Source: \`components/platform/shared/platform-switch/platform-switch.comp.tsx\`.
Reference page: [Components › PlatformSwitch](/components/platform/shared/platform-switch) in the docs site.
`,
      },
    },
  },
  args: {
    label: "Sólo lecciones de prioridad",
    defaultChecked: true,
    disabled: false,
  },
  argTypes: {
    label: { control: "text", description: "What is switched on, at the left of the row." },
    hint: { control: "text", description: "A line under the label: what switching it on does." },
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 360, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlatformSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** On: the white row lifted off the canvas, the knob at the right on the accent. */
export const Default: Story = {};

/** Off: the row sunk in the neutral grey, the knob at the left on a grey track. */
export const Off: Story = {
  args: { defaultChecked: false },
};

/** With a hint under the label, on and off side by side. */
export const WithHint: Story = {
  args: { hint: "El índice esconde las demás." },
  render: (args) => (
    <div style={{ display: "grid", gap: 12 }}>
      <PlatformSwitch {...args} />
      <PlatformSwitch {...args} defaultChecked={false} label="Módulo de análisis" hint="Apagado, no gasta batería." />
    </div>
  ),
};

/** Switched off: the label in the faint grey, and the pointer no longer promises. */
export const Disabled: Story = {
  args: { disabled: true, defaultChecked: false },
};

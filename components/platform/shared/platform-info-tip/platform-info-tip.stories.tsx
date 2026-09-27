import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlatformInfoTip } from "./platform-info-tip.comp";

const meta = {
  title: "platform/shared/PlatformInfoTip",
  component: PlatformInfoTip,
  parameters: {
    docs: {
      description: {
        component: `
A clarification folded into an "i": a small round button that shows its text
on hover, on keyboard focus and on press, on Radix's \`Tooltip\` primitive.

Source: \`components/platform/shared/platform-info-tip/platform-info-tip.comp.tsx\`.
Reference page: [Components › PlatformInfoTip](/components/platform/shared/platform-info-tip) in the docs site.
`,
      },
    },
  },
  args: {
    label: "Sobre el slug",
    text: "Se actualiza al cambiar el nombre; puedes ajustarlo después. Minúsculas, números y guiones.",
    side: "top",
  },
  argTypes: {
    text: { control: "text", description: "What the tip says." },
    label: { control: "text", description: "The button's accessible name." },
    side: { control: "inline-radio", options: ["top", "right", "bottom", "left"] },
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ display: "flex", justifyContent: "center", padding: "120px 24px 40px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlatformInfoTip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed: hover it, reach it with Tab or press it. */
export const Default: Story = {};

/** Opening under the button, where there is no room above. */
export const Below: Story = {
  args: { side: "bottom" },
};

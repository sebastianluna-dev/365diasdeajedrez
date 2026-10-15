import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { CopyLinkButton } from "./copy-link-button.comp";

const meta = {
  title: "platform/shared/CopyLinkButton",
  component: CopyLinkButton,
  parameters: {
    docs: {
      description: {
        component: `
A quiet square button that copies a link to the clipboard and says so for two
seconds: the tick in place of the copy icon, and «Enlace copiado» in a live
region.

Source: \`components/platform/shared/copy-link-button/copy-link-button.comp.tsx\`.
Reference page: [Components › CopyLinkButton](/components/platform/shared/copy-link-button) in the docs site.
`,
      },
    },
  },
  args: { url: "https://zoom.us/j/11111111111", label: "Copiar el enlace de la reunión" },
  argTypes: { url: { control: "text" }, label: { control: "text" } },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CopyLinkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** At rest: the copy icon. */
export const Default: Story = {};

/** Pressed: the tick, and «Enlace copiado» announced. The headless browser has no clipboard, so the story lends one. */
export const Copied: Story = {
  play: async ({ canvasElement }) => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async () => undefined },
      configurable: true,
    });
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Copiar el enlace de la reunión" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Enlace copiado");
  },
};

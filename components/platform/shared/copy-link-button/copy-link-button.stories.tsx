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
A square button that copies a link to the clipboard and says so for two
seconds: the tick in place of the copy icon, and «Enlace copiado» in a live
region. Small and quiet beside a line of text; large and boxed (\`size="lg"\`)
beside a large «Entrar a la clase», as on a class's ticket.

Source: \`components/platform/shared/copy-link-button/copy-link-button.comp.tsx\`.
Reference page: [Components › CopyLinkButton](/components/platform/shared/copy-link-button) in the docs site.
`,
      },
    },
  },
  args: { url: "https://zoom.us/j/11111111111", label: "Copiar el enlace de la reunión" },
  argTypes: {
    url: { control: "text" },
    label: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "lg"] },
  },
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

/** Large: the secondary box at 48px, as on a class's ticket beside «Entrar a la clase». */
export const Large: Story = { args: { size: "lg" } };

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

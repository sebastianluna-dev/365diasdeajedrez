import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { PlatformError } from "./platform-error.comp";

const meta = {
  title: "platform/shared/PlatformError",
  component: PlatformError,
  parameters: {
    docs: {
      description: {
        component: `
What the platform's error boundary (\`app/(platform)/error.tsx\`) shows when a
page fails to load: a line, «Reintentar», which calls Next's \`retry\` to load
the data and render again, and the error's code when there is one — the
\`digest\` is the only part of the error that reaches the browser in
production, and the same one the server logs.

Source: \`components/platform/shared/platform-error/platform-error.comp.tsx\`.
Reference page: [Components › PlatformError](/components/platform/shared/platform-error) in the docs site.
`,
      },
    },
  },
  args: { retry: fn() },
  argTypes: {
    retry: { description: "Next 16's error boundary `retry`; a spy here, listed in the Actions panel." },
    message: { control: "text" },
    digest: { control: "text", description: "The code Next logs on the server for this error." },
  },
} satisfies Meta<typeof PlatformError>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As the boundary renders it in production: the default line and the error's code. */
export const WithCode: Story = { name: "With code", args: { digest: "2817393054" } };

/** Without a code, as in development or for an error that carries none. */
export const WithoutCode: Story = { name: "Without code" };

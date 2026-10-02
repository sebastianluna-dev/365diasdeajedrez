import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { pgnImportNotice } from "@/constants/platform/pgn-import-messages.const";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { PlatformNotice } from "./platform-notice.comp";

const meta = {
  title: "platform/shared/PlatformNotice",
  component: PlatformNotice,
  parameters: {
    docs: {
      description: {
        component: `
The result of an action, as a paragraph with \`role="alert"\` so a screen
reader announces it on return. Platform forms are \`<form action>\` and send a
failure back by redirect with \`?error=<code>\`; the page looks the code up in
its message map and passes the text here. Success and information use the
same piece.

Source: \`components/platform/shared/platform-notice/platform-notice.comp.tsx\`.
Reference page: [Components › PlatformNotice](/components/platform/shared/platform-notice) in the docs site.
`,
      },
    },
  },
  args: { message: STAFF_ERROR_MESSAGES.deleteBlocked ?? "", variant: "error" },
  argTypes: {
    message: { control: "text", description: "The text, already translated by the page." },
    variant: { control: "inline-radio", options: ["error", "success", "info"] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlatformNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A failure, the default: the staff tried to delete a chapter or a lesson of a course that is no longer a draft. */
export const Failure: Story = { name: "Error" };

/** A success: what the staff's account form says once the account exists. */
export const Success: Story = { args: { message: "Cuenta creada.", variant: "success" } };

/** Information: a PGN import that brought in less than the file had, in the importer's own words. */
export const Info: Story = {
  args: { message: pgnImportNotice({ imported: 498, skippedEmpty: 2, overLimit: 0 }), variant: "info" },
};

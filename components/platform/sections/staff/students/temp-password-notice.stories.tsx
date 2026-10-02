import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { TempPasswordNotice } from "./temp-password-notice.comp";

const meta = {
  title: "platform/sections/staff/students/TempPasswordNotice",
  component: TempPasswordNotice,
  parameters: {
    docs: {
      description: {
        component: `
The one place a generated password is ever seen: the staff's account form and
password reset show it once, above the form, in the response of the action
that generated it — it is not stored, does not travel in the URL and is gone
on reload. The action's message, the warning to write it down now, the
password in plain view and «Copiar», which turns into «Copiada»; without
clipboard permission the label stays and the password is copied by hand. The
passwords here are invented, twelve characters of base64url like the ones
\`generateTempPassword\` makes.

Source: \`components/platform/sections/staff/students/temp-password-notice.comp.tsx\`.
Reference page: [Components › TempPasswordNotice](/components/platform/sections/staff/students/temp-password-notice) in the docs site.
`,
      },
    },
  },
  args: { password: "q7Rm-2xKfV_9", message: "Cuenta creada." },
  argTypes: {
    password: { control: "text", description: "The temporary password, as the action returned it." },
    message: { control: "text", description: "The action's success message, shown above the warning." },
  },
  decorators: [
    // In the app it sits above the account form, which is 520px wide.
    (Story) => (
      <div style={{ maxWidth: 520 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TempPasswordNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A student account just created with a generated password, above «Nueva cuenta de alumno». */
export const AccountCreated: Story = {};

/** A password reset from the student's record, which also closed every session of the account. */
export const PasswordReset: Story = {
  args: {
    password: "Lw4_tZ8pNc0e",
    message: "Contraseña restablecida. Se han cerrado todas las sesiones de esa cuenta.",
  },
};

/** After «Copiar», by its `play` function: the button says «Copiada». The clipboard is stubbed, so nothing is written to yours. */
export const Copied: Story = {
  beforeEach: () => {
    // A headless or unfocused frame refuses the clipboard and an insecure one
    // has none, and either would leave the label unchanged: an own property
    // that always succeeds shadows the browser's for the story, and is removed
    // after, which brings the browser's back.
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: fn(async () => {}).mockName("clipboard.writeText") },
    });
    return () => {
      Reflect.deleteProperty(navigator, "clipboard");
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Copiar" }));
    await expect(await canvas.findByRole("button", { name: "Copiada" })).toBeInTheDocument();
  },
};

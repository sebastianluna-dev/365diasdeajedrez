import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { SubmitButton } from "./submit-button.comp";

/** Stands in for the server action: it is recorded in the Actions panel and never settles, so the form stays pending. */
const submitted = fn().mockName("server action");
const neverSettles = async (formData: FormData) => {
  submitted(Object.fromEntries(formData));
  await new Promise(() => {});
};

const submit = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getAllByRole("button")[0]!);
  await expect(canvas.getAllByRole("button")[0]).toBeDisabled();
};

const meta = {
  title: "platform/shared/SubmitButton",
  component: SubmitButton,
  parameters: {
    docs: {
      description: {
        component: `
The submit button of every write form of the platform. It reads its form's
status with \`useFormStatus\`: from the submit until the action settles it is
disabled (no double submit), carries \`aria-busy\` and says \`pendingLabel\`.
Every story is inside a \`<form>\` whose action never settles, so a press
leaves it pending; the pending stories press it in their \`play\` function.

Source: \`components/platform/shared/submit-button/submit-button.comp.tsx\`.
Reference page: [Components › SubmitButton](/components/platform/shared/submit-button) in the docs site.
`,
      },
    },
  },
  args: { children: "Crear estudio", pendingLabel: "Creando…" },
  argTypes: {
    children: { control: "text", description: "The label at rest." },
    pendingLabel: { control: "text", description: "The label while the form is pending: a gerund with «…»." },
    className: {
      control: "text",
      description: "Replaces the default `platform-button`: a variant passes the whole list.",
    },
    disabled: { control: "boolean", description: "Combined with the pending state." },
  },
  decorators: [
    (Story) => (
      <form action={neverSettles}>
        <input type="hidden" name="name" value="Defensa siciliana" />
        <Story />
      </form>
    ),
  ],
} satisfies Meta<typeof SubmitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** At rest: the platform's quiet button, the default class. Press it to see it pending. */
export const Resting: Story = {};

/** Pending, after the press: disabled, `aria-busy`, and the verb of the action as a gerund. */
export const Pending: Story = { play: submit };

/** A variant passes the whole class list, which replaces the default. */
export const Ink: Story = { args: { className: "platform-button platform-button_variant_ink" } };

/** Disabled by its caller, as «Crear estudio» is while the name is empty. */
export const Disabled: Story = { args: { disabled: true } };

/**
 * Several in one form, as the teacher's attendance form has them: «Guardar asistencia», and a «Quitar» on each
 * row that sends its own `formAction`. They share the form's status, so pressing one disables them all. A
 * button whose label is shared passes its resting label as `pendingLabel`, so only the disabled state changes.
 */
export const SeveralInOneForm: Story = {
  name: "Several in one form",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 420 }}>
      <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {["Lucía Herrera", "Mateo Salinas"].map((student) => (
          <li key={student} style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <span style={{ flex: 1 }}>{student}</span>
            <SubmitButton
              formAction={neverSettles}
              name="studentId"
              value={student}
              className="platform-row-action platform-row-action_variant_danger"
              pendingLabel="Quitar"
            >
              Quitar
            </SubmitButton>
          </li>
        ))}
      </ul>
      <div>
        <SubmitButton>Guardar asistencia</SubmitButton>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole("button", { name: "Quitar" })[0]!);
    for (const button of canvas.getAllByRole("button")) await expect(button).toBeDisabled();
  },
};

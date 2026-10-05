import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { FormField } from "@/components/platform/shared/form-field/form-field.comp";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { OptionalFields } from "./optional-fields.comp";

const meta = {
  title: "platform/shared/OptionalFields",
  component: OptionalFields,
  parameters: {
    docs: {
      description: {
        component: `
A set of fields that are all optional, said once: «Todos los campos son
opcionales.» over them, and none of them shows its own «Opcional». A container
that hides the marks with its stylesheet — \`FormField\` is a Server
Component, and the server has no context to tell each field —, so the note and
the hiding cannot drift apart. The record of a game (\`GameFields\`) is its
case: fifteen fields, none required.

Source: \`components/platform/shared/optional-fields/optional-fields.comp.tsx\`.
Reference page: [Components › OptionalFields](/components/platform/shared/optional-fields) in the docs site.
`,
      },
    },
  },
  args: { children: null },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OptionalFields>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Three optional `FormField`s of a game's record under the note: the note shows, and no field's «Opcional» does. */
export const Default: Story = {
  render: () => (
    <OptionalFields>
      <FormField label="Evento">
        <input type="text" name="event" maxLength={120} defaultValue="Nacional Abierto 2026" />
      </FormField>
      <FormField label="Lugar">
        <input type="text" name="site" maxLength={120} />
      </FormField>
      <FormField label="Ronda">
        <input type="text" name="round" maxLength={120} />
      </FormField>
    </OptionalFields>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Todos los campos son opcionales.")).toBeVisible();
    for (const mark of canvasElement.querySelectorAll(".optional-mark")) await expect(mark).not.toBeVisible();
  },
};

/** The same on the platform's form: `PlatformFormField`s inside it lose their mark too. */
export const OnPlatformForm: Story = {
  render: () => (
    <PlatformForm onSubmit={(event) => event.preventDefault()}>
      <OptionalFields>
        <PlatformFormField name="white" label="Blancas">
          <input type="text" maxLength={120} />
        </PlatformFormField>
        <PlatformFormField name="black" label="Negras">
          <input type="text" maxLength={120} />
        </PlatformFormField>
      </OptionalFields>
    </PlatformForm>
  ),
};

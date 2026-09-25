import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { PlatformForm, PlatformFormField } from "./platform-form.comp";

interface FormArgs {
  /** Server-side failure to show under the name field. */
  serverError?: string;
  hint?: string;
}

const meta = {
  title: "platform/shared/PlatformForm",
  parameters: {
    docs: {
      description: {
        component: `
The platform's form on Radix's \`Form\` primitive. \`PlatformForm\` is a plain
\`<form>\` (server actions work as before); \`PlatformFormField\` is label,
control and the messages that answer the control's validity. Press
**Crear estudio** with the name empty to see the field turn invalid: the browser
still blocks the submit, only the bubble is replaced by the message.

Source: \`components/platform/shared/platform-form/platform-form.comp.tsx\`.
Reference page: [Components › PlatformForm](/components/platform/shared/platform-form) in the docs site.
`,
      },
    },
  },
  args: { serverError: undefined, hint: undefined },
  argTypes: {
    serverError: {
      control: "text",
      description: "A failure the server reported for the name field.",
      table: { type: { summary: "string" } },
    },
    hint: { control: "text", description: "Help text under the name field.", table: { type: { summary: "string" } } },
  },
  render: ({ serverError, hint }) => (
    <PlatformForm onSubmit={(event) => event.preventDefault()}>
      <PlatformFormField
        name="name"
        label="Nombre"
        hint={hint}
        serverError={serverError}
        messages={{ valueMissing: "Ponle un nombre al estudio." }}
      >
        <input type="text" maxLength={120} required placeholder="Nacional Abierto 2026" />
      </PlatformFormField>
      <PlatformFormField name="description" label="Descripción (opcional)">
        <textarea maxLength={500} rows={3} placeholder="Para qué te sirve este estudio" />
      </PlatformFormField>
      <PlatformFormField name="kindCode" label="Tipo">
        <PlatformSelect
          options={[
            { value: "personal", label: "Estudio personal" },
            { value: "collection", label: "Colección" },
          ]}
          defaultValue="personal"
          required
        />
      </PlatformFormField>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button type="submit" className="platform-button">
          Crear estudio
        </button>
      </div>
    </PlatformForm>
  ),
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 420, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<FormArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The three fields of "Nuevo estudio", valid and untouched. */
export const Default: Story = {};

/** A message from the server under the name: `serverError` renders it and marks the field invalid. */
export const WithServerError: Story = {
  args: { serverError: "Ya tienes un estudio con ese nombre." },
};

/** A hint under the name field. */
export const WithHint: Story = {
  args: { hint: "Como aparecerá en la lista de estudios." },
};

/** Submitted with the name empty: the browser blocks it and the field shows its message instead of the bubble. */
export const Invalid: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Crear estudio" }));
  },
};

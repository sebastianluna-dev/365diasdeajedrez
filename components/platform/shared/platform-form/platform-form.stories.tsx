import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { PlatformCheckCards } from "@/components/platform/shared/platform-check-cards/platform-check-cards.comp";
import { PlatformChoiceCards } from "@/components/platform/shared/platform-choice-cards/platform-choice-cards.comp";
import { PlatformForm, PlatformFormField, PlatformFormGroup } from "./platform-form.comp";

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
      <PlatformFormField name="description" label="Descripción">
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

/** The three fields of "Nuevo estudio", valid and untouched: the description, which may be left empty, says «Opcional». */
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

/** A clarification folded into an "i" inside the name's input, opened: the label still names the input alone. */
export const WithInfo: Story = {
  render: () => (
    <PlatformForm onSubmit={(event) => event.preventDefault()}>
      <PlatformFormField name="title" label="Nombre" info="Si lo dejas vacío, la partida se nombra por sus jugadores.">
        <input type="text" maxLength={120} defaultValue="Ronda 1" />
      </PlatformFormField>
    </PlatformForm>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: "Nombre" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Sobre «Nombre»" }));
    await expect(await canvas.findByRole("tooltip")).toHaveTextContent(
      "Si lo dejas vacío, la partida se nombra por sus jugadores.",
    );
  },
};

/**
 * A textarea with an "i": the frame holds the text and a strip under it with the count of its `maxLength` and the "i".
 * `play` types, sees the count follow, resets the form and sees it go back to the saved text's.
 */
export const TextareaWithInfo: Story = {
  name: "Textarea with info",
  render: () => (
    <PlatformForm onSubmit={(event) => event.preventDefault()}>
      <PlatformFormField
        name="pinnedComment"
        label="Comentario fijo"
        info="Se muestra al principio de la notación, antes de las jugadas, a quien abra la partida."
      >
        <textarea maxLength={1000} rows={3} defaultValue="Juegan las negras." />
      </PlatformFormField>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button type="reset" className="platform-button">
          Restablecer
        </button>
      </div>
    </PlatformForm>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: "Comentario fijo" });
    await expect(canvas.getByText("18 de 1000 caracteres")).toBeInTheDocument();
    await userEvent.type(textarea, " ¿Qué harías?");
    await expect(canvas.getByText("31 de 1000 caracteres")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Restablecer" }));
    await expect(await canvas.findByText("18 de 1000 caracteres")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Sobre «Comentario fijo»" }));
    await expect(await canvas.findByRole("tooltip")).toHaveTextContent(
      "Se muestra al principio de la notación, antes de las jugadas, a quien abra la partida.",
    );
  },
};

/** A group that may be left with nothing chosen says so with `optional`: «Opcional» beside its label, as a field's. */
export const OptionalGroup: Story = {
  render: () => (
    <PlatformForm onSubmit={(event) => event.preventDefault()}>
      <PlatformFormGroup label="Temas" optional>
        <PlatformCheckCards
          name="topicCodes"
          layout="line"
          options={[
            { value: "PIN", label: "Clavada" },
            { value: "FORK", label: "Doble ataque" },
          ]}
        />
      </PlatformFormGroup>
    </PlatformForm>
  ),
};

const COUNTS = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "4", label: "4" },
  { value: "8", label: "8" },
];

/** A group with a message from the server under it: `serverError` renders it and marks the group invalid. */
export const GroupServerError: Story = {
  name: "Group with server error",
  render: () => (
    <PlatformForm>
      <PlatformFormGroup
        label="Clases"
        serverError="Entre las clases con fecha y las cubiertas hay 5, y el pago es de 4."
      >
        <PlatformChoiceCards layout="line" options={COUNTS} defaultValue="4" name="classCount" />
      </PlatformFormGroup>
    </PlatformForm>
  ),
};

/** A required group submitted with nothing chosen: the browser's bubble is replaced by the message under the group. */
export const GroupValueMissing: Story = {
  name: "Group with value missing",
  render: () => (
    <PlatformForm onSubmit={(event) => event.preventDefault()}>
      <PlatformFormGroup label="Clases" valueMissing="Elige cuántas clases cubre el pago.">
        <PlatformChoiceCards layout="line" options={COUNTS} name="classCount" required />
      </PlatformFormGroup>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button type="submit" className="platform-button">
          Registrar pago
        </button>
      </div>
    </PlatformForm>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Registrar pago" }));
    await expect(canvas.getByText("Elige cuántas clases cubre el pago.")).toBeVisible();
  },
};

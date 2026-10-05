import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { PlatformCheckCards } from "@/components/platform/shared/platform-check-cards/platform-check-cards.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { CONTENT_TYPE } from "@/constants/platform/course-codes.const";
import { FormField, FormFieldset } from "./form-field.comp";

interface FieldArgs {
  label: string;
  hint: string;
  error: string;
}

const meta = {
  title: "platform/shared/FormField",
  parameters: {
    docs: {
      description: {
        component: `
The field of the platform's forms that are not on \`PlatformForm\` yet: a real
\`<label>\` around the control (never a placeholder acting as one), an
optional hint under it, an optional clarification folded into an "i" inside
the input, at its end (\`info\`, a \`PlatformInfoTip\`) and an error with \`role="alert"\`. It also draws, once
for the whole private area, the native text inputs and the textarea it wraps.
\`FormFieldset\`, from the same file, is the legend over a group of cards
(\`PlatformCheckCards\`, \`PlatformChoiceCards\`) a single label cannot name,
with no frame of its own. A new form uses \`PlatformForm\` instead; these are
migrated when they are touched.

Source: \`components/platform/shared/form-field/form-field.comp.tsx\`.
Reference page: [Components › FormField](/components/platform/shared/form-field) in the docs site.
`,
      },
    },
  },
  args: { label: "Nombre para mostrar", hint: "", error: "" },
  argTypes: {
    label: { control: "text" },
    hint: { control: "text", description: "Under the control; empty, none." },
    error: { control: "text", description: 'Under the control, announced (`role="alert"`); empty, none.' },
  },
  render: ({ label, hint, error }) => (
    <FormField label={label} hint={hint || undefined} error={error || undefined}>
      <input type="text" name="displayName" maxLength={120} />
    </FormField>
  ),
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<FieldArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A text input and its label, as the staff's account form starts. */
export const Default: Story = {};

/** With the hint that says what the field is for. */
export const WithHint: Story = { name: "With hint", args: { hint: "Cómo lo verán sus alumnos." } };

/** With a clarification folded into an "i" inside the input, at its end, opened here: the label still names the input alone, and the tip describes its button. */
export const WithInfo: Story = {
  name: "With info",
  render: () => (
    <FormField label="ECO" info="Código de apertura, como «B40».">
      <input type="text" name="eco" maxLength={120} />
    </FormField>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: "ECO" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Sobre «ECO»" }));
    await expect(await canvas.findByRole("tooltip")).toHaveTextContent("Código de apertura, como «B40».");
  },
};

/** With an error under the control. */
export const WithError: Story = {
  name: "With error",
  args: { label: "Email", error: "Ya existe una cuenta con ese email." },
};

/** Focused: the border turns the accent, which is what tells the field from the rest. */
export const Focused: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("textbox"));
  },
};

/** A textarea, which the field draws too: a teacher's biography. */
export const Textarea: Story = {
  render: () => (
    <FormField label="Biografía (opcional)">
      <textarea name="bio" maxLength={1000} />
    </FormField>
  ),
};

/** A select is always `PlatformSelect` inside this field, the same size as its inputs: there are no native ones. */
export const WithPlatformSelect: Story = {
  name: "With PlatformSelect",
  render: () => (
    <FormField label="Zona horaria">
      <PlatformSelect
        name="timezone"
        defaultValue="America/Mexico_City"
        options={[
          { value: "America/Mexico_City", label: "Ciudad de México" },
          { value: "America/Bogota", label: "Bogotá" },
          { value: "Europe/Madrid", label: "Madrid" },
        ]}
      />
    </FormField>
  ),
};

/**
 * `FormFieldset`: a legend over a group of cards, with no frame of its own since each card draws one — the course
 * editor's «Contenido», with `PlatformCheckCards` in a line.
 */
export const Fieldset: Story = {
  render: () => (
    <FormFieldset legend="Contenido (selecciona al menos uno)">
      <PlatformCheckCards
        name="contentTypeCodes"
        defaultValue={[CONTENT_TYPE.ENDGAMES]}
        aria-label="Tipos de contenido"
        layout="line"
        options={[
          { value: CONTENT_TYPE.OPENINGS, label: "Aperturas" },
          { value: CONTENT_TYPE.TACTICS, label: "Táctica" },
          { value: CONTENT_TYPE.ENDGAMES, label: "Finales" },
        ]}
      />
    </FormFieldset>
  ),
};

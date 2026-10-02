import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
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
optional hint under it and an error with \`role="alert"\`. It also draws, once
for the whole private area, the native text inputs and the textarea it wraps.
\`FormFieldset\`, from the same file, is the group of checkboxes or radios a
single label cannot name. A new form uses \`PlatformForm\` instead; these are
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

/** A select is always `PlatformSelect` in its compact size inside this field: there are no native ones. */
export const WithPlatformSelect: Story = {
  name: "With PlatformSelect",
  render: () => (
    <FormField label="Zona horaria">
      <PlatformSelect
        name="timezone"
        defaultValue="America/Mexico_City"
        size="compact"
        options={[
          { value: "America/Mexico_City", label: "Ciudad de México" },
          { value: "America/Bogota", label: "Bogotá" },
          { value: "Europe/Madrid", label: "Madrid" },
        ]}
      />
    </FormField>
  ),
};

/** `FormFieldset`: a group of checkboxes under one legend, in its frame, as the lesson editor's topics. */
export const Fieldset: Story = {
  render: () => (
    <FormFieldset legend="Temas" hint="Los que trata la lección; ninguno, si no trata uno en especial.">
      {["Aperturas", "Táctica", "Finales"].map((topic, index) => (
        <label key={topic}>
          <input type="checkbox" name="topics" value={topic} defaultChecked={index === 1} />
          {topic}
        </label>
      ))}
    </FormFieldset>
  ),
};

/**
 * `FormFieldset` with `frame="none"`: no border nor padding around the group, for controls that draw their own
 * boxes — the course editor's «Contenido», with `PlatformCheckCards` in a line.
 */
export const FieldsetWithoutFrame: Story = {
  name: "Fieldset without frame",
  render: () => (
    <FormFieldset legend="Contenido (selecciona al menos uno)" frame="none">
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

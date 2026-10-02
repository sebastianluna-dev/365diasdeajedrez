import { useActionState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { CurrentPathField } from "./current-path-field.comp";

/** A form with the field and a button, which prints what the form sent instead of sending it. */
function SentForm({ name }: { name: string }) {
  const [sent, send] = useActionState(
    (_previous: string | null, formData: FormData) => `${name} = ${String(formData.get(name))}`,
    null,
  );
  return (
    <form action={send} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
      <CurrentPathField name={name} />
      <button type="submit" className="platform-button platform-button_size_compact">
        Enviar el formulario
      </button>
      <output>{sent ?? "Nada enviado todavía."}</output>
    </form>
  );
}

const meta = {
  title: "platform/shared/CurrentPathField",
  component: CurrentPathField,
  parameters: {
    nextjs: { navigation: { pathname: "/cursos/finales-de-torres/2/18" } },
    docs: {
      description: {
        component: `
The page one is on, as a hidden field: what a form that has to come back where
it was sends along (\`returnTo\` is what the platform's actions read). It is a
client component because it is mounted inside a layout, which is not rendered
again on a navigation within it; a client component is, so it keeps naming the
page one is really on. It draws nothing: the story puts it in a form that
prints what it sent, with the path Storybook's router reports.

Source: \`components/platform/shared/current-path-field/current-path-field.comp.tsx\`.
Reference page: [Components › CurrentPathField](/components/platform/shared/current-path-field) in the docs site.
`,
      },
    },
  },
  args: { name: "returnTo" },
  argTypes: { name: { control: "text", description: "The field's name; `returnTo` for the platform's actions." } },
  render: ({ name }) => <SentForm name={name} />,
} satisfies Meta<typeof CurrentPathField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Before the form is sent: nothing to see, which is the point. */
export const Default: Story = {};

/** Sent: the form carried the page it was on, as the lesson's «Sólo lecciones de prioridad» does to come back to the lesson being read. */
export const Sent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Enviar el formulario" }));
    await expect(await canvas.findByText("returnTo = /cursos/finales-de-torres/2/18")).toBeInTheDocument();
  },
};

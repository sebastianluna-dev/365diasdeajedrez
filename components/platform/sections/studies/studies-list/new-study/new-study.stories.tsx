import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { NewStudyForm } from "./new-study-form.comp";
import "./new-study.comp.css";

const STUDENT_KINDS = [
  { code: "STUDY", label: "Estudio" },
  { code: "TOURNAMENT", label: "Torneo" },
];

const TEACHER_KINDS = [...STUDENT_KINDS, { code: "COLLECTION", label: "Colección" }];

const meta = {
  title: "platform/sections/studies/NewStudy",
  component: NewStudyForm,
  parameters: {
    docs: {
      description: {
        component: `
The "Nuevo estudio" dialog's form, mounted here without the \`<dialog>\` and
with a stub in place of \`createStudy\`. Head with the study's mark, the three
fields on \`PlatformForm\` (the kind as \`PlatformChoiceCards\`) and the footer
band; the submit stays off until the study has a name.

Source: \`components/platform/sections/studies/studies-list/new-study/\`.
Reference page: [Components › NewStudy](/components/platform/sections/studies/studies-list/new-study) in the docs site.
`,
      },
    },
  },
  args: {
    kinds: STUDENT_KINDS,
    action: () => undefined,
    onClose: () => undefined,
  },
  argTypes: {
    kinds: { control: "object", description: "Kinds the viewer can create, from the catalog." },
    action: { table: { disable: true } },
    onClose: { table: { disable: true } },
    onSubmit: { table: { disable: true } },
  },
  decorators: [
    // The dialog frame, laid out in flow instead of the top layer.
    (Story) => (
      <div className="platform-theme" style={{ padding: 32, background: "#2a2320" }}>
        <div className="new-study">
          <div className="platform-dialog new-study__dialog" style={{ position: "static", overflow: "hidden" }}>
            <Story />
          </div>
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof NewStudyForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** What a student sees: two kinds, the first one chosen, the submit off until a name is typed. */
export const Student: Story = {};

/** A teacher gets the collection too, so the cards are three across. */
export const Teacher: Story = {
  args: { kinds: TEACHER_KINDS },
};

/** A name typed and the second kind chosen: the submit is on. */
export const Filled: Story = {
  args: { kinds: TEACHER_KINDS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Nombre"), "Nacional Abierto 2026");
    await userEvent.click(canvas.getByRole("radio", { name: /Torneo/ }));
  },
};

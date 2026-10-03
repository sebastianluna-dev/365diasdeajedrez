import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { CourseSourceForm } from "./course-source-form.comp";
import "./course-source-dialog.comp.css";

const SOURCE_TYPES = [
  { code: "BOOK", label: "Libro" },
  { code: "DIGITAL_COURSE", label: "Curso digital" },
  { code: "VIDEO", label: "Vídeo o serie de vídeos" },
  { code: "OWN_MATERIAL", label: "Material de elaboración propia" },
];

const meta = {
  title: "platform/sections/staff/courses/course-sources/CourseSourceForm",
  component: CourseSourceForm,
  parameters: {
    docs: {
      description: {
        component: `
The fields of one source of a course's «Procedencia del recurso», mounted here
without the \`<dialog>\` and with a stub in place of \`saveCourseSource\`. Only the
type is required.

Source: \`components/platform/sections/staff/courses/course-sources/\`.
Reference page: [Components › CourseSources](/components/platform/sections/staff/courses/course-sources) in the docs site.
`,
      },
    },
  },
  args: {
    sourceTypes: SOURCE_TYPES,
    action: () => undefined,
    onClose: () => undefined,
  },
  argTypes: {
    sourceTypes: { control: "object", description: "The kinds of resource, from the catalog." },
    source: { control: "object", description: "The source being edited; absent when adding one." },
    action: { table: { disable: true } },
    onClose: { table: { disable: true } },
    onSubmit: { table: { disable: true } },
  },
  decorators: [
    // The dialog frame, laid out in flow instead of the top layer.
    (Story) => (
      <div className="platform-theme" style={{ padding: 32, background: "#2a2320" }}>
        <div className="course-source-dialog">
          <div
            className="platform-dialog course-source-dialog__dialog"
            style={{ position: "static", overflow: "hidden" }}
          >
            <Story />
          </div>
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof CourseSourceForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Adding: the first type chosen, every other field empty. */
export const Adding: Story = {};

/** Editing a book: the fields carry the source. */
export const Editing: Story = {
  args: {
    source: {
      id: "s1",
      order: 1,
      sourceTypeCode: "BOOK",
      sourceTypeLabel: "Libro",
      originalTitle: "Mi sistema",
      authors: "Aron Nimzowitsch",
      publicationYear: 1925,
      specificReference: "Capítulos 3 a 5",
    },
  },
};

/** Another kind of resource chosen in the select. */
export const DigitalCourse: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Tipo de fuente" }));
    await userEvent.click(canvas.getByRole("option", { name: "Curso digital" }));
    // The list leaves with an exit animation, and until it has gone Radix keeps
    // the rest of the dialog aria-hidden: wait for it, so the state the story
    // ends in (and the one axe looks at) is the select closed on its new value.
    await waitFor(() => expect(canvas.queryByRole("listbox")).toBeNull());
  },
};

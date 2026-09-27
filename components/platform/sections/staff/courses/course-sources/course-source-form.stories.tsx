import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { CourseSourceForm } from "./course-source-form.comp";
import "./course-source-dialog.comp.css";

const SOURCE_TYPES = [
  { code: "BOOK", label: "Libro" },
  { code: "DIGITAL_COURSE", label: "Curso digital" },
  { code: "VIDEO", label: "Vídeo o serie de vídeos" },
  { code: "OWN_MATERIAL", label: "Material de elaboración propia" },
];

const ENTITIES = [
  { id: "e1", name: "Chessable" },
  { id: "e2", name: "Quality Chess" },
];

const meta = {
  title: "platform/sections/staff/courses/CourseSourceForm",
  component: CourseSourceForm,
  parameters: {
    docs: {
      description: {
        component: `
The fields of one source of a course's «Procedencia del recurso», mounted here
without the \`<dialog>\` and with a stub in place of \`saveCourseSource\`. Only the
type is required; the entity field is named by the type («Editorial» for a
book, «Plataforma o proveedor» for a digital course, «Entidad de origen»
otherwise).

Source: \`components/platform/sections/staff/courses/course-sources/\`.
Reference page: [Components › CourseSources](/components/platform/sections/staff/courses/course-sources) in the docs site.
`,
      },
    },
  },
  args: {
    sourceTypes: SOURCE_TYPES,
    entities: ENTITIES,
    action: () => undefined,
    onClose: () => undefined,
  },
  argTypes: {
    sourceTypes: { control: "object", description: "The kinds of resource, from the catalog." },
    entities: { control: "object", description: "The entities a source can cite." },
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

/** Adding: the first type chosen, every other field empty, the entity field says «Editorial». */
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
      entityId: "e2",
      entityName: "Quality Chess",
      publicationYear: 1925,
      specificReference: "Capítulos 3 a 5",
    },
  },
};

/** Switching to a digital course renames the entity field to «Plataforma o proveedor». */
export const DigitalCourse: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Tipo de fuente" }));
    await userEvent.click(canvas.getByRole("option", { name: "Curso digital" }));
  },
};

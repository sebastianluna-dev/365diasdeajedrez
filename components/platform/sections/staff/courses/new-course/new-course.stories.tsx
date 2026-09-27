import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { NewCourseForm } from "./new-course-form.comp";
import "./new-course.comp.css";

const TYPES = [
  { code: "OPENING", label: "Apertura" },
  { code: "STRATEGY", label: "Estrategia" },
  { code: "ENDGAME", label: "Finales" },
];

const meta = {
  title: "platform/sections/staff/courses/NewCourse",
  component: NewCourseForm,
  parameters: {
    docs: {
      description: {
        component: `
The "Nuevo curso" dialog's form, mounted here without the \`<dialog>\` and
with a stub in place of \`createCourse\`. Head, the three fields the course is
born with (name, slug, type as \`PlatformSelect\`) on \`PlatformForm\` and the
footer band; the submit stays off until it has a name and a slug.

Source: \`components/platform/sections/staff/courses/new-course/\`.
Reference page: [Components › NewCourse](/components/platform/sections/staff/courses/new-course) in the docs site.
`,
      },
    },
  },
  args: {
    types: TYPES,
    action: () => undefined,
    onClose: () => undefined,
  },
  argTypes: {
    types: { control: "object", description: "The course types on offer, from the catalog." },
    action: { table: { disable: true } },
    onClose: { table: { disable: true } },
    onSubmit: { table: { disable: true } },
  },
  decorators: [
    // The dialog frame, laid out in flow instead of the top layer.
    (Story) => (
      <div className="platform-theme" style={{ padding: 32, background: "#2a2320" }}>
        <div className="new-course">
          <div className="platform-dialog new-course__dialog" style={{ position: "static", overflow: "hidden" }}>
            <Story />
          </div>
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof NewCourseForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As it opens: the first type chosen, the submit off until name and slug are typed. */
export const Empty: Story = {};

/** Name and slug typed: the submit is on. */
export const Filled: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Nombre"), "Finales de torre esenciales");
    await userEvent.type(canvas.getByLabelText("Identificador (slug)"), "finales-de-torre-esenciales");
  },
};

/** A slug with spaces and capitals: the field shows its message on submit. */
export const InvalidSlug: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Nombre"), "Finales de torre esenciales");
    await userEvent.type(canvas.getByLabelText("Identificador (slug)"), "Finales de torre");
    await userEvent.click(canvas.getByRole("button", { name: "Crear curso" }));
  },
};

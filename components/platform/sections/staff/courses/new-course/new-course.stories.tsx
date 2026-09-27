import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { NewCourseForm } from "./new-course-form.comp";
import "./new-course.comp.css";

const CONTENT_TYPES = [
  {
    code: "OPENINGS",
    label: "Aperturas",
    shortLabel: "Aperturas",
    description: "Principios, repertorio, variantes y planes típicos al comenzar la partida.",
  },
  {
    code: "STRATEGY",
    label: "Estrategia y juego posicional",
    shortLabel: "Estrategia",
    description: "Evaluar posiciones y construir planes.",
  },
  {
    code: "ENDGAMES",
    label: "Finales",
    shortLabel: "Finales",
    description: "Técnica y posiciones teóricas con pocas piezas.",
  },
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
born with (name, slug, content types as \`PlatformCheckCards\`) on
\`PlatformForm\` and the footer band; the slug writes itself from the name when
the name loses focus, and the submit stays off until it has a name, a slug and
at least one content type.

Source: \`components/platform/sections/staff/courses/new-course/\`.
Reference page: [Components › NewCourse](/components/platform/sections/staff/courses/new-course) in the docs site.
`,
      },
    },
  },
  args: {
    contentTypes: CONTENT_TYPES,
    action: () => undefined,
    onClose: () => undefined,
  },
  argTypes: {
    contentTypes: { control: "object", description: "The content types on offer, from the catalog." },
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

/** As it opens: nothing chosen, the submit off until name, slug and a content type are there. */
export const Empty: Story = {};

/** A name typed and the field left, a card chosen: the slug writes itself and the submit is on. */
export const Filled: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Nombre"), "Fundamentos de la Defensa Siciliana");
    await userEvent.tab();
    await userEvent.click(canvas.getByRole("checkbox", { name: /Aperturas/ }));
  },
};

/** A slug typed by hand is left alone when the name changes afterwards. */
export const OwnSlug: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Identificador (slug)"), "siciliana-basica");
    await userEvent.type(canvas.getByLabelText("Nombre"), "Fundamentos de la Defensa Siciliana");
    await userEvent.tab();
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

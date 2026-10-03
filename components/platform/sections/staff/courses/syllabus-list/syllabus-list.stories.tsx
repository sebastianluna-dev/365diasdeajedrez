import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { CONTENT_ROLE } from "@/constants/platform/course-codes.const";
import { StaffPanel } from "../staff-panel.comp";
import { SyllabusList } from "./syllabus-list.comp";
import type { SyllabusItem } from "./syllabus-list.comp";

/** The chapters of an invented course: five chapters, a closing and no introduction yet. */
const CHAPTERS: SyllabusItem[] = [
  { id: "1", name: "La estructura de peones decide el plan", facts: "6 lecciones", href: "#", canDelete: true },
  {
    id: "2",
    name: "El alfil malo y cómo cambiarlo",
    facts: "4 lecciones",
    href: "#",
    badge: "Prioridad",
    canDelete: true,
  },
  {
    id: "3",
    name: "Columnas abiertas y la séptima",
    facts: "7 lecciones",
    href: "#",
    canDelete: false,
    deleteHint: "Hay alumnos con progreso en este capítulo o en sus lecciones.",
  },
  { id: "4", name: "El rey en el centro", facts: "3 lecciones", href: "#", canDelete: true },
  { id: "5", name: "Finales de torre que hay que saber", facts: "9 lecciones", href: "#", canDelete: true },
  {
    id: "closing",
    name: "Cierre",
    facts: "1 lección",
    href: "#",
    roleCode: CONTENT_ROLE.CLOSING,
    canDelete: false,
    deleteHint: "Sólo se elimina un capítulo mientras el curso está en borrador.",
  },
];

/** The lessons of one of those chapters: the introduction is there, the closing is not. */
const LESSONS: SyllabusItem[] = [
  {
    id: "intro",
    name: "Introducción",
    facts: "Con PGN · 4 min",
    href: "#",
    roleCode: CONTENT_ROLE.INTRO,
    canDelete: false,
  },
  { id: "l1", name: "El peón retrasado", facts: "Con PGN · 3 ejercicios · 12 min", href: "#", canDelete: true },
  { id: "l2", name: "Cadenas de peones", facts: "Con PGN · 2 ejercicios · 9 min", href: "#", canDelete: true },
  {
    id: "l3",
    name: "Mayoría en el flanco de dama",
    facts: "Sin PGN · 0 ejercicios",
    href: "#",
    badge: "Prioridad",
    canDelete: true,
  },
];

const meta = {
  title: "platform/sections/staff/courses/SyllabusList",
  component: SyllabusList,
  parameters: {
    docs: {
      description: {
        component: `
The list a course's chapters and a chapter's lessons are drawn with — they are
the same thing one level apart. Made-up data and stubs in place of the server
actions: dragging a row by its grip, or picking it up with space and moving it
with the arrows, reorders the list on the spot and nothing is saved.

Source: \`components/platform/sections/staff/courses/syllabus-list/\`.
Reference page: [Components › SyllabusList](/components/platform/sections/staff/courses/syllabus-list) in the docs site.
`,
      },
    },
  },
  args: {
    onReorder: async () => undefined,
    createAction: async () => undefined,
    deleteAction: async () => undefined,
  },
  argTypes: {
    onReorder: { table: { disable: true } },
    createAction: { table: { disable: true } },
    deleteAction: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 32, background: "var(--platform-bg)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof SyllabusList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The «Temario» of a course: the introduction is still a slot, the closing exists. */
export const Chapters: Story = {
  name: "Los capítulos de un curso",
  args: {
    items: CHAPTERS,
    noun: "capítulo",
    deleteFieldName: "chapterId",
    newPlaceholder: "Nombre del nuevo capítulo…",
  },
  render: (args) => (
    <StaffPanel title="Temario" meta="5 capítulos · 30 lecciones">
      <SyllabusList {...args} />
    </StaffPanel>
  ),
};

/** The lessons of a chapter, where the minutes are said: the closing is still a slot. */
export const Lessons: Story = {
  name: "Las lecciones de un capítulo",
  args: {
    items: LESSONS,
    noun: "lección",
    deleteFieldName: "lessonId",
    newPlaceholder: "Nombre de la nueva lección…",
  },
  render: (args) => (
    <StaffPanel title="Lecciones" meta="3 lecciones · 2 con PGN">
      <SyllabusList {...args} />
    </StaffPanel>
  ),
};

/** A row's three dots pressed: the menu with what destroys it, the focus on «Eliminar». */
export const RowMenu: Story = {
  ...Chapters,
  name: "El menú de una fila",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Más opciones de «La estructura de peones decide el plan»" }),
    );
    await expect(
      canvas.getByRole("menuitem", { name: "Eliminar «La estructura de peones decide el plan»" }),
    ).toHaveFocus();
  },
};

/** The three dots of a row that cannot be deleted: a note with the reason, and the focus stays on the button. */
export const DeleteRefused: Story = {
  ...Chapters,
  name: "Una fila que no se puede eliminar",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Más opciones de «Columnas abiertas y la séptima»" }));
    await expect(canvas.getByText("Hay alumnos con progreso en este capítulo o en sus lecciones.")).toBeInTheDocument();
  },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
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
actions: dragging a row by its grip, picking it up with space and moving it
with the arrows, or pressing «Subir» or «Bajar» in its menu reorders the list
on the spot, and nothing is saved.

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

/** The second chapter's menu, opened by the story: «Subir» and «Bajar» to reorder without dragging, and «Eliminar» set apart under a rule. */
export const StepMenuOpen: Story = {
  ...Chapters,
  name: "El menú de una fila, con «Subir» y «Bajar»",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = "El alfil malo y cómo cambiarlo";
    await userEvent.click(canvas.getByRole("button", { name: `Más opciones de «${name}»` }));

    const menu = await canvas.findByRole("menu", { name: `Opciones de «${name}»` });
    const items = within(menu).getAllByRole("menuitem");
    await expect(items.map((item) => item.textContent)).toEqual(["Subir", "Bajar", "Eliminar"]);
    await expect(items[0]).toHaveFocus();
  },
};

/** The menu of a chapter that cannot be deleted: it still moves, and under «Subir» and «Bajar» it says why it cannot be deleted. */
export const StepMenuWhereDeletingIsRefused: Story = {
  ...Chapters,
  name: "«Subir» y «Bajar» donde no se puede eliminar",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = "Columnas abiertas y la séptima";
    await userEvent.click(canvas.getByRole("button", { name: `Más opciones de «${name}»` }));

    const menu = await canvas.findByRole("menu", { name: `Opciones de «${name}»` });
    const items = within(menu).getAllByRole("menuitem");
    await expect(items.map((item) => item.textContent)).toEqual(["Subir", "Bajar"]);
    await expect(menu).toHaveAccessibleDescription("Hay alumnos con progreso en este capítulo o en sus lecciones.");
  },
};

/** «Subir» pressed in the second chapter's menu: the chapter is now the first, the focus came back to its three dots, and opened again its «Subir» is disabled. */
export const SteppedUpWithoutDragging: Story = {
  ...Chapters,
  name: "Una fila subida sin arrastrar",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = "El alfil malo y cómo cambiarlo";
    await userEvent.click(canvas.getByRole("button", { name: `Más opciones de «${name}»` }));
    await userEvent.click(await canvas.findByRole("menuitem", { name: `Subir «${name}»` }));

    // The row heads the numbered block, the focus travelled with it, and the
    // screen reader is told where it landed.
    const dots = canvas.getByRole("button", { name: `Más opciones de «${name}»` });
    await waitFor(() => expect(dots).toHaveFocus());
    await expect(canvasElement.querySelector(".syllabus-list__group > li")).toHaveTextContent(name);
    // By its text: dnd-kit's own live region is a `status` too.
    await expect(canvas.getByText(`«${name}» queda en la posición 1 de 5.`)).toHaveAttribute("role", "status");

    // Opened again, there is nowhere to go up to: the focus starts on «Bajar».
    await userEvent.click(dots);
    const up = await canvas.findByRole("menuitem", { name: `Subir «${name}»` });
    await expect(up).toHaveAttribute("aria-disabled", "true");
    await expect(canvas.getByRole("menuitem", { name: `Bajar «${name}»` })).toHaveFocus();
  },
};

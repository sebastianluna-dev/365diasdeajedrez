import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CONTENT_ROLE } from "@/constants/platform/course-codes.const";
import { StaffPanel } from "../../staff-panel.comp";
import type { SyllabusItem } from "../syllabus-list.comp";
import { SyllabusList } from "../syllabus-list.comp";
import { SyllabusListA } from "./syllabus-list-a.comp";
import { SyllabusListB } from "./syllabus-list-b.comp";
import { SyllabusListC } from "./syllabus-list-c.comp";

/** The chapters of an invented course: a closing, five chapters and no introduction yet. */
const CHAPTERS: SyllabusItem[] = [
  {
    id: "1",
    name: "La estructura de peones decide el plan",
    facts: "6 lecciones · 48 min",
    href: "#",
    canDelete: true,
  },
  {
    id: "2",
    name: "El alfil malo y cómo cambiarlo",
    facts: "4 lecciones · 31 min",
    href: "#",
    badge: "Prioridad",
    canDelete: true,
  },
  { id: "3", name: "Columnas abiertas y la séptima", facts: "7 lecciones · 55 min", href: "#", canDelete: false },
  { id: "4", name: "El rey en el centro", facts: "3 lecciones · 22 min", href: "#", canDelete: true },
  { id: "5", name: "Finales de torre que hay que saber", facts: "9 lecciones · 74 min", href: "#", canDelete: true },
  {
    id: "closing",
    name: "Cierre",
    facts: "1 lección · 6 min",
    href: "#",
    roleCode: CONTENT_ROLE.CLOSING,
    canDelete: false,
  },
];

const ARGS = {
  items: CHAPTERS,
  noun: "capítulo",
  onReorder: async () => undefined,
  createAction: async () => undefined,
  deleteAction: async () => undefined,
  deleteFieldName: "chapterId",
  newPlaceholder: "Nombre del nuevo capítulo…",
};

const meta = {
  title: "platform/sections/staff/courses/SyllabusList (diseños)",
  parameters: {
    docs: {
      description: {
        component: `
Three ways of drawing a course's chapters — and a chapter's lessons, which are
the same list one level apart — as **draggable cards** instead of the rail they
hang from today. The data is invented and the actions are stubs: dragging and
the arrows reorder the list on the spot, and nothing is saved.

Each story is a design; **Actual** is what the platform draws today, to compare
against. Source: \`components/platform/sections/staff/courses/syllabus-list/designs/\`.
`,
      },
    },
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
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** **A — La ficha con asa.** Cada paso es una tarjeta con borde, el asa de puntos en su canto y el número junto al nombre. */
export const DisenoA: Story = {
  name: "A · Ficha con asa",
  render: () => (
    <StaffPanel title="Temario" meta="5 capítulos · 30 lecciones">
      <SyllabusListA {...ARGS} />
    </StaffPanel>
  ),
};

/** **B — La ficha numerada.** La misma tarjeta sin el asa: el nodo negro numerado, el de hoy, es por donde se arrastra. */
export const DisenoB: Story = {
  name: "B · Ficha numerada",
  render: () => (
    <StaffPanel title="Temario" meta="5 capítulos · 30 lecciones">
      <SyllabusListB {...ARGS} />
    </StaffPanel>
  ),
};

/** **C — La ficha tranquila.** Sin línea hasta que se señala: filas más juntas, el asa aparece al pasar por encima. */
export const DisenoC: Story = {
  name: "C · Ficha tranquila",
  render: () => (
    <StaffPanel title="Temario" meta="5 capítulos · 30 lecciones">
      <SyllabusListC {...ARGS} />
    </StaffPanel>
  ),
};

/** Lo que la plataforma dibuja hoy: el raíl con los nodos numerados. */
export const Actual: Story = {
  name: "Hoy · El raíl",
  render: () => (
    <StaffPanel title="Temario" meta="5 capítulos · 30 lecciones">
      <SyllabusList {...ARGS} />
    </StaffPanel>
  ),
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CLASS_PHASE } from "@/constants/platform/class-codes.const";
import { cdmx } from "@/lib/testing/fixtures/classes";
import { studentDetail, studentJoin } from "@/lib/testing/fixtures/student-classes";
import type { ClassBlockView } from "@/services/classes/classes.types";
import { ClassAheadSection } from "./class-ahead.section";

const PREPARE: ClassBlockView[] = [
  {
    id: "b1",
    kind: "TEXT",
    visibility: "BEFORE",
    title: "Antes de la clase",
    text: "Repasa el capítulo 2 y trae tus dudas sobre la Najdorf.",
  },
  {
    id: "b2",
    kind: "VIDEO",
    visibility: "BEFORE",
    caption: "La idea de …e5 en la Najdorf (12 min)",
    videoUrl: "https://www.youtube.com/watch?v=example",
  },
];

const meta = {
  title: "platform/sections/classes/class-detail/ClassAheadSection",
  component: ClassAheadSection,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
The class page while it looks ahead (ALU-2): the access card, what the
staff said, «Tu clase» and what there is to prepare.

Source: \`components/platform/sections/classes/class-detail/class-ahead.section.tsx\`.
Reference page: [Components › ClassAheadSection](/components/platform/sections/classes/class-detail/class-ahead-section) in the docs site.
`,
      },
    },
  },
  args: { classDetail: studentDetail({ blocks: PREPARE }) },
  decorators: [
    (Story) => (
      <div className="platform-theme platform-page platform-page_width_wide">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClassAheadSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Days before: «Programada», when the link opens, and what to prepare. */
export const Upcoming: Story = {
  args: {
    classDetail: studentDetail({
      blocks: PREPARE,
      join: studentJoin({
        phase: CLASS_PHASE.UPCOMING,
        meetingUrl: null,
        startIso: cdmx("2026-10-16", "12:00").toISOString(),
        endIso: cdmx("2026-10-16", "13:00").toISOString(),
        visibleFromIso: cdmx("2026-10-16", "11:30").toISOString(),
        untilIso: cdmx("2026-10-16", "13:30").toISOString(),
      }),
    }),
  },
};

/** The link open: «Entrar a la clase», «Empieza en 20 min», the link to copy. */
export const Open: Story = {};

/** The class running: «En vivo». */
export const InProgress: Story = {
  name: "In progress",
  args: {
    classDetail: studentDetail({
      blocks: PREPARE,
      join: studentJoin({ phase: CLASS_PHASE.IN_PROGRESS, nowIso: cdmx("2026-10-14", "12:10").toISOString() }),
    }),
  },
};

/** The half hour after the end: «La clase terminó» is not yet said; «Volver a entrar». */
export const AfterEnd: Story = {
  name: "After the end",
  args: {
    classDetail: studentDetail({
      blocks: PREPARE,
      join: studentJoin({ phase: CLASS_PHASE.AWAITING_CLOSE, nowIso: cdmx("2026-10-14", "13:10").toISOString() }),
    }),
  },
};

/** Cancelled, the seat back in the payment. */
export const Cancelled: Story = {
  args: {
    classDetail: studentDetail({
      title: "Táctica de la semana",
      description: null,
      join: studentJoin({ phase: CLASS_PHASE.CANCELLED, meetingUrl: null }),
      cancelled: { note: "Te escribiremos para fijar otra fecha.", returnedToPayment: true },
      coverage: "De tu pago del 1 de octubre · Individual",
    }),
  },
};

/** Cancelled, a free class: nothing goes back anywhere. */
export const CancelledFree: Story = {
  name: "Cancelled, free",
  args: {
    classDetail: studentDetail({
      title: "Clase de diagnóstico",
      description: null,
      join: studentJoin({ phase: CLASS_PHASE.CANCELLED, meetingUrl: null }),
      cancelled: { note: null, returnedToPayment: false },
      coverage: "Esta clase es gratis.",
    }),
  },
};

/** Given a new date by the staff, with their note. */
export const Rescheduled: Story = {
  args: {
    classDetail: studentDetail({
      blocks: PREPARE,
      rescheduled: { previousLabel: "mar 13 oct", note: "Movida por un examen del alumno." },
    }),
  },
};

/** The make-up of a missed class, with the staff's note. */
export const MakeUp: Story = {
  name: "Make-up",
  args: {
    classDetail: studentDetail({
      title: "Clase con GM Profesor Demo",
      description: null,
      makeUp: { label: "Es la reposición de tu clase del vie 2 oct.", note: "Te la reponemos el viernes." },
      coverage: "Clase 3 de 4 de tu pago del 15 de septiembre · Individual",
    }),
  },
};

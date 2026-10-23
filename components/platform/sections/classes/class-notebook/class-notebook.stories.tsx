import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CLASS_PHASE } from "@/constants/platform/class-codes.const";
import { cdmx } from "@/lib/testing/fixtures/classes";
import { studentDetail, studentJoin } from "@/lib/testing/fixtures/student-classes";
import type { ClassBlockView } from "@/services/classes/classes.types";
import { ClassNotebookSection } from "./class-notebook.section";

const START = "8/8/8/8/8/8/8/8 w - - 0 1";

/** The class's exercises: one solved, two still to try. */
const EXERCISES: ClassBlockView = {
  id: "b9",
  kind: "EXERCISE",
  visibility: "BEFORE",
  title: "Ejercicios",
  exercises: [
    {
      id: "e1",
      n: 1,
      title: "Corta al rey",
      facts: "Ganan blancas · 1200",
      startFen: START,
      orientation: "white",
      mark: "solved",
      href: "/clases/c2/ejercicios/b9/1",
    },
    {
      id: "e2",
      n: 2,
      title: "Construye el puente",
      facts: "Ganan blancas · 1400",
      startFen: START,
      orientation: "white",
      mark: null,
      href: "/clases/c2/ejercicios/b9/2",
    },
    {
      id: "e3",
      n: 3,
      title: "Gana con las negras al lado",
      facts: "Ganan blancas · 1500",
      startFen: START,
      orientation: "white",
      mark: "failed",
      href: "/clases/c2/ejercicios/b9/3",
    },
  ],
};

const AHEAD = studentDetail({
  title: "Finales de torres",
  classmates: ["Ana", "Diego", "Mateo"],
  blocks: [EXERCISES],
});

const meta = {
  title: "platform/sections/classes/ClassNotebookSection",
  component: ClassNotebookSection,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
The student's class page as a notebook, in the new design system: the way
in as the extended FAB, the progress and the article's index in the side
column; the trail and the article in the panel, with the class's exercises
in their own column beside it.

Source: \`components/platform/sections/classes/class-notebook/class-notebook.section.tsx\`.
Reference page: [Components › ClassNotebookSection](/components/platform/sections/classes/class-notebook/class-notebook-section) in the docs site.
`,
      },
    },
  },
  args: { classDetail: AHEAD },
  decorators: [
    (Story) => (
      <div className="platform-theme platform-page platform-page_width_full platform-page_frame_bleed">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClassNotebookSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Before the class, its link open: «Entrar a la clase», the countdown, the index and the exercises beside the article. */
export const Ahead: Story = {};

/** Before the link opens: when it does, and nothing to copy. */
export const LinkClosed: Story = {
  name: "Link closed",
  args: {
    classDetail: studentDetail({
      ...AHEAD,
      join: studentJoin({
        phase: CLASS_PHASE.UPCOMING,
        meetingUrl: null,
        startIso: cdmx("2026-10-14", "18:00").toISOString(),
        endIso: cdmx("2026-10-14", "19:00").toISOString(),
        visibleFromIso: cdmx("2026-10-14", "17:30").toISOString(),
        untilIso: cdmx("2026-10-14", "19:30").toISOString(),
      }),
    }),
  },
};

/** After the class: «Ver la grabación», «Asististe» and the teacher's summary over the article. */
export const Review: Story = {
  args: {
    classDetail: studentDetail({
      ...AHEAD,
      view: "review",
      phase: CLASS_PHASE.DONE,
      join: studentJoin({ phase: CLASS_PHASE.DONE, meetingUrl: null }),
      attended: true,
      summary: "Vimos la posición de Lucena y cómo construir el puente con la torre en la cuarta fila.",
      recordingUrl: "https://zoom.us/rec/demo",
    }),
  },
};

/** A cancelled class: the notice and nothing to read. */
export const Cancelled: Story = {
  args: {
    classDetail: studentDetail({
      ...AHEAD,
      phase: CLASS_PHASE.CANCELLED,
      join: studentJoin({ phase: CLASS_PHASE.CANCELLED, meetingUrl: null }),
      cancelled: { note: "El profesor está enfermo.", returnedToPayment: true },
    }),
  },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { LessonPracticeList } from "./lesson-practice-list.comp";

const ITEMS = [
  {
    n: 1,
    href: "/cursos/10000001/2/20000008/practica/1",
    title: "El puente de Lucena",
    facts: "Secuencia · 1200 · Intermedio",
    startFen: "1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1",
    orientation: "white" as const,
    solved: true,
  },
  {
    n: 2,
    href: "/cursos/10000001/2/20000008/practica/2",
    title: "La defensa Philidor",
    facts: "Secuencia · 1100 · Principiante",
    startFen: "4k3/8/8/4PK2/8/8/r7/4R3 b - - 0 1",
    orientation: "black" as const,
    solved: false,
  },
  {
    n: 3,
    href: "/cursos/10000001/2/20000008/practica/3",
    title: "El pasillo abierto",
    facts: "Mate en 1 · 800 · Principiante",
    startFen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
    orientation: "white" as const,
    solved: false,
  },
];

const meta = {
  title: "platform/sections/courses/lesson-view/LessonPracticeList",
  component: LessonPracticeList,
  parameters: {
    docs: {
      description: {
        component: `
A practice-only lesson (D25): no game to read, so its exercises stand where
the board would be — the lesson's head, the way in as the one accent, and the
exercises in order with «Resuelto» on the ones solved (by solve key). Under
them the lesson's way through, «Saltar» and «Continuar», since the exercises
are optional (D26).

Source: \`components/platform/sections/courses/lesson-view/lesson-practice-list.comp.tsx\`.
Reference page: [Components › LessonPracticeList](/components/platform/sections/courses/lesson-view/lesson-practice-list) in the docs site.
`,
      },
    },
  },
  args: {
    title: "Finales de torre: práctica",
    badge: "Prioridad",
    description:
      "Tres posiciones para fijar lo que viste en el capítulo: el puente, la tercera fila y un mate de pasillo.",
    practice: {
      total: 3,
      solved: 1,
      items: ITEMS,
      start: { href: "/cursos/10000001/2/20000008/practica/2", label: "Continuar" },
    },
    onwards: {
      skipHref: "/cursos/10000001/2/20000009",
      skipLabel: "Saltar",
      skipTitle: "Pasar a la siguiente lección sin marcar esta",
      finishLabel: "Continuar",
      finish: fn(async () => undefined),
    },
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 960, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LessonPracticeList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One of three solved: the accent on «Continuar» to the next exercise, the lesson's way through under the list. */
export const Started: Story = {};

/** Every exercise solved: no way in left, and the lesson's «Continuar» takes the accent. */
export const AllSolved: Story = {
  args: {
    practice: { total: 3, solved: 3, items: ITEMS.map((item) => ({ ...item, solved: true })), start: null },
  },
};

/** The last lesson of the course: nothing to skip to, so only «Continuar». */
export const LastLesson: Story = {
  args: {
    badge: undefined,
    description: undefined,
    onwards: { skipLabel: "Saltar", finishLabel: "Continuar", finish: fn(async () => undefined) },
  },
};

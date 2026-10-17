import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LessonPracticeCard } from "./lesson-practice-card.comp";

const ITEMS = [1, 2, 3].map((n) => ({
  n,
  href: `/cursos/10000001/2/20000004/practica/${n}`,
  title: `Ejercicio ${n}`,
  facts: "Secuencia · 1400 · Intermedio",
  startFen: "4k3/8/8/4PK2/8/8/r7/4R3 b - - 0 1",
  orientation: "black" as const,
  solved: n === 1,
}));

const meta = {
  title: "platform/sections/courses/lesson-view/LessonPracticeCard",
  component: LessonPracticeCard,
  parameters: {
    docs: {
      description: {
        component: `
«Ahora practica» under a lesson's game (D25, D26): how many exercises the
lesson has, how many the student solved — by solve key — and the way in,
«Empezar» or «Continuar». Once every exercise is solved or was tried today,
only «Repasar» is left; completing the lesson is the board's button.

Source: \`components/platform/sections/courses/lesson-view/lesson-practice-card.comp.tsx\`.
Reference page: [Components › LessonPracticeCard](/components/platform/sections/courses/lesson-view/lesson-practice-card) in the docs site.
`,
      },
    },
  },
  args: {
    practice: {
      total: 3,
      solved: 1,
      items: ITEMS,
      start: { href: "/cursos/10000001/2/20000004/practica/2", label: "Continuar" },
    },
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 720, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LessonPracticeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One of three solved: «1 de 3 resueltos» and «Continuar» to the next one. */
export const Started: Story = {};

/** Nothing tried yet: «0 de 3 resueltos» and «Empezar». */
export const Untried: Story = {
  args: {
    practice: {
      total: 3,
      solved: 0,
      items: ITEMS.map((item) => ({ ...item, solved: false })),
      start: { href: "/cursos/10000001/2/20000004/practica/1", label: "Empezar" },
    },
  },
};

/** Every exercise solved: «Todos resueltos», and only «Repasar» left. */
export const AllSolved: Story = {
  args: {
    practice: { total: 3, solved: 3, items: ITEMS.map((item) => ({ ...item, solved: true })), start: null },
  },
};

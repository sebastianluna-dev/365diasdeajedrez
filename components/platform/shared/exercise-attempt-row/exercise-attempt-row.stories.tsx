import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { ExerciseAttemptRow } from "./exercise-attempt-row.comp";
import type { ExerciseAttemptRowData } from "./exercise-attempt-row.types";

/** The seed's failed attempt at the back-rank mate: 1. Td7? instead of 1. Td8#. */
const FAILED: ExerciseAttemptRowData = {
  id: "a-1",
  title: "Mate del pasillo",
  href: "/profesor/ejercicios/ex000001",
  atIso: "2026-10-15T20:12:00.000Z",
  atLabel: "15 de octubre de 2026",
  outcome: "failed",
  outcomeLabel: "Fallado",
  whereLabel: "Serie: Táctica de la semana",
  durationLabel: "42 s",
  mistake: {
    fen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
    orientation: "white",
    playedLabel: "Td7",
    expectedLabel: "Td8#",
    arrows: [
      { from: "d1", to: "d7", tone: "danger" },
      { from: "d1", to: "d8", tone: "success" },
    ],
  },
};

const meta = {
  title: "platform/shared/ExerciseAttemptRow",
  component: ExerciseAttemptRow,
  parameters: {
    docs: {
      description: {
        component: `
One attempt of a student at an exercise, as their teacher reads it (D24): the
exercise, where and when, how it went as a tag and, for one failed at a wrong
move, «Ver el error», a disclosure that opens the position with the move
played and the one expected drawn over it and said in words. A list item: the
section lists them, the latest first.

Source: \`components/platform/shared/exercise-attempt-row/exercise-attempt-row.comp.tsx\`.
Reference page: [Components › ExerciseAttemptRow](/components/platform/shared/exercise-attempt-row) in the docs site.
`,
      },
    },
  },
  args: { attempt: FAILED },
  decorators: [
    (Story) => (
      <ul className="platform-theme" style={{ maxWidth: 720, padding: 24, margin: 0, listStyle: "none" }}>
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof ExerciseAttemptRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A failed attempt in the teacher's series, its mistake folded: «Fallado» and «Ver el error». */
export const Failed: Story = {};

/** The same, opened by its \`play\`: the position with the move played in red and the one expected in green, and «Jugó Td7 en vez de Td8#». */
export const Expanded: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Ver el error" });
    await userEvent.click(button);
    await expect(canvas.getByRole("button", { name: "Ocultar el error" })).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByText("Td8#")).toBeVisible();
  },
};

/** A clean pass in free practice at a library exercise, which is not the teacher's to open: no link, no «Ver el error». */
export const Solved: Story = {
  args: {
    attempt: {
      ...FAILED,
      id: "a-2",
      title: "La dama que se entrega",
      href: null,
      outcome: "solved",
      outcomeLabel: "Resuelto",
      whereLabel: "Práctica libre",
      durationLabel: "1 min 5 s",
      mistake: null,
    },
  },
};

/** Solved after a hint: the tag in the warning amber. */
export const SolvedWithAHint: Story = {
  name: "Solved with a hint",
  args: {
    attempt: {
      ...FAILED,
      id: "a-3",
      outcome: "hinted",
      outcomeLabel: "Resuelto con pista",
      whereLabel: "Serie: Táctica de la semana",
      mistake: null,
    },
  },
};

/** «Ver la solución» was pressed: failed with no wrong move to show, in a series the teacher deleted since (D45). */
export const SolutionShown: Story = {
  name: "Solution shown",
  args: {
    attempt: {
      ...FAILED,
      id: "a-4",
      outcome: "solutionShown",
      outcomeLabel: "Vio la solución",
      whereLabel: "De una serie eliminada",
      durationLabel: null,
      mistake: null,
    },
  },
};

/** The material look, as the student's «Historial» draws it: a row of a list, not a card, opened on its mistake by its `play`. */
export const Material: Story = {
  args: { look: "material" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Ver el error" }));
    await expect(canvas.getByText("Td8#")).toBeVisible();
  },
};

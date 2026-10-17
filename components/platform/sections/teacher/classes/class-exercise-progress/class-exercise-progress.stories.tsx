import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import type { ExerciseAttemptRowData } from "@/components/platform/shared/exercise-attempt-row/exercise-attempt-row.types";
import { ClassExerciseProgress } from "./class-exercise-progress.comp";
import type { ClassExerciseProgressData } from "./class-exercise-progress.types";

const BACK_RANK = "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1";

/** A student's attempt from the block, as the popup lists it: the student is the row's title. */
function attempt(id: string, student: string, outcome: ExerciseAttemptRowData["outcome"]): ExerciseAttemptRowData {
  return {
    id,
    title: student,
    href: "/profesor/alumnos/u-1/ejercicios",
    atIso: "2026-10-13T20:12:00.000Z",
    atLabel: "13 de octubre de 2026",
    outcome,
    outcomeLabel: {
      solved: "Resuelto",
      hinted: "Resuelto con pista",
      failed: "Fallado",
      solutionShown: "Vio la solución",
    }[outcome],
    whereLabel: "Desde la clase",
    durationLabel: "42 s",
    mistake:
      outcome === "failed"
        ? {
            fen: BACK_RANK,
            orientation: "white",
            playedLabel: "Td7",
            expectedLabel: "Td8#",
            arrows: [
              { from: "d1", to: "d8", tone: "success" },
              { from: "d1", to: "d7", tone: "danger" },
            ],
          }
        : null,
  };
}

const PROGRESS: ClassExerciseProgressData = {
  blockId: "b5",
  seatCount: 3,
  exercises: [
    {
      exerciseId: "dmEjer01",
      n: 1,
      title: "El pasillo abierto",
      facts: "Mate en 1 · 900",
      solvedCount: 2,
      label: "2 de 3 lo resolvieron",
      attempts: [
        attempt("a-3", "Mateo Ríos", "solved"),
        attempt("a-2", "Alumno Demo", "solved"),
        attempt("a-1", "Alumno Demo", "failed"),
      ],
      untried: ["Diego Salas"],
    },
    {
      exerciseId: "dmEjer02",
      n: 2,
      title: "El mate de Philidor",
      facts: "Mate en 2 · 1400",
      solvedCount: 0,
      label: "0 de 3 lo resolvieron",
      attempts: [],
      untried: ["Alumno Demo", "Mateo Ríos", "Diego Salas"],
    },
  ],
};

const meta = {
  title: "platform/sections/teacher/classes/ClassExerciseProgress",
  component: ClassExerciseProgress,
  parameters: {
    docs: {
      description: {
        component: `
An exercise block as its teacher reads it (D29): one row per exercise and
«2 de 3 lo resolvieron», a button that opens the popup with each seated
student's attempts from this block and who has not tried it. Counted on
reading over the seats not moved.

Source: \`components/platform/sections/teacher/classes/class-exercise-progress/class-exercise-progress.comp.tsx\`.
Reference page: [Components › ClassExerciseProgress](/components/platform/sections/teacher/classes/class-exercise-progress) in the docs site.
`,
      },
    },
  },
  args: { progress: PROGRESS },
  argTypes: { progress: { control: "object" } },
  decorators: [
    (Story) => (
      <div className="platform-theme platform-card" style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClassExerciseProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two exercises of a block in a group class of three: one solved by two, one nobody tried. */
export const TwoExercises: Story = { name: "Two exercises" };

/** «2 de 3 lo resolvieron» opened: the three attempts, the latest first, and who has not tried it. */
export const Attempts: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "2 de 3 lo resolvieron" }));
  },
};

/** The exercise nobody tried: the popup says so and names every seated student. */
export const Untried: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "0 de 3 lo resolvieron" }));
  },
};

/** The second exercise was archived since the block was made: «Ya no está disponible» under its facts, the count kept. */
export const Unavailable: Story = {
  args: {
    progress: {
      ...PROGRESS,
      exercises: PROGRESS.exercises.map((item, index) => (index === 1 ? { ...item, unavailable: true } : item)),
    },
  },
};

/** A class with no seat yet: «Sin alumnos». */
export const NoSeats: Story = {
  name: "No seats",
  args: {
    progress: {
      blockId: "b5",
      seatCount: 0,
      exercises: PROGRESS.exercises.map((item) => ({
        ...item,
        solvedCount: 0,
        label: "Sin alumnos",
        attempts: [],
        untried: [],
      })),
    },
  },
};

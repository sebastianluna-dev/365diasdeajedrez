import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { readSolution } from "@/lib/chess/exercise-solver";
import { ExerciseSolver, ExerciseSolverView } from "./exercise-solver.comp";
import { reduceSession, startSession, type SolverAction } from "./exercise-solver-session";
import type { ExerciseSolverContext, ExerciseSolverExercise, ExerciseSolverMode } from "./exercise-solver.types";
import type { SolverSaveState } from "./use-exercise-solver.hook";

/** A sequence with two author hints and an explanation: the rook's skewer on the e-file. */
const SKEWER: ExerciseSolverExercise = {
  id: "dmEjer05",
  title: "La enfilada en la columna",
  prompt: "Juegan blancas y ganan la dama",
  kind: "SEQUENCE",
  mateIn: null,
  solutionPgn: `[SetUp "1"]\n[FEN "4q3/8/8/4k3/8/8/8/R6K w - - 0 1"]\n\n1. Re1+ Kd6 2. Rxe8 *`,
  hints: ["Busca un jaque que deje al rey y a la dama en la misma línea.", "La torre puede dar jaque en la columna e."],
  explanation:
    "Re1+ es una enfilada: el rey tiene que apartarse de la columna e y la torre gana la dama que estaba detrás.",
  difficulty: 1250,
};

/** Philidor's smothered mate, a «Mate en 2» with a comment on its key move. */
const SMOTHERED: ExerciseSolverExercise = {
  id: "dmEjer02",
  title: "El mate de Philidor",
  prompt: null,
  kind: "MATE_IN",
  mateIn: 2,
  solutionPgn: `[SetUp "1"]\n[FEN "r6k/6pp/7N/8/2Q5/8/6PP/6K1 w - - 0 1"]\n\n1. Qg8+ {La dama se entrega en g8.} Rxg8 2. Nf7# *`,
  hints: [],
  explanation:
    "La dama se entrega en g8 para que la torre tape la última casilla del rey: el caballo da mate ahogado en f7.",
  difficulty: 1400,
};

/** A back-rank mate in one for Black: the board is seen from Black's side. */
const BLACK_MATE: ExerciseSolverExercise = {
  id: "dmEjer03",
  title: "Mate de las negras",
  prompt: null,
  kind: "MATE_IN",
  mateIn: 1,
  solutionPgn: `[SetUp "1"]\n[FEN "3r2k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1"]\n\n1... Rd1# *`,
  hints: [],
  explanation: null,
  difficulty: 900,
};

const CONTEXT: ExerciseSolverContext = { attempt: { kind: "SERIES", seriesId: "dmSerie1" }, position: "3 / 5" };
const NEXT = { href: "/ejercicios/series/dmSerie1/4", label: "Siguiente ejercicio" };
const BACK = { href: "/ejercicios/series/dmSerie1", label: "Volver a la serie" };

const handlers = {
  onMove: fn().mockName("onMove"),
  onHint: fn().mockName("onHint"),
  onShowSolution: fn().mockName("onShowSolution"),
  onStep: fn().mockName("onStep"),
  onToggleAutoplay: fn().mockName("onToggleAutoplay"),
  onRetry: fn().mockName("onRetry"),
};

interface StateProps {
  exercise: ExerciseSolverExercise;
  actions?: SolverAction[];
  mode?: ExerciseSolverMode;
  elapsedMs?: number;
  save?: SolverSaveState;
  autoplay?: boolean;
  withLinks?: boolean;
  /** The last exercise of its series: nothing after it. */
  last?: boolean;
}

/**
 * The screen in a state the student reaches: the session after these actions,
 * run through the same reducer `useExerciseSolver` runs (chessground ignores
 * synthetic events, so no `play` function could make the moves).
 */
function SolverState({
  exercise,
  actions = [],
  mode = "solve",
  elapsedMs = 23_000,
  save = "idle",
  autoplay = false,
  withLinks = true,
  last = false,
}: StateProps) {
  const solution = readSolution(exercise);
  if (!solution) return null;
  const session = actions.reduce(reduceSession, startSession(solution, mode));
  return (
    <ExerciseSolverView
      exercise={exercise}
      context={mode === "preview" ? undefined : CONTEXT}
      next={withLinks && !last ? NEXT : undefined}
      back={withLinks ? BACK : undefined}
      session={session}
      elapsedMs={elapsedMs}
      save={save}
      autoplay={autoplay}
      {...handlers}
    />
  );
}

const PHONE_VIEWPORTS = {
  phone390: { name: "Phone, 390 × 844", styles: { width: "390px", height: "844px" }, type: "mobile" },
};

const meta = {
  title: "platform/shared/ExerciseSolver",
  component: ExerciseSolver,
  args: {
    exercise: SKEWER,
    mode: "solve",
    context: CONTEXT,
    next: NEXT,
    back: BACK,
    submit: fn(async () => ({ ok: true as const, scored: true, firstSolve: true, stored: true })).mockName("submit"),
  },
  parameters: {
    layout: "padded",
    viewport: { options: PHONE_VIEWPORTS },
    docs: {
      description: {
        component: `
The solve screen, the same wherever an exercise is solved: a series, and later a
lesson, a class block, practice, review and the editor's «Probar». The student
plays their moves and the platform answers with the opponent's after 450 ms;
the first wrong move shows in red for a moment, is taken back and fails the
attempt (D19), which is sent at once; «Pista» shows the author's texts, then
circles the piece to move (D37); «Ver la solución» walks through the answer and
counts as failed (D20). Once it is over, the result replaces the actions.

\`ExerciseSolver\` runs on \`useExerciseSolver\`; \`ExerciseSolverView\` draws a
session, which is how the stories below reach each state: chessground ignores
synthetic pointer events, so they are the session after the student's actions,
through the same reducer. Only the first story is the live component: try it by
hand.

Source: \`components/platform/shared/exercise-solver/exercise-solver.comp.tsx\`.
Reference page: [Components › ExerciseSolver](/components/platform/shared/exercise-solver) in the docs site.
`,
      },
    },
  },
} satisfies Meta<typeof ExerciseSolver>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The live screen on a sequence, waiting for the first move: «Pista» and «Ver la solución» under the clock. Its `play` takes the two author hints. */
export const Playing: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Pista" }));
    await expect(canvas.getByText(SKEWER.hints[0]!)).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Pista" }));
    await expect(canvas.getByText(SKEWER.hints[1]!)).toBeInTheDocument();
  },
};

/** The right move just played: «¡Bien!», and the board waits for the opponent's reply. */
export const CorrectReply: Story = {
  render: () => <SolverState exercise={SKEWER} actions={[{ type: "move", san: "Re1+" }]} />,
};

/** A move outside the solution, for the moment it is on the board: in red, the head marked «Fallado». */
export const WrongMove: Story = {
  render: () => <SolverState exercise={SKEWER} actions={[{ type: "move", san: "Ra5+" }]} save="saved" />,
};

/** The first of the author's hints, numbered under the board. */
export const TextHint: Story = {
  render: () => <SolverState exercise={SKEWER} actions={[{ type: "hint" }]} />,
};

/** No author hint: the piece to move is circled on the board. */
export const PieceHint: Story = {
  render: () => <SolverState exercise={SMOTHERED} actions={[{ type: "hint" }]} />,
};

/** Solved without a mistake or a hint: «¡Resuelto!», the explanation and the way on. */
export const SolvedClean: Story = {
  render: () => (
    <SolverState
      exercise={SKEWER}
      actions={[{ type: "move", san: "Re1+" }, { type: "replyShown" }, { type: "move", san: "Rxe8" }]}
      save="saved"
    />
  ),
};

/** Solved after a hint: passed, not perfect (D33). The last of a series, so the way back takes the accent. */
export const SolvedWithHint: Story = {
  render: () => (
    <SolverState
      exercise={SKEWER}
      actions={[{ type: "hint" }, { type: "move", san: "Re1+" }, { type: "replyShown" }, { type: "move", san: "Rxe8" }]}
      save="saved"
      last
    />
  ),
};

/** Failed at the first move and finished to learn: «Jugaste …; la jugada era …». */
export const Failed: Story = {
  render: () => (
    <SolverState
      exercise={SMOTHERED}
      actions={[
        { type: "move", san: "Nf7+" },
        { type: "flashOver" },
        { type: "move", san: "Qg8+" },
        { type: "replyShown" },
        { type: "move", san: "Nf7#" },
      ]}
      save="saved"
    />
  ),
};

/** «Ver la solución» at the first step, with its comment: ‹ › and the autoplay over the result. */
export const SolutionShown: Story = {
  render: () => (
    <SolverState
      exercise={SMOTHERED}
      actions={[{ type: "showSolution" }, { type: "step", to: 1 }]}
      save="saved"
      autoplay
    />
  ),
};

/** A «Mate en 2» with no prompt of its own: the head says «Juegan blancas y dan mate en 2». */
export const MateInTwo: Story = {
  render: () => <SolverState exercise={SMOTHERED} />,
};

/** Black to move: the board seen from Black's side, and the side disc in black. */
export const BlackToMove: Story = {
  render: () => <SolverState exercise={BLACK_MATE} />,
};

/** A retry the same study day: «Ya lo intentaste hoy: este intento no cuenta.», and the result says only how it went. */
export const UnscoredRetry: Story = {
  render: () => (
    <SolverState exercise={BLACK_MATE} mode="unscored" actions={[{ type: "move", san: "Rd1#" }]} elapsedMs={4_000} />
  ),
};

/** A class block's exercise already scored today (D49): the head says it counts for the class, not the streak, and a solve is still «¡Resuelto!» — the block's mark. */
export const BlockOnly: Story = {
  render: () => (
    <SolverState
      exercise={BLACK_MATE}
      mode="block"
      actions={[{ type: "move", san: "Rd1#" }]}
      elapsedMs={4_000}
      save="stored"
    />
  ),
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByText("¡Resuelto!")).toBeVisible());
    await expect(
      canvas.getByText("Ya lo intentaste hoy: este intento cuenta para la clase, no para tu racha."),
    ).toBeVisible();
  },
};

/** The editor's «Probar»: nothing is recorded, and there is no way on or back. */
export const Preview: Story = {
  render: () => <SolverState exercise={SKEWER} mode="preview" withLinks={false} />,
};

/** The submit did not get through: «No se guardó el intento.» under the result. */
export const NotSaved: Story = {
  render: () => <SolverState exercise={BLACK_MATE} actions={[{ type: "move", san: "Rd1#" }]} save="failed" />,
};

/** A scored page whose attempt the server did not count (a stale page, a second tab): the result says how it went this time, never «¡Resuelto!». */
export const SolvedNotCounted: Story = {
  render: () => <SolverState exercise={BLACK_MATE} actions={[{ type: "move", san: "Rd1#" }]} save="notScored" />,
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByText("Esta vez, sin errores")).toBeVisible());
    await expect(canvas.queryByText("¡Resuelto!")).toBeNull();
  },
};

/** A phone at 390 px: a «Mate en 2» failed at the first move, the head on two lines — the prompt, then the clock, «3 / 5» and «Fallado». */
export const PhoneFailedMateInTwo: Story = {
  render: () => (
    <SolverState exercise={SMOTHERED} actions={[{ type: "move", san: "Nf7+" }, { type: "flashOver" }]} save="saved" />
  ),
  globals: { viewport: { value: "phone390", isRotated: false } },
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByText("Fallado")).toBeVisible());
    await expect(canvas.getByText("Juegan blancas y dan mate en 2")).toBeVisible();
  },
};

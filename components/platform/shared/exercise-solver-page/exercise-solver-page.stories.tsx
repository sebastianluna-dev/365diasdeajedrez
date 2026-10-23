import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, waitFor } from "storybook/test";
import {
  clearSolveHistory,
  recordSolve,
} from "@/components/platform/shared/exercise-session-history/exercise-solve-history.store";
import {
  reduceSession,
  startSession,
  type SolverAction,
} from "@/components/platform/shared/exercise-solver/exercise-solver-session";
import type {
  ExerciseSolverExercise,
  ExerciseSolverMode,
} from "@/components/platform/shared/exercise-solver/exercise-solver.types";
import type { SolverSaveState } from "@/components/platform/shared/exercise-solver/use-exercise-solver.hook";
import { readSolution } from "@/lib/chess/exercise-solver";
import { ExerciseSolverPage } from "./exercise-solver-page.comp";

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

const SCOPE = "story:practice";
const NEXT = { href: "/ejercicios?tras=dmEjer05", label: "Siguiente ejercicio" };
const BACK = { href: "/ejercicios", label: "Volver a Ejercicios" };

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
  save?: SolverSaveState;
  autoplay?: boolean;
}

/**
 * The page in a state the student reaches: the session after these actions,
 * run through the same reducer `useExerciseSolver` runs (chessground ignores
 * synthetic events, so no `play` function could make the moves).
 */
function PageState({ exercise, actions = [], mode = "solve", save = "idle", autoplay = false }: StateProps) {
  const solution = readSolution(exercise);
  if (!solution) return null;
  const session = actions.reduce(reduceSession, startSession(solution, mode));
  return (
    <ExerciseSolverPage
      exercise={exercise}
      next={NEXT}
      back={BACK}
      aside={{ scope: SCOPE, href: null, topic: { code: "SKEWER", label: "Enfilada" } }}
      session={session}
      save={save}
      autoplay={autoplay}
      {...handlers}
    />
  );
}

/** «Esta sesión» before the story: three exercises finished, one of each colour. */
async function seedHistory() {
  clearSolveHistory();
  recordSolve(SCOPE, { exerciseId: "e1", title: "Ataque doble", href: "#e1", tone: "clean", delta: 12 });
  recordSolve(SCOPE, { exerciseId: "e2", title: "Clavada", href: "#e2", tone: "late", delta: -8 });
  recordSolve(SCOPE, { exerciseId: "e3", title: "Enfilada", href: "#e3", tone: "shown", delta: null });
  return {};
}

const PHONE_VIEWPORTS = {
  phone390: { name: "Phone, 390 × 844", styles: { width: "390px", height: "844px" }, type: "mobile" },
};

const meta = {
  title: "platform/shared/ExerciseSolverPage",
  component: ExerciseSolverPage,
  parameters: {
    layout: "fullscreen",
    viewport: { options: PHONE_VIEWPORTS },
    docs: {
      description: {
        component: `
The full solve page of «Ejercicios» in the new design system (the owner's
«M4»): what \`ExerciseSolver\` draws when it is given an \`aside\`. The
material board with Material's keys under it, and beside it the status card
(«Tu turno» with its chips, «Pista» and «Ver la solución»; the wrong move; the
result and the way on), «Jugadas», «Esta sesión» and the two switches of the
rating at the column's foot. The page's toolbar is the section's, around it.

The stories are the session after the student's actions, through the same
reducer the hook runs, as \`ExerciseSolver\`'s are.

Source: \`components/platform/shared/exercise-solver-page/exercise-solver-page.comp.tsx\`.
Reference page: [Components › ExerciseSolverPage](/components/platform/shared/exercise-solver-page) in the docs site.
`,
      },
    },
  },
  loaders: [seedHistory],
  decorators: [
    (Story) => (
      <div className="platform-workspace" style={{ minHeight: 0, paddingTop: 16 }}>
        <section className="platform-workspace__panel">
          <Story />
        </section>
      </div>
    ),
  ],
  args: {
    exercise: SKEWER,
    session: startSession(readSolution(SKEWER)!, "solve"),
    save: "idle",
    autoplay: false,
    ...handlers,
  },
} satisfies Meta<typeof ExerciseSolverPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Waiting for the first move: «Tu turno», the topic's and the kind's chips, «Pista» and «Ver la solución», and this visit's three pills. */
export const Playing: Story = {
  render: () => <PageState exercise={SKEWER} />,
};

/** A move outside the solution, for the moment it is on the board: the card in the error's tint, and the ring on the board. */
export const WrongMove: Story = {
  render: () => <PageState exercise={SKEWER} actions={[{ type: "move", san: "Ra5+" }]} save="saved" />,
};

/** The first of the author's hints, under the prompt; «Fallado» is not there: a hint is not a mistake. */
export const TextHint: Story = {
  render: () => <PageState exercise={SKEWER} actions={[{ type: "hint" }]} />,
};

/** Solved without a mistake or a hint: «¡Resuelto!» in the success tint, the explanation and the way on. */
export const SolvedClean: Story = {
  render: () => (
    <PageState
      exercise={SKEWER}
      actions={[{ type: "move", san: "Re1+" }, { type: "replyShown" }, { type: "move", san: "Rxe8" }]}
      save="saved"
    />
  ),
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByText("¡Resuelto!")).toBeVisible());
  },
};

/** Failed at the first move and finished to learn: the amber tint, «Jugaste …; la jugada era …», the try crossed in «Jugadas». */
export const Failed: Story = {
  render: () => (
    <PageState
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

/** «Ver la solución» at its first step, with its comment: the keys walk it, and «Pausar» stops the autoplay. */
export const SolutionShown: Story = {
  render: () => (
    <PageState
      exercise={SMOTHERED}
      actions={[{ type: "showSolution" }, { type: "step", to: 1 }]}
      save="saved"
      autoplay
    />
  ),
};

/** A retry the same study day: «Ya lo intentaste hoy: este intento no cuenta.» on the card. */
export const UnscoredRetry: Story = {
  render: () => <PageState exercise={SKEWER} mode="unscored" />,
};

/** The submit did not get through: «No se guardó el intento.» under the result, in the error's red. */
export const NotSaved: Story = {
  render: () => (
    <PageState
      exercise={SKEWER}
      actions={[{ type: "move", san: "Re1+" }, { type: "replyShown" }, { type: "move", san: "Rxe8" }]}
      save="failed"
    />
  ),
};

/** A phone at 390 px: the board on top, the keys sharing the width, the column under it. */
export const Phone: Story = {
  render: () => <PageState exercise={SMOTHERED} actions={[{ type: "hint" }]} />,
  globals: { viewport: { value: "phone390", isRotated: false } },
};

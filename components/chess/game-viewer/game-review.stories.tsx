import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { type ComponentProps, useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { parseEditableGame, serializeGame, setEvaluation } from "@/lib/chess/pgn-edit";
import { parsePgnTree, type MoveEvaluation } from "@/lib/chess/pgn-tree";
import { GameReview } from "./game-review.comp";
import { mainlinePaths } from "./mainline-positions";

/** Morphy against the Duke of Brunswick and Count Isouard, the «Opera Game», Paris 1858. */
const OPERA_GAME =
  "1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0";

/** A score in pawns, in White's sign, as `[%eval 1.25]` reads. */
const pawns = (score: number): MoveEvaluation => ({ score, mateIn: null });

/** A mate in `moves`, in White's sign, at the top of the scale as `[%eval #3]` reads. */
const mate = (moves: number): MoveEvaluation => ({ score: moves >= 0 ? 100 : -100, mateIn: moves });

/**
 * One per main-line position, the start first: what the bundled Stockfish
 * scores at the review's depth (16). The last position is the mate itself,
 * which keeps the reading before it, as the review hook does for a finished
 * position.
 */
const OPERA_EVALUATIONS: MoveEvaluation[] = [
  ...[
    0.35, 0.3, 0.3, 0.43, 0.49, 0.59, 0.88, 0.89, 1.45, 1.25, 1.24, 1.14, 2.23, 2.3, 2.02, 1.93, 1.78, 1.91, 2.61, 2.52,
    4.62, 4.84, 5.02, 5.17, 5.5, 5.59, 5.98, 6.03, 8.02, 3.08,
  ].map(pawns),
  mate(2),
  mate(1),
  mate(1),
  mate(1),
];

/**
 * The game with one `[%eval]` per main-line move, written the way the review
 * writes it when the engine finishes: `setEvaluation` on each path of the
 * main line, then `serializeGame`.
 */
function withEvaluations(pgn: string, evaluations: MoveEvaluation[]): string {
  const game = parseEditableGame(pgn);
  const tree = parsePgnTree(pgn);
  if (!game || !tree) return pgn;
  mainlinePaths(tree).forEach((path, index) => {
    const evaluation = evaluations[index];
    if (evaluation) setEvaluation(game, path, evaluation);
  });
  return serializeGame(game);
}

const EVALUATED = withEvaluations(OPERA_GAME, OPERA_EVALUATIONS);

const OPERA_TREE = parsePgnTree(OPERA_GAME);

/** The path of 9… b5, the move that opens Black's position: the board's move, for the chart's cursor. */
const AFTER_B5 = (OPERA_TREE ? mainlinePaths(OPERA_TREE) : []).at(18) ?? "";

/**
 * The review as the viewer mounts it: the game lives in the viewer's state,
 * so the evaluation the engine writes into it comes back as the new `pgn`.
 */
function LiveGameReview({ pgn: initialPgn, onPgnChange, ...props }: ComponentProps<typeof GameReview>) {
  const [pgn, setPgn] = useState(initialPgn);
  return (
    <GameReview
      {...props}
      pgn={pgn}
      onPgnChange={(next) => {
        setPgn(next);
        onPgnChange(next);
      }}
    />
  );
}

const meta = {
  title: "chess/game-viewer/GameReview",
  component: GameReview,
  parameters: {
    docs: {
      description: {
        component: `
The «Evaluación» tab under the viewer's board: the game seen as a whole. The
evaluation lives inside the PGN, one \`[%eval]\` per main-line move, so a game
that has them renders the advantage chart and each player's accuracy card at
once, and one without offers «Generar evaluación», which runs its own
Stockfish worker over every position and writes the result into the PGN
(\`onPgnChange\`). Here the evaluated game carries real readings of the
bundled engine, and the actions are spies.

Source: \`components/chess/game-viewer/game-review.comp.tsx\`.
Reference page: [Components › GameReview](/components/chess/game-viewer/game-review) in the docs site.
`,
      },
    },
  },
  args: {
    pgn: EVALUATED,
    canEdit: true,
    white: "Paul Morphy",
    black: "Duque de Brunswick y conde Isouard",
    currentPath: AFTER_B5,
    onSelectPath: fn(),
    onPgnChange: fn(),
  },
  argTypes: {
    pgn: {
      control: false,
      description: "The game; with an `[%eval]` on every main-line move it is already evaluated.",
    },
    canEdit: {
      control: "boolean",
      description: "Whether the evaluation is saved into the game; the strip says which.",
    },
    white: { control: "text" },
    black: { control: "text" },
    currentPath: { control: "text", description: "Dotted path of the board's move, for the chart's cursor." },
    onSelectPath: { description: "Takes the board to the move pointed at on the chart; a spy here." },
    onPgnChange: { description: "Receives the game with the evaluations written in; a spy here." },
  },
  decorators: [
    // The tools card under the board, as wide as the viewer's board at most.
    (Story) => (
      <div
        style={{
          maxWidth: 600,
          overflow: "hidden",
          borderRadius: 8,
          background: "var(--platform-surface)",
          boxShadow: "var(--platform-shadow-card)",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GameReview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Evaluated: the advantage chart with the cursor on 9… b5, and each side's accuracy and slips. */
export const Evaluated: Story = {};

/** Not evaluated yet: what the review does, how many moves it will go through and at what depth. */
export const NotEvaluated: Story = { args: { pgn: OPERA_GAME, currentPath: "" } };

/** A game with no moves yet: there is nothing to evaluate, so «Generar evaluación» is disabled. */
export const WithoutMoves: Story = { args: { pgn: "", currentPath: "" } };

/**
 * Analysing, by its `play` function: «Generar evaluación» runs the bundled engine for real, so the percentage depends
 * on the machine; when it finishes the evaluation is written into the game and the chart appears.
 */
export const Running: Story = {
  args: { pgn: OPERA_GAME, currentPath: "" },
  render: (args) => <LiveGameReview {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Generar evaluación" }));
    await expect(await canvas.findByText("Analizando")).toBeVisible();
  },
};

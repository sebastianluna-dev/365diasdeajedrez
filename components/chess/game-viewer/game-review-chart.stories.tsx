import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { reviewGame, type GameReview } from "@/lib/chess/game-review";
import { parsePgnTree, type MoveEvaluation } from "@/lib/chess/pgn-tree";
import { GameReviewChart } from "./game-review-chart.comp";
import { mainlinePositions } from "./mainline-positions";

/** A score in pawns, in White's sign, as `[%eval 1.25]` reads. */
const pawns = (score: number): MoveEvaluation => ({ score, mateIn: null });

/** A mate in `moves`, in White's sign, at the top of the scale as `[%eval #3]` reads. */
const mate = (moves: number): MoveEvaluation => ({ score: moves >= 0 ? 100 : -100, mateIn: moves });

/** Morphy against the Duke of Brunswick and Count Isouard, the «Opera Game», Paris 1858. */
const OPERA_GAME =
  "1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0";

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

/** Donald Byrne against Robert James Fischer, the «Game of the Century», New York 1956. */
const GAME_OF_THE_CENTURY =
  "1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5 6. Qb3 dxc4 7. Qxc4 c6 8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4 11. Bg5 Na4 12. Qa3 Nxc3 13. bxc3 Nxe4 14. Bxe7 Qb6 15. Bc4 Nxc3 16. Bc5 Rfe8+ 17. Kf1 Be6 18. Bxb6 Bxc4+ 19. Kg1 Ne2+ 20. Kf1 Nxd4+ 21. Kg1 Ne2+ 22. Kf1 Nc3+ 23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1 26. h3 Rxa2 27. Kh2 Nxf2 28. Re1 Rxe1 29. Qd8+ Bf8 30. Nxe1 Bd5 31. Nf3 Ne4 32. Qb8 b5 33. h4 h5 34. Ne5 Kg7 35. Kg1 Bc5+ 36. Kf1 Ng3+ 37. Ke1 Bb4+ 38. Kd1 Bb3+ 39. Kc1 Ne2+ 40. Kb1 Nc3+ 41. Kc1 Rc2# 0-1";

/** The same engine and depth; Black takes over at 11. Bg5 and mates at the end. */
const CENTURY_EVALUATIONS: MoveEvaluation[] = [
  ...[
    0.45, 0.28, 0.29, 0.27, 0.45, 0.4, 0.42, 0.41, 0.54, 0.13, 0.16, -0.31, 0.21, 0.05, 0.27, 0.39, 0.62, 0.65, 0.87,
    0.44, 0.27, -1.67, -1.78, -1.78, -1.88, -1.98, -1.9, -1.91, -1.68, -1.8, -1.74, -2.09, -1.82, -1.77, -1.8, -4.46,
    -4.9, -4.98, -5.12, -5.12, -5.04, -5.03, -5.18, -5.28, -5.23, -5.29, -5.36, -5.48, -4.62, -4.92, -5.34, -5.44,
    -6.36, -6.36, -6.31, -6.26, -6.15, -6.51, -6.67, -6.77, -6.72, -6.79, -7.01, -7.28, -6.49, -6.83, -7.03, -8.28,
    -8.61, -10.41, -9.53, -11,
  ].map(pawns),
  ...[-4, -4, -4, -4, -3, -3, -2, -2, -1, -1, -1].map(mate),
];

/**
 * The review of a game from its evaluations, as `GameReview` builds it from
 * the PGN: `reviewGame` over the main-line positions.
 */
function reviewOf(pgn: string, evaluations: MoveEvaluation[]): GameReview {
  const tree = parsePgnTree(pgn);
  const positions = tree
    ? mainlinePositions(tree).map((position, index) => ({ ...position, evaluation: evaluations[index] }))
    : [];
  const review = reviewGame(positions);
  if (!review || positions.length !== evaluations.length) {
    throw new Error("The sample game and its evaluations do not match.");
  }
  return review;
}

const meta = {
  title: "chess/game-viewer/GameReviewChart",
  component: GameReviewChart,
  parameters: {
    docs: {
      description: {
        component: `
The advantage over the course of a reviewed game, as an SVG: the height is
the win probability (the same curve accuracy is computed with), what sticks
out above the middle is White's and below it Black's, a cursor marks the
board's ply, and the opening, middlegame and endgame are named underneath.
Clicking or dragging on it asks for the nearest ply (\`onSelectPly\`, a spy
here). The evaluations are real readings of the bundled engine.

Source: \`components/chess/game-viewer/game-review-chart.comp.tsx\`.
Reference page: [Components › GameReviewChart](/components/chess/game-viewer/game-review-chart) in the docs site.
`,
      },
    },
  },
  args: {
    evaluations: OPERA_EVALUATIONS,
    review: reviewOf(OPERA_GAME, OPERA_EVALUATIONS),
    // After 9… b5, the move that opens Black's position.
    currentPly: 18,
    onSelectPly: fn(),
  },
  argTypes: {
    evaluations: { control: false, description: "`MoveEvaluation[]`, one per main-line position, the start first." },
    review: { control: false, description: "`GameReview`; the chart reads its phases." },
    currentPly: { control: { type: "number", min: 0 }, description: "The board's ply, for the cursor." },
    onSelectPly: { description: "Takes the board to the ply pointed at; a spy here." },
  },
  decorators: [
    // The chart's place in the review card under the board: white, with the
    // card's own padding around it.
    (Story) => (
      <div
        style={{
          maxWidth: 600,
          padding: "var(--platform-space-4) var(--platform-space-5) var(--platform-space-3)",
          borderRadius: 8,
          background: "var(--platform-surface)",
          boxShadow: "var(--platform-shadow-card)",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GameReviewChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A game White wins from the start: the curve never leaves White's half, with the cursor on 9… b5. */
export const WhiteWins: Story = {};

/** A game that changes hands: level for ten moves, Black's from 11. Bg5 on; the cursor is on 17… Ae6. */
export const BlackWins: Story = {
  args: {
    evaluations: CENTURY_EVALUATIONS,
    review: reviewOf(GAME_OF_THE_CENTURY, CENTURY_EVALUATIONS),
    currentPly: 34,
  },
};

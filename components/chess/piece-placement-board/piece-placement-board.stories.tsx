import { useState } from "react";
import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, waitFor } from "storybook/test";
import { EMPTY_BOARD_FEN, INITIAL_BOARD_FEN } from "chessops/fen";
import { PiecePlacementBoard, type PiecePlacementBoardProps } from "./piece-placement-board.comp";

/** A back-rank mate in one: Black's king walled in by its own pawns, White's rook one move from d8. */
const BACK_RANK = "6k1/5ppp/8/8/8/8/5PPP/3R2K1";

/** The same position with a white knight on e4, as the touch story's tap leaves it. */
const BACK_RANK_WITH_KNIGHT = "6k1/5ppp/8/8/4N3/8/5PPP/3R2K1";

/**
 * The parent owns the placement, as the exercise editor does: it keeps what
 * the board reports and gives it back.
 */
function OwnedBoard(props: PiecePlacementBoardProps) {
  const [placement, setPlacement] = useState(props.placement);
  return (
    <PiecePlacementBoard
      {...props}
      placement={placement}
      onPlacementChange={(next) => {
        setPlacement(next);
        props.onPlacementChange(next);
      }}
    />
  );
}

// The editor's board column on a wide screen (ExerciseAuthoring, phase 1).
const boardColumn: Decorator = (Story) => (
  <div style={{ maxWidth: 560 }}>
    <Story />
  </div>
);

const meta = {
  title: "chess/PiecePlacementBoard",
  component: PiecePlacementBoard,
  render: (args) => <OwnedBoard {...args} />,
  decorators: [boardColumn],
  args: { placement: EMPTY_BOARD_FEN, onPlacementChange: fn().mockName("onPlacementChange") },
  parameters: {
    docs: {
      description: {
        component: `
The board on which an author sets up an exercise's position: a chessground of
its own where every piece moves anywhere, and a palette of the twelve pieces,
«Mover» and «Quitar pieza» — beside the board on a wide screen, under it on a
phone. The parent owns the placement (the first field of a FEN) and gets every
change through \`onPlacementChange\`; whose turn it is, the castling rights and
whether the position is legal are the editor's, through \`validateSetup\`.

Chessground ignores synthetic pointer events, so no \`play\` function can drag
a piece: try it by hand. A tap with a piece chosen is the board's own, and the
touch story's \`play\` makes one.

Source: \`components/chess/piece-placement-board/piece-placement-board.comp.tsx\`.
Reference page: [Components › PiecePlacementBoard](/components/chess/piece-placement-board) in the docs site.
`,
      },
    },
  },
  argTypes: {
    placement: { control: "text", description: "The placement field of a FEN; the parent owns it." },
    orientation: { control: "inline-radio", options: ["white", "black"], description: "Which side is at the bottom." },
    disabled: { control: "boolean", description: "Nothing moves and no tool can be chosen." },
    defaultTool: { control: "text", description: "The tool chosen when it mounts: `move`, `remove` or `white-king`…" },
    onPlacementChange: { description: "Called with the new placement after every change on the board." },
  },
} satisfies Meta<typeof PiecePlacementBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An empty board, as «Vaciar el tablero» leaves it: «Mover» chosen, nothing to move yet. */
export const Empty: Story = {};

/** The initial position, as «Posición inicial» sets it. */
export const InitialPosition: Story = {
  args: { placement: INITIAL_BOARD_FEN },
};

/** A puzzle set up: a back-rank mate in one, the rook one move from d8. */
export const Puzzle: Story = {
  args: { placement: BACK_RANK },
};

/** The same puzzle seen from Black's side, as «Girar el tablero» shows it. */
export const Flipped: Story = {
  args: { placement: BACK_RANK, orientation: "black" },
};

/** On a phone, the palette in two rows under the board and the white knight chosen: its `play` taps e4 and a knight lands there. */
export const TouchWithAPieceChosen: Story = {
  args: { placement: BACK_RANK, defaultTool: "white-knight" },
  globals: { viewport: { value: "mobile1", isRotated: false } },
  play: async ({ args, canvasElement, canvas }) => {
    await expect(canvas.getByRole("radio", { name: "Caballo blanco" })).toHaveAttribute("data-state", "on");
    // Chessground arrives with the board: wait for its squares.
    const board = await waitFor(() => {
      const found = canvasElement.querySelector("cg-board");
      if (!found) throw new Error("the board has not loaded yet");
      return found;
    });
    const box = board.getBoundingClientRect();
    // e4 from White's side: the fifth file, the fifth rank from the top.
    await fireEvent.mouseDown(board, {
      button: 0,
      clientX: box.left + (4.5 / 8) * box.width,
      clientY: box.top + (4.5 / 8) * box.height,
    });
    await waitFor(() => expect(args.onPlacementChange).toHaveBeenCalledWith(BACK_RANK_WITH_KNIGHT));
  },
};

/** The palette from the keyboard: Tab lands on the chosen tool, «Mover», and the arrows walk the tools, the focused one ringed in blue; Space would choose it. */
export const KeyboardOnThePalette: Story = {
  args: { placement: BACK_RANK },
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("radio", { name: "Mover" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("radio", { name: "Rey negro" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    const queen = canvas.getByRole("radio", { name: "Dama negra" });
    await expect(queen).toHaveFocus();
    await expect(queen).toHaveAttribute("data-state", "off");
  },
};

/** Locked, as a teacher's exercise in review or in the library shows it: the pieces stay and no tool can be chosen. */
export const Locked: Story = {
  args: { placement: BACK_RANK, disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("radio", { name: "Mover" })).toBeDisabled();
  },
};

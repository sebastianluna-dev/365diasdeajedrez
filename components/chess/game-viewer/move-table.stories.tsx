import { type ComponentProps, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { type PgnTree, parsePgnTree } from "@/lib/chess/pgn-tree";
import { MoveTable } from "./move-table.comp";

const HEADERS = `[Event "Paris"]
[Site "Paris FRA"]
[Date "1858.??.??"]
[White "Morphy, Paul"]
[Black "Duke Karl / Count Isouard"]
[Result "1-0"]
`;

/** Morphy against the Duke of Brunswick and Count Isouard, Paris 1858: the "Opera game", in the public domain. */
const OPERA_GAME = `${HEADERS}
1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5
10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8
17. Rd8# 1-0`;

/** The same game annotated: comments, signs and three variations, one of them with a variation of its own. */
const ANNOTATED_GAME = `${HEADERS}
{ Morphy la jugó en un palco de la ópera de París, contra dos aficionados que consultaban cada jugada. }
1. e4 e5 2. Nf3 d6 { La defensa Philidor: sólida, pero pasiva. }
3. d4 Bg4 $6 { Clava el caballo, pero entrega la pareja de alfiles. }
( 3... exd4 4. Nxd4 ( 4. Qxd4 { es la otra forma de recuperar el peón. } ) 4... Nf6 { es lo habitual. } )
4. dxe5 Bxf3 ( 4... dxe5 5. Qxd8+ Kxd8 6. Nxe5 { y las blancas ganan un peón. } )
5. Qxf3 dxe5 6. Bc4 { Amenaza mate en f7. } Nf6
7. Qb3 $1 { [%cal Gb3f7,Gb3b7] Ataca f7 y b7 a la vez. } Qe7
8. Nc3 { Morphy prefiere desarrollar a ganar un peón. } ( 8. Qxb7 Qb4+ 9. Qxb4 Bxb4+ { y las damas desaparecen. } ) 8... c6
9. Bg5 b5 $2 $18 { Las negras pierden la paciencia. }
10. Nxb5 $1 cxb5 11. Bxb5+ Nbd7 12. O-O-O { [%csl Rd7] La torre llega a la columna abierta y d7 ya no aguanta. } Rd8
13. Rxd7 $1 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ $3 Nxb8 17. Rd8# { Mate con las dos últimas piezas que le quedaban. } 1-0`;

/**
 * The game once «Generar evaluación» has run over it: one `[%eval]` per position, the starting one included.
 * Made-up figures in the shape the engine writes, not a real analysis.
 */
const EVALUATED_GAME = `${HEADERS}
{ [%eval 0.18] }
1. e4 { [%eval 0.32] } e5 { [%eval 0.30] } 2. Nf3 { [%eval 0.25] } d6 { [%eval 0.62] }
3. d4 { [%eval 0.55] } Bg4 { [%eval 1.28] } 4. dxe5 { [%eval 1.20] } Bxf3 { [%eval 1.31] }
5. Qxf3 { [%eval 1.25] } dxe5 { [%eval 1.30] } 6. Bc4 { [%eval 1.22] } Nf6 { [%eval 2.10] }
7. Qb3 { [%eval 2.05] } Qe7 { [%eval 2.12] } 8. Nc3 { [%eval 1.15] } c6 { [%eval 1.20] }
9. Bg5 { [%eval 1.10] } b5 { [%eval 3.40] } 10. Nxb5 { [%eval 3.35] } cxb5 { [%eval 3.90] }
11. Bxb5+ { [%eval 3.80] } Nbd7 { [%eval 3.85] } 12. O-O-O { [%eval 3.70] } Rd8 { [%eval 5.20] }
13. Rxd7 { [%eval 5.10] } Rxd7 { [%eval 5.25] } 14. Rd1 { [%eval 5.00] } Qe6 { [%eval #3] }
15. Bxd7+ { [%eval #2] } Nxd7 { [%eval #2] } 16. Qb8+ { [%eval #1] } Nxb8 { [%eval #1] }
17. Rd8# { [%eval #1] } 1-0`;

/** The parsed tree the viewer hands the table; these sample games always parse. */
function treeOf(pgn: string): PgnTree {
  const tree = parsePgnTree(pgn);
  if (!tree) throw new Error("The sample PGN did not parse.");
  return tree;
}

/** The dotted path of the main line's move `ply` (1 is White's first): one `0` per move, the first child each time. */
const mainLinePath = (ply: number) => Array.from({ length: ply }, () => "0").join(".");

/** The viewer's part: it keeps the chosen move, so a click in the table moves the highlight. */
function SelectableMoveTable({ currentPath, onSelect, ...props }: ComponentProps<typeof MoveTable>) {
  const [path, setPath] = useState(currentPath);
  return (
    <MoveTable
      {...props}
      currentPath={path}
      onSelect={(next) => {
        setPath(next);
        onSelect(next);
      }}
    />
  );
}

const meta = {
  title: "chess/game-viewer/MoveTable",
  component: MoveTable,
  parameters: {
    docs: {
      description: {
        component: `
The notation as a table, the way a game is consulted move by move in Mis
estudios: one row per move number with White's and Black's moves, and the
comments and variations full width between the rows, each variation indented
by its depth. A move carries its signs and, once the game has been evaluated,
the evaluation stored in the PGN. The row order comes from
\`lib/chess/notation-blocks\`; this only draws it.

Here it sits in a frame like the viewer's notation card, drawn whole: in the
viewer the card is as tall as the board and the list scrolls inside it,
keeping the active move in view. Clicking a move highlights it, as the viewer
would.

Source: \`components/chess/game-viewer/move-table.comp.tsx\`.
Reference page: [Components › MoveTable](/components/chess/game-viewer/move-table) in the docs site.
`,
      },
    },
  },
  args: { tree: treeOf(ANNOTATED_GAME), currentPath: mainLinePath(13), onSelect: fn().mockName("onSelect") },
  argTypes: {
    tree: { control: false, description: "`PgnTree` from `parsePgnTree`." },
    currentPath: { control: "text", description: 'Dotted path of the active move; `""` is the starting position.' },
    onContextMenu: { control: false },
  },
  render: (args) => <SelectableMoveTable key={args.currentPath} {...args} />,
  decorators: [
    (Story) => (
      // The viewer's notation card: white on the page and rounded, without its height cap so the list is drawn whole.
      <div
        style={{
          maxWidth: 420,
          borderRadius: 8,
          background: "var(--platform-surface)",
          boxShadow: "var(--platform-shadow-card)",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MoveTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * An annotated game at 7. Db3!: the move in the accent, comments and variations full width between the rows, and
 * «…» where Black's move is pushed to a row of its own.
 */
export const Default: Story = {};

/** A move inside the nested variation, 4. Dxd4: it is highlighted where it stands, in its indented line. */
export const InVariation: Story = {
  name: "In a variation",
  args: { currentPath: "0.0.0.0.0.1.1" },
};

/** A bare game, only the main line: the plain table, here at the last move. */
export const MainLine: Story = {
  name: "Main line",
  args: { tree: treeOf(OPERA_GAME), currentPath: mainLinePath(33) },
};

/**
 * A game its owner pinned a comment to: it heads the notation, before the PGN's own opening comment and the first
 * move, with the line break it was typed with.
 */
export const PinnedComment: Story = {
  name: "Pinned comment",
  args: {
    currentPath: "",
    pinnedComment: "Juegan las negras en la jugada 9.\n¿Qué harías en su lugar?",
  },
};

/** An evaluated game: each move carries the evaluation the PGN stores beside it, mates as «+M3». */
export const Evaluated: Story = {
  args: { tree: treeOf(EVALUATED_GAME), currentPath: mainLinePath(18) },
};

/** The new design system's notation (`look="material"`), as a study's game draws it: the move on the board a pill of the primary. */
export const Material: Story = {
  args: { look: "material" },
};

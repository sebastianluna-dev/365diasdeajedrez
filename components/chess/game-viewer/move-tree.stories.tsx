import { type ComponentProps, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { type PgnTree, parsePgnTree } from "@/lib/chess/pgn-tree";
import { MoveTree } from "./move-tree.comp";

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

/** The same game as a lesson tells it: comments, signs and three variations, one of them with a variation of its own. */
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

/** The parsed tree the viewer hands the list; these sample games always parse. */
function treeOf(pgn: string): PgnTree {
  const tree = parsePgnTree(pgn);
  if (!tree) throw new Error("The sample PGN did not parse.");
  return tree;
}

/** The dotted path of the main line's move `ply` (1 is White's first): one `0` per move, the first child each time. */
const mainLinePath = (ply: number) => Array.from({ length: ply }, () => "0").join(".");

/** The viewer's part: it keeps the chosen move, so a click in the text moves the highlight. */
function SelectableMoveTree({ currentPath, onSelect, ...props }: ComponentProps<typeof MoveTree>) {
  const [path, setPath] = useState(currentPath);
  return (
    <MoveTree
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
  title: "chess/game-viewer/MoveTree",
  component: MoveTree,
  parameters: {
    docs: {
      description: {
        component: `
The notation as running text, the way a lesson is read: moves run on and a
comment breaks the line, the run resuming below with its number repeated. A
variation is a paragraph of its own, told apart by its grey; a variation of a
variation also carries parentheses. Nothing is indented. Where the line is cut
comes from \`lib/chess/notation-prose\`; this only draws it.

Here it sits in a frame like the lesson's notation card, drawn whole: in the
viewer the card is as tall as the board, the text scrolls inside it and the
active move is taken to the top. Clicking a move highlights it, as the viewer
would.

Source: \`components/chess/game-viewer/move-tree.comp.tsx\`.
Reference page: [Components › MoveTree](/components/chess/game-viewer/move-tree) in the docs site.
`,
      },
    },
  },
  args: { tree: treeOf(ANNOTATED_GAME), currentPath: mainLinePath(5), onSelect: fn().mockName("onSelect") },
  argTypes: {
    tree: { control: false, description: "`PgnTree` from `parsePgnTree`." },
    currentPath: { control: "text", description: 'Dotted path of the active move; `""` is the starting position.' },
    onContextMenu: { control: false },
  },
  render: (args) => <SelectableMoveTree key={args.currentPath} {...args} />,
  decorators: [
    (Story) => (
      // The lesson's notation card: white on the page, rounded, with the margin the prose takes; no height cap.
      <div
        style={{
          maxWidth: 420,
          padding: "var(--platform-space-8)",
          borderRadius: 8,
          background: "var(--platform-surface)",
          boxShadow: "var(--platform-shadow-card)",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MoveTree>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A lesson at 3. d4: the opening comment, runs of moves that each comment closes, the variations in grey below the
 * move they replace, and the nested one in parentheses.
 */
export const Default: Story = {};

/** A move inside the nested variation, 4. Dxd4: backed in the variation's own soft grey, inside its parentheses. */
export const InVariation: Story = {
  name: "In a variation",
  args: { currentPath: "0.0.0.0.0.1.1" },
};

/** A bare game, only the main line: one paragraph of moves, here at the last one. */
export const MainLine: Story = {
  name: "Main line",
  args: { tree: treeOf(OPERA_GAME), currentPath: mainLinePath(33) },
};

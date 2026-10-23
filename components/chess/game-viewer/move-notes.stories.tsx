import { type ComponentProps, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { type PgnTree, parsePgnTree } from "@/lib/chess/pgn-tree";
import { MoveNotes } from "./move-notes.comp";

const HEADERS = `[Event "Paris"]
[Site "Paris FRA"]
[Date "1858.??.??"]
[White "Morphy, Paul"]
[Black "Duke Karl / Count Isouard"]
[Result "1-0"]
`;

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

/** The viewer's part: it keeps the move on the board, so a click on a pill moves it. */
function SelectableMoveNotes({ currentPath, onSelect, ...props }: ComponentProps<typeof MoveNotes>) {
  const [path, setPath] = useState(currentPath);
  return (
    <MoveNotes
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
  title: "chess/game-viewer/MoveNotes",
  component: MoveNotes,
  parameters: {
    docs: {
      description: {
        component: `
A lesson read one move at a time, in the new design system: the main line
as pills that never change — the moves played, the one on the board in the
primary, the ones to come dimmed —, under it a note with what the author
says about that move and each line offered there, whole: its moves as pills
and its comments. A move of a variation on the board leaves the main line
lit on the move it branches from, and is lit itself in that move's note.
The viewer draws it with \`moveList="notes"\`.

Here it sits on the workspace's white panel, as in the lesson. Clicking a
pill, in the line or in a variation, moves the board, as the viewer would.

Source: \`components/chess/game-viewer/move-notes.comp.tsx\`.
Reference page: [Components › MoveNotes](/components/chess/game-viewer/move-notes) in the docs site.
`,
      },
    },
  },
  args: { tree: treeOf(ANNOTATED_GAME), currentPath: mainLinePath(6), onSelect: fn().mockName("onSelect") },
  argTypes: {
    tree: { control: false, description: "`PgnTree` from `parsePgnTree`." },
    currentPath: {
      control: "text",
      description: 'Dotted path of the move on the board; `""` is the starting position.',
    },
  },
  render: (args) => <SelectableMoveNotes key={args.currentPath} {...args} />,
  decorators: [
    (Story) => (
      // The workspace's white panel, at the lesson's column of notes.
      <div style={{ maxWidth: 420, padding: 24, background: "var(--platform-m3-panel)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MoveNotes>;

export default meta;
type Story = StoryObj<typeof meta>;

/** At 3... Ag4: the moves played, the one on the board, the rest dimmed, and its note. */
export const Default: Story = {};

/** Before the first move: the PGN's opening comment as the note, «Para empezar». */
export const AtTheStart: Story = {
  name: "At the start",
  args: { currentPath: "" },
};

/** At 3. d4, with 3... exd4 offered there: the note prints that line whole, its comments and its own variation in parentheses. */
export const WithAVariation: Story = {
  name: "With a variation",
  args: { currentPath: mainLinePath(5) },
};

/** Inside that variation, on 4. Dxd4: the main line stays, 3. d4 lit, and the move is lit in the note. */
export const InVariation: Story = {
  name: "In a variation",
  args: { currentPath: "0.0.0.0.0.1.1" },
};

/** At the last move: the mate's note, every pill of the line played. */
export const AtTheEnd: Story = {
  name: "At the end",
  args: { tree: treeOf(ANNOTATED_GAME), currentPath: mainLinePath(33) },
};

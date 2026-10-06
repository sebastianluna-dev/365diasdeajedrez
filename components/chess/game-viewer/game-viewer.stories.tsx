import { type ComponentProps, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";
import { GameViewer } from "./game-viewer.comp";

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

/**
 * The same game as a teacher would annotate it: a comment before the first move, comments on moves, signs
 * ($1 "!", $2 "?", $3 "!!", $6 "?!", and $18 "+−" for the position), three variations — one with a variation of
 * its own — and arrows and a marked square.
 */
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

/** The dotted path of the main line's move `ply` (1 is White's first): one `0` per move, the first child each time. */
const mainLinePath = (ply: number) => Array.from({ length: ply }, () => "0").join(".");

/** The strips around the board, as the PGN's headers give them: Morphy's federation, nothing else known. */
const PLAYERS: ComponentProps<typeof GameViewer>["players"] = {
  white: { name: "Morphy, Paul", country: "USA" },
  black: { name: "Duke Karl / Count Isouard" },
};

/** The lesson's way on, with `completeLesson` replaced by a spy listed in the Actions panel. */
const ONWARDS: ComponentProps<typeof GameViewer>["onwards"] = {
  skipHref: "/cursos/aperturas-abiertas/1/4",
  skipLabel: "Saltar",
  skipTitle: "Pasar a la siguiente lección sin marcar esta",
  finishLabel: "Continuar",
  finish: fn(async () => {}).mockName("completeLesson"),
};

/**
 * The screen's part in an editable viewer: it keeps the PGN the viewer reports and hands it back, as Mis estudios
 * does before saving it. Without it a move played on the board would vanish on the next render.
 */
function EditableGameViewer({ pgn, onPgnChange, ...props }: ComponentProps<typeof GameViewer>) {
  const [current, setCurrent] = useState(pgn);
  return (
    <GameViewer
      {...props}
      pgn={current}
      onPgnChange={(next) => {
        setCurrent(next);
        onPgnChange?.(next);
      }}
    />
  );
}

/** The editable viewer of a study's game: what `Study` shows and `MoveMenu` right-clicks in. */
const STUDY_ARGS: Partial<ComponentProps<typeof GameViewer>> = {
  pgn: ANNOTATED_GAME,
  initialPath: mainLinePath(13),
  players: PLAYERS,
  result: "1-0",
  controls: "panel",
  engine: true,
  editable: true,
  onPgnChange: fn().mockName("applyPgn"),
  tools: { saveLabel: "Guardado" },
};

const meta = {
  title: "chess/GameViewer",
  component: GameViewer,
  parameters: {
    docs: {
      description: {
        component: `
**The** platform's game viewer: lessons, the studies' games, class blocks, the
teacher's view of a student's game and the two position pickers all mount it.
A board, the notation beside it (a table, or running text in a lesson), the
arrows to go through the game, and whatever each screen switches on: the
players' strips, a title and a badge, the tools under the board, the engine
(offered in \`Study\` and left off: the engine has stories of its own), the
lesson's way on, in-place editing.

The viewer never saves: it reports the new PGN and the screen decides. Here
the screen is the story, which keeps the PGN so a move played on the board in
\`Study\` stays. Its older slots (\`footerActions\`, \`positionActions\`) are
left empty, as the "data, not components" rule wants them gone.

Source: \`components/chess/game-viewer/game-viewer.comp.tsx\`.
Reference page: [Components › GameViewer](/components/chess/game-viewer/game-viewer) in the docs site.
`,
      },
    },
  },
  args: { pgn: OPERA_GAME },
  argTypes: {
    pgn: { control: "text", description: "Full PGN: moves, variations, comments and annotations." },
    orientation: { control: "inline-radio", options: ["white", "black"] },
    initialPath: { control: "text", description: "Dotted path to open at; ignored if the tree has no such move." },
    moveList: { control: "inline-radio", options: ["table", "flow"] },
    result: { control: "text", description: "The PGN result token; each strip opens with its player's point." },
    controls: { control: "inline-radio", options: ["board", "panel"] },
    boardTools: { control: "boolean", description: "The flip and the options menu beside the arrows." },
    engine: { control: "boolean", description: "Offers the engine (switched off until someone switches it on)." },
    footerActions: { control: false },
    positionActions: { control: false },
  },
  decorators: [
    (Story) => (
      // The width of a platform page's content: the board reaches its 600px and the notation keeps the rest.
      <div style={{ maxWidth: 1040 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GameViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A game to go through: the players' strips, the table of moves, and the arrows, the flip and the options under the board. */
export const Game: Story = { args: { players: PLAYERS, result: "1-0" } };

/**
 * An annotated game opened at 7. Db3!: its arrows on the board, and in the table the comments, the signs and the
 * variations — the nested one indented one step further.
 */
export const Annotated: Story = { args: { pgn: ANNOTATED_GAME, initialPath: mainLinePath(13), players: PLAYERS } };

/**
 * A lesson: the moves as running text, the lesson's name and «Prioridad» on the notation, and under the board only
 * the arrows and «Saltar», which leaves for the next lesson without marking this one.
 */
export const Lesson: Story = {
  args: {
    pgn: ANNOTATED_GAME,
    moveList: "flow",
    title: "La partida de la ópera",
    badge: "Prioridad",
    boardTools: false,
    onwards: ONWARDS,
  },
};

/** The same lesson at its last move: «Saltar» has become «Continuar», which marks the lesson read and opens the next. */
export const LessonAtTheEnd: Story = {
  name: "Lesson at the end",
  args: { ...Lesson.args, initialPath: mainLinePath(33) },
};

/**
 * A study's game, editable: the arrows beside the notation, the engine on offer and switched off, and the tools
 * under the board on the move's comment. A move played on the board is added to the game.
 */
export const Study: Story = {
  args: STUDY_ARGS,
  render: (args) => <EditableGameViewer key={args.pgn} {...args} />,
};

/** The move menu, opened by its `play` function with a right click on 8. Dxb7, a variation that can be promoted. */
export const MoveMenu: Story = {
  name: "Move menu",
  args: STUDY_ARGS,
  render: (args) => <EditableGameViewer key={args.pgn} {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const move = canvas.getByRole("button", { name: "8.Dxb7" });
    move.scrollIntoView({ block: "center" });
    const { right, bottom } = move.getBoundingClientRect();
    fireEvent.contextMenu(move, { clientX: right, clientY: bottom });
    // The menu fades in (160 ms): it is visible once its entrance has played.
    const menu = await canvas.findByRole("menu", { name: "Opciones de 8. Dxb7" });
    await waitFor(() => expect(menu).toBeVisible());
  },
};

/** The options menu under the board, opened by its `play` function: the sound and full screen. */
export const OptionsMenu: Story = {
  name: "Options menu",
  args: { players: PLAYERS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTitle("Opciones del visor"));
    const menu = await canvas.findByRole("menu");
    await waitFor(() => expect(menu).toBeVisible());
  },
};

/**
 * A game read with its next moves hidden, opened at 3... Ag4: the notation stops at the move on the board, says there
 * is more under it, and «Jugada siguiente» brings out the next one.
 */
export const HiddenMoves: Story = {
  name: "Con las jugadas siguientes ocultas",
  args: { players: PLAYERS, result: "1-0", controls: "panel", initialPath: mainLinePath(6), hideNextMoves: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Las jugadas siguientes están ocultas: avanza para descubrirlas.")).toBeVisible();
    await expect(canvasElement.querySelectorAll(".move-table__move")).toHaveLength(6);

    await userEvent.click(canvas.getByTitle("Jugada siguiente"));
    await waitFor(() => expect(canvasElement.querySelectorAll(".move-table__move")).toHaveLength(7));
  },
};

/** The owner's comment pinned at the head of the notation, before the first move, and the board opened from Black's side. */
export const PinnedComment: Story = {
  name: "Con comentario fijo, desde las negras",
  args: {
    players: PLAYERS,
    result: "1-0",
    controls: "panel",
    orientation: "black",
    pinnedComment: "La partida de la ópera. Fíjate en cómo cada jugada de Morphy desarrolla una pieza.",
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".move-table > :first-child")).toHaveTextContent(
      "La partida de la ópera. Fíjate en cómo cada jugada de Morphy desarrolla una pieza.",
    );
  },
};

/** A PGN with nothing in it the parser can read: the viewer says so in place of the board. */
export const Unreadable: Story = { args: { pgn: "" } };

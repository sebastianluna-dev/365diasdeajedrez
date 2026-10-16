import { type ComponentProps, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { GameTools } from "./game-tools.comp";

const HEADERS = `[Event "Paris"]
[Site "Paris FRA"]
[Date "1858.??.??"]
[White "Morphy, Paul"]
[Black "Duke Karl / Count Isouard"]
[Result "1-0"]
`;

/**
 * Morphy against the Duke of Brunswick and Count Isouard, Paris 1858 (the "Opera game", in the public domain), as a
 * teacher would annotate it: comments, signs and variations.
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

/**
 * The bare game once «Generar evaluación» has run over it: one `[%eval]` per position, the starting one included.
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

/** The dotted path of the main line's move `ply` (1 is White's first): one `0` per move, the first child each time. */
const mainLinePath = (ply: number) => Array.from({ length: ply }, () => "0").join(".");

/**
 * The viewer's part: it holds the tab (`useToolsTab` does in the viewer) and the PGN the panel reports, so the tabs
 * switch and a comment or a sign written here stays.
 */
function ViewerHeldGameTools({ pgn, tab, onTabChange, onPgnChange, ...props }: ComponentProps<typeof GameTools>) {
  const [currentTab, setCurrentTab] = useState(tab);
  const [currentPgn, setCurrentPgn] = useState(pgn);
  return (
    <GameTools
      {...props}
      pgn={currentPgn}
      tab={currentTab}
      onTabChange={(next) => {
        setCurrentTab(next);
        onTabChange(next);
      }}
      onPgnChange={(next) => {
        setCurrentPgn(next);
        onPgnChange(next);
      }}
    />
  );
}

const meta = {
  title: "chess/game-viewer/GameTools",
  component: GameTools,
  parameters: {
    docs: {
      description: {
        component: `
The panel under the board of an annotated game (Mis estudios, a chapter's
game): the current move's comment, its signs in three exclusive groups, the
evaluation of the whole game, and the ways to take it elsewhere (FEN, PGN,
bare main line, PNG, GIF). A read-only game keeps only the last two tabs.
Comment and signs are read from the PGN, never kept apart.

The viewer owns the tab — the move menu changes it too — and saving; here the
story holds both, so the tabs switch and an edit stays. The evaluation tab is
shown on a game already evaluated: nothing here starts the engine.

Source: \`components/chess/game-viewer/game-tools.comp.tsx\`.
Reference page: [Components › GameTools](/components/chess/game-viewer/game-tools) in the docs site.
`,
      },
    },
  },
  args: {
    pgn: ANNOTATED_GAME,
    currentPath: mainLinePath(13),
    canEdit: true,
    saveLabel: "Guardado",
    tab: "comment",
    focusRequest: 0,
    white: "Morphy, Paul",
    black: "Duke Karl / Count Isouard",
    onTabChange: fn().mockName("setTab"),
    onSelectPath: fn().mockName("setCurrentPath"),
    onPgnChange: fn().mockName("onPgnChange"),
  },
  argTypes: {
    pgn: { control: "text", description: "The PGN the viewer shows." },
    currentPath: { control: "text", description: 'Dotted path of the viewer\'s move; `""` is the starting position.' },
    canEdit: { control: "boolean", description: "Without it only «Evaluación» and «Compartir» remain." },
    saveLabel: { control: "text", description: "How the screen's autosave is going." },
    tab: { control: "inline-radio", options: ["comment", "quality", "review", "share"] },
    focusRequest: { control: false },
  },
  render: (args) => <ViewerHeldGameTools key={`${args.tab}:${String(args.canEdit)}`} {...args} />,
  decorators: [
    (Story) => (
      // The card under the board: the board column's width, white on the page and rounded.
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
} satisfies Meta<typeof GameTools>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * «Comentario» on 7. Db3!: the move's comment in the field, the tabs with their labels alone, and the move and the
 * autosave on the right.
 */
export const Comment: Story = {};

/** «Calidad» on 9… b5: the signs in their three groups, «?» pressed among the move's and «+−» among the position's. */
export const Quality: Story = { args: { tab: "quality", currentPath: mainLinePath(18) } };

/** «Evaluación» on a game already evaluated: the advantage chart with its cursor on 9… b5, and each side's accuracy. */
export const Review: Story = { args: { tab: "review", pgn: EVALUATED_GAME, currentPath: mainLinePath(18) } };

/** «Compartir»: the position's FEN, the whole PGN and the bare main line to copy, and the PNG and GIF exports. */
export const Share: Story = { args: { tab: "share" } };

/**
 * «Compartir» in a teacher's own study: between the copies and the exports, «Ejercicio desde esta jugada» with
 * «Crear ejercicio», a link to the editor seeded from the current move (D11) — the way in on a phone, where the move
 * menu's right click does not exist.
 */
export const ShareInATeachersStudy: Story = {
  name: "Share in a teacher's study",
  args: { tab: "share", exerciseFromHereHref: "/profesor/ejercicios/nuevo?estudio=s1&partida=g1&jugada=0.0.0.0.0.0" },
};

/** A read-only game, such as a course database's: only «Evaluación» and «Compartir», and no autosave. */
export const ReadOnly: Story = {
  name: "Read only",
  args: { canEdit: false, tab: "share", saveLabel: undefined },
};

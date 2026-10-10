import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import { fn } from "storybook/test";
import { FIXTURE_BOT, FIXTURE_STUDENT } from "@/lib/testing/fixtures/bots";
import { PaperFrame } from "./paper-frame.comp";

const GAME = `[Event "Biblioteca Central"]
[White "Alumno Demo"]
[Black "Anselmo Quiroga"]

1. c4 e5 2. Nc3 Nf6 3. g3 d5 4. cxd5 Nxd5 5. Bg2 Nb6 6. Nf3 Nc6 7. O-O *`;

const meta = {
  title: "adventure/paper-frame/PaperFrame",
  component: PaperFrame,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
A game of an adventure on a page of the notebook: the platform's own game
screen laid on a ruled sheet with the binding's holes and a margin line, headed
by the place where it is played, the page of the story and the attempt, and with
«Mapa», the way back. It takes \`children\` (the one exception to «a component
receives data»): the game keeps its own state and is the same piece in a free
game. These stories put a board in it.

Source: \`components/adventure/paper-frame/paper-frame/paper-frame.comp.tsx\`.
Reference page: [Components › PaperFrame](/components/adventure/paper-frame/paper-frame) in the docs site.
`,
      },
    },
  },
  args: {
    zone: "Biblioteca Central",
    place: "Sala de lectura",
    page: 3,
    attempt: 2,
    mapHref: "/jugar/aventura/cuaderno-del-viajero",
    children: (
      <GameViewer
        pgn={GAME}
        initialPath="0.0.0.0.0.0.0.0.0.0.0.0.0"
        orientation="black"
        controls="panel"
        interaction="read"
        players={{
          white: { name: "Anselmo Quiroga", elo: 783, avatar: FIXTURE_BOT.avatar },
          black: { name: FIXTURE_STUDENT.name, avatar: FIXTURE_STUDENT.avatar },
        }}
      />
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 16, maxWidth: 1180, margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PaperFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The third page, second attempt: the head with the way back, the place and the pencilled note, and the board under it. */
export const Default: Story = {};

/** Whoever only reads the game (a teacher, the staff) cannot know which attempt it is: the note says only the page. */
export const ReadOnly: Story = { args: { attempt: null } };

/** On a phone the head folds: the place goes under «Mapa» in two lines and the note moves to the corner. */
export const Phone: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};

const OPERA_GAME = `[White "Morphy, Paul"]
[Black "Duke Karl / Count Isouard"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5
10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8
17. Rd8# 1-0`;

/** The game won, on the same page: the result in the strips and, under the board, «Volver al mapa» as the main action. */
export const Won: Story = {
  args: {
    children: (
      <GameViewer
        pgn={OPERA_GAME}
        initialPath={Array.from({ length: 33 }, () => "0").join(".")}
        orientation="white"
        controls="panel"
        interaction="read"
        tools={{}}
        players={{
          white: {
            name: FIXTURE_STUDENT.name,
            avatar: FIXTURE_STUDENT.avatar,
            ending: { kind: "win", label: "Ganaste", reason: "por jaque mate" },
          },
          black: {
            name: "Anselmo Quiroga",
            elo: 783,
            avatar: FIXTURE_BOT.avatar,
            ending: { kind: "loss", label: "Perdió", reason: "por jaque mate" },
          },
        }}
        play={{
          color: "white",
          status: "over",
          over: {
            scoreboard: { you: FIXTURE_STUDENT, rival: FIXTURE_BOT, wins: 1, losses: 1, draws: 0 },
            rematch: null,
            otherOpponentHref: "/jugar/partida-libre",
            map: { href: "/jugar/aventura/cuaderno-del-viajero?victoria=3" },
            analysisBoardHref: null,
            onSave: fn().mockName("openSavePopup"),
          },
        }}
      />
    ),
  },
};

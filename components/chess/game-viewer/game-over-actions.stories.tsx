import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { FIXTURE_BOT, FIXTURE_STUDENT } from "@/lib/testing/fixtures/bots";
import { GameOverActions } from "./game-over-actions.comp";

const meta = {
  title: "chess/game-viewer/GameOverActions",
  component: GameOverActions,
  parameters: {
    docs: {
      description: {
        component: `
What can be done once a game against a bot is over, drawn by the GameViewer
UNDER the board (G6): «Revancha» as the one main action, «Otro rival»,
«Analizar» (the viewer's review), «Tablero de análisis» while that board is
switched on, «Guardar en un estudio», and the scoreboard against that rival.
Nothing covers the board: the result is already in the strips.

Source: \`components/chess/game-viewer/game-over-actions.comp.tsx\`.
Reference page: [Components › GameOverActions](/components/chess/game-viewer/game-over-actions) in the docs site.
`,
      },
    },
  },
  args: {
    scoreboard: { you: FIXTURE_STUDENT, rival: FIXTURE_BOT, wins: 3, losses: 1, draws: 0 },
    rematch: fn(async () => {}).mockName("rematchPlayedGame"),
    otherOpponentHref: "/jugar",
    analysisBoardHref: "/herramientas/tablero-de-analisis?partida=AbC12345",
    onSave: fn().mockName("openSavePopup"),
    onAnalyse: fn().mockName("revealReview"),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GameOverActions>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every way on, and the scoreboard against Don Chuy counting the game just won. */
export const Default: Story = {};

/** While the analysis board is switched off, its button is not drawn. */
export const WithoutAnalysisBoard: Story = { args: { analysisBoardHref: null } };

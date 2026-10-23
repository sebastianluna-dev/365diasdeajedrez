import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { platformRoutes } from "@/lib/platform-routes";
import type { ExplorerGame } from "@/services/game-explorer/game-explorer.types";
import { GAME_ORIGIN, GAME_ORIGIN_LABEL } from "@/services/shared/game-origin";
import { ExplorerGames } from "./explorer-games.comp";

/** Morphy's «Opera Game», Paris 1858, as a course's model game the student also saw in class. */
const OPERA_GAME: ExplorerGame = {
  id: "opera",
  white: "Morphy, Paul",
  black: "Duque de Brunswick y conde Isouard",
  resultLabel: "1-0",
  event: "Ópera de París 1858",
  origin: GAME_ORIGIN.COURSE,
  originLabel: GAME_ORIGIN_LABEL[GAME_ORIGIN.COURSE],
  seenInClass: true,
  href: platformRoutes.gameDetail("clasicos", "opera"),
};

/**
 * The games that reached 1.e4 e5 2.Nf3, newest first: an invented student's own
 * game, then public historic ones. One sits in a teacher's study the viewer
 * cannot open, so it is listed without a link.
 */
const AFTER_KNIGHT_F3: ExplorerGame[] = [
  {
    id: "rios-vidal",
    white: "Ríos, Fernanda",
    black: "Vidal, Mateo",
    whiteElo: 1520,
    resultLabel: "1/2-1/2",
    playedAtLabel: "14 de septiembre, 2026",
    origin: GAME_ORIGIN.STUDENT_STUDY,
    originLabel: GAME_ORIGIN_LABEL[GAME_ORIGIN.STUDENT_STUDY],
    seenInClass: false,
    href: platformRoutes.gameDetail("mis-partidas", "rios-vidal"),
  },
  {
    id: "kasparov-anand",
    white: "Kasparov, Garry",
    black: "Anand, Viswanathan",
    whiteElo: 2795,
    blackElo: 2725,
    resultLabel: "1-0",
    event: "Campeonato del mundo PCA 1995",
    origin: GAME_ORIGIN.EDITOR,
    originLabel: GAME_ORIGIN_LABEL[GAME_ORIGIN.EDITOR],
    seenInClass: true,
    href: platformRoutes.classDetail("apertura-espanola"),
  },
  {
    id: "steinitz-bardeleben",
    white: "Steinitz, Wilhelm",
    black: "von Bardeleben, Curt",
    resultLabel: "1-0",
    event: "Hastings 1895",
    origin: GAME_ORIGIN.COURSE,
    originLabel: GAME_ORIGIN_LABEL[GAME_ORIGIN.COURSE],
    seenInClass: false,
    href: platformRoutes.gameDetail("clasicos", "steinitz-bardeleben"),
  },
  OPERA_GAME,
  {
    id: "anderssen-dufresne",
    white: "Anderssen, Adolf",
    black: "Dufresne, Jean",
    resultLabel: "1-0",
    event: "Partida amistosa, Berlín 1852",
    origin: GAME_ORIGIN.EDITOR,
    originLabel: GAME_ORIGIN_LABEL[GAME_ORIGIN.EDITOR],
    seenInClass: false,
  },
];

const meta = {
  title: "platform/sections/explorer/ExplorerGames",
  component: ExplorerGames,
  parameters: {
    docs: {
      description: {
        component: `
The «Partidas» card of the explorer (the new design system): the games that
went through the position on the board, most recent first, a row each as Gmail
lists mail — the players and their Elos, the event and the date, the origin's
tag in its colour, «Vista en clase» in violet, and the result in a pill. The
list is capped and the total is not: the heading says of how many these are
the most recent. A game the viewer has no screen for is listed without a link,
in the lighter ink. Here the games are an invented student's and public
historic ones.

Source: \`components/platform/sections/explorer/explorer-games.comp.tsx\`.
Reference page: [Components › ExplorerGames](/components/platform/sections/explorer/explorer-games) in the docs site.
`,
      },
    },
    nextjs: { navigation: { pathname: "/explorador" } },
  },
  args: { games: AFTER_KNIGHT_F3, totalGames: 213, isSearching: false },
  argTypes: {
    games: { control: "object", description: "`ExplorerGame[]`: the capped sample, newest first." },
    totalGames: { control: "number", description: "Every game found, beyond the capped list." },
    isSearching: { control: "boolean", description: "With no game, «Buscando…» instead of the empty line." },
  },
  decorators: [
    // The explorer's results: the panel's column beside the board.
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ExplorerGames>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Five of the 213 games after 1.e4 e5 2.Nf3: the three origins' tags, «Vista en clase», a row without a link and «Las 5 más recientes de 213». */
export const Games: Story = {};

/** A position only the «Opera Game» reached: one row, and nothing beside the heading since nothing is left out. */
export const OneGame: Story = { name: "One game", args: { games: [OPERA_GAME], totalGames: 1 } };

/** The first query still on its way: «Buscando…» under the heading. */
export const Searching: Story = { args: { games: [], totalGames: 0, isSearching: true } };

/** A position none of the games the viewer can see went through. */
export const Empty: Story = { args: { games: [], totalGames: 0 } };

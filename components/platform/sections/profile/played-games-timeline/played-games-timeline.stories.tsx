import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fixturePlayedGames } from "@/lib/testing/fixtures/bots";
import { PlayedGamesTimeline } from "./played-games-timeline.comp";

const NOW = new Date("2026-10-08T18:00:00Z");
const GAMES = fixturePlayedGames(NOW);

const meta = {
  title: "platform/sections/profile/PlayedGamesTimeline",
  component: PlayedGamesTimeline,
  parameters: {
    docs: {
      description: {
        component: `
Every game of a person (L4): the day on the left, a dot of the result's
colour on the line, the game's row on the right; twenty a page, the open
games first. Each row opens its game.

Source: \`components/platform/sections/profile/played-games-timeline/played-games-timeline.comp.tsx\`.
Reference page: [Components › PlayedGamesTimeline](/components/platform/sections/profile/played-games-timeline) in the docs site.
`,
      },
    },
  },
  args: {
    page: { games: GAMES, page: 1, pageCount: 1, total: GAMES.length },
    isOwn: true,
    filtered: false,
    hrefOf: (page: number) => `/perfil/ana-torres/partidas?pagina=${page}`,
    now: NOW,
  },
} satisfies Meta<typeof PlayedGamesTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One's own games: open, won, lost and drawn, grouped by day. */
export const Own: Story = {};

/** The second of three pages: the way to the more recent and the older ones. */
export const Paged: Story = { args: { page: { games: GAMES, page: 2, pageCount: 3, total: 50 } } };

/** Nothing played yet, on one's own profile: the way to «Jugar». */
export const Empty: Story = { args: { page: { games: [], page: 1, pageCount: 1, total: 0 } } };

/** A filter that keeps nothing. */
export const NothingFiltered: Story = {
  args: { page: { games: [], page: 1, pageCount: 1, total: 0 }, filtered: true },
};

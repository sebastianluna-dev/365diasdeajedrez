import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fixtureAdventureProgress, fixtureAdventureShelf } from "@/lib/testing/fixtures/adventure";
import { fixturePlayedGames } from "@/lib/testing/fixtures/bots";
import { PlayHome } from "./play-home.comp";

const NOW = new Date("2026-10-08T18:00:00Z");
const PROGRESS = fixtureAdventureProgress({ attemptsOnNext: 1, openGame: "adventure" });
const COMPLETE = fixtureAdventureProgress({ beaten: 12 });
const FRESH = fixtureAdventureProgress({ beaten: 0 });

const meta = {
  title: "platform/sections/play/PlayHome",
  component: PlayHome,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
«Jugar» in the new design system (the owner's «M4 · /jugar»): «Continuar la
partida» and «Tus partidas» in the side column, the notebook the person is in
big on the panel — its journey, the stamps of the rivals beaten, the next one
and «Continuar la aventura» — and the shelf of notebooks under it. Every game
against a bot is an encounter of the adventure, so there is no «Partida libre»;
and playing a person does not exist, so there is no «Contra una persona».
\`PlayHomeSection\` reads the data; these stories hand it fixtures.

Source: \`components/platform/sections/play/play-home/play-home.comp.tsx\`.
Reference page: [Components › PlayHome](/components/platform/sections/play/play-home) in the docs site.
`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="platform-page platform-page_width_full platform-page_frame_bleed">
        <Story />
      </div>
    ),
  ],
  args: {
    progress: PROGRESS,
    shelf: fixtureAdventureShelf(PROGRESS),
    games: fixturePlayedGames(NOW),
    record: { wins: 8, losses: 5, draws: 2 },
    gamesHref: "/perfil/alumno-demo/partidas",
    now: NOW,
  },
} satisfies Meta<typeof PlayHome>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Four of twelve with a game open against the fifth: «Continuar la partida» on top, its second attempt as the next rival. */
export const InProgress: Story = {};

/** Nothing played yet: no FAB, the first rival as the next one, and the side column says the games will come. */
export const Fresh: Story = {
  args: {
    progress: FRESH,
    shelf: fixtureAdventureShelf(FRESH),
    games: [],
    record: { wins: 0, losses: 0, draws: 0 },
  },
};

/** The notebook finished: every stamp filled, «Abrir el mapa» instead of «Continuar la aventura». */
export const Complete: Story = {
  args: { progress: COMPLETE, shelf: fixtureAdventureShelf(COMPLETE) },
};

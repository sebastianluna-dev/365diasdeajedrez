import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { GameList, type GameListItem } from "./game-list.comp";

/** A chapter's collection of eight games: some named by the staff, some by their pairing alone. */
const GAMES: GameListItem[] = [
  { id: "g1", name: "Una celada en la apertura", players: "Fischer — Sherwin", resultLabel: "1-0", href: "#" },
  { id: "g2", name: "Lombardy — Fischer", resultLabel: "0-1", href: "#" },
  { id: "g3", name: "La partida del siglo", players: "Byrne — Fischer", resultLabel: "0-1", href: "#" },
  { id: "g4", name: "Fischer — Mednis", resultLabel: "1-0", href: "#" },
  { id: "g5", name: "Un final de alfiles", players: "Fischer — Bisguier", resultLabel: "½-½", href: "#" },
  { id: "g6", name: "Tal — Fischer", resultLabel: "1-0", href: "#" },
  { id: "g7", name: "El sacrificio que no se acepta", players: "Fischer — Spassky", resultLabel: "1-0", href: "#" },
  { id: "g8", name: "Petrosian — Fischer", resultLabel: "0-1", href: "#" },
];

/** Stands in for the screen's server action, already bound to its study or chapter: a spy records the order it is sent. */
const reorder = fn(async () => {}).mockName("reorderChapterGames");

const meta = {
  title: "platform/shared/GameList",
  component: GameList,
  parameters: {
    docs: {
      description: {
        component: `
The games beside the board, in a student's study and in a chapter's
collection: about eight rows tall with a scroll of its own, the current game
brought into the middle on arrival. A row is the game's name, small and on two
lines at most, who played it in a smaller line under it, and how it ended; the row is the card, so the current game's
wash and rule take its grip in. With \`settings\` each row ends in a gear
that opens the game's settings (\`GameSettings\`).
With \`onReorder\` a row is dragged by its grip (which comes out when the row
is hovered or holds the focus) or moved with the keyboard from the grip; here
the action is a spy listed in the Actions panel and nothing is saved.

Source: \`components/platform/shared/game-list/game-list.comp.tsx\`.
Reference page: [Components › GameList](/components/platform/shared/game-list) in the docs site.
`,
      },
    },
  },
  args: {
    games: GAMES,
    currentId: "g6",
    onReorder: reorder,
  },
  argTypes: {
    onReorder: { description: "The screen's server action, bound to its study or chapter; a spy here." },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 32, background: "var(--platform-bg)" }}>
        <div className="platform-card" style={{ maxWidth: 300, margin: "0 auto", padding: 0 }}>
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof GameList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A collection whoever reads may put in order, the sixth game current and brought into the middle of the list. */
export const Sortable: Story = {
  name: "Una colección que se ordena",
};

/** With `settings`, each row ends in the gear that opens the game's settings (`GameSettings`); the actions are spies. */
export const WithSettings: Story = {
  name: "Con ajustes en cada partida",
  args: {
    games: GAMES.map((game, index) => (index % 2 === 0 ? { ...game, title: game.name } : game)),
    settings: {
      save: fn(async () => {}).mockName("updateGameSettings"),
      clearAnnotations: fn(async () => {}).mockName("clearGameAnnotations"),
      clearVariations: fn(async () => {}).mockName("clearGameVariations"),
      remove: fn(async () => {}).mockName("deleteStudyGame"),
    },
  },
};

/** Without `onReorder` — someone else's study, or one page of several —: only links, no grip. */
export const LinksOnly: Story = {
  name: "Sólo enlaces",
  args: { onReorder: undefined },
};

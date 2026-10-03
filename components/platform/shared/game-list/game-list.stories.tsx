import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
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
collection: five rows tall with a scroll of its own, the current game brought
into the middle on arrival. With \`onReorder\` a row is dragged by its grip
(the handles come out when the list is hovered), moved with the keyboard from
the grip, or stepped one place with the arrows at its end, «Subir» and
«Bajar»; here the action is a spy listed in the Actions panel and nothing is
saved.

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

/** Without `onReorder` — someone else's study, or one page of several —: only links, no grip and no arrows. */
export const LinksOnly: Story = {
  name: "Sólo enlaces",
  args: { onReorder: undefined },
};

/** «Bajar» pressed on the first game: it is now the second, the arrow kept the focus, and the order was sent whole. */
export const SteppedDownWithoutDragging: Story = {
  name: "Una partida bajada sin arrastrar",
  args: { currentId: "g1" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const name = "Una celada en la apertura";
    const down = canvas.getByRole("button", { name: `Bajar «${name}»` });
    await userEvent.click(down);

    const names = () => [...canvasElement.querySelectorAll(".game-list__name")].map((node) => node.textContent);
    await expect(names().slice(0, 2)).toEqual(["Lombardy — Fischer", name]);
    await waitFor(() => expect(down).toHaveFocus());
    // By its text: dnd-kit's own live region is a `status` too.
    await expect(canvas.getByText(`«${name}» queda en la posición 2 de 8.`)).toHaveAttribute("role", "status");
    await expect(args.onReorder).toHaveBeenCalledWith(["g2", "g1", "g3", "g4", "g5", "g6", "g7", "g8"]);
  },
};

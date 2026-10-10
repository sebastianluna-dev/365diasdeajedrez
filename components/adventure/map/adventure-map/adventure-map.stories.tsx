import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ADVENTURE_ART } from "@/lib/adventure/adventures";
import { CUADERNO_DEL_VIAJERO } from "@/lib/adventure/adventures/cuaderno-del-viajero";
import { fixtureAdventureProgress } from "@/lib/testing/fixtures/adventure";
import { AdventureMap } from "./adventure-map.comp";

const meta = {
  title: "adventure/map/AdventureMap",
  component: AdventureMap,
  parameters: {
    docs: {
      description: {
        component: `
The adventure's map: the journey drawn on paper, from the plaza to the palace.
Three layouts of the same world (desktop from 1024px, tablet from 768, phone
below) lie in the page and the stylesheet shows the one that fits. Over the
static scenery the live layer is drawn from data: the red seam sewn up to the
rival to play and the rest of the path in pencil, the needle, the pages of the
notebook (open once reached, folded and closed before), the keepsakes stuck
down, the twelve stamps and the person's token. A row over the map says where
one is. \`AdventureMapSection\` reads the progress; these stories hand it a
fixture.

Source: \`components/adventure/map/adventure-map/adventure-map.comp.tsx\`.
Reference page: [Components › AdventureMap](/components/adventure/map/adventure-map) in the docs site.
`,
      },
    },
  },
  args: {
    progress: fixtureAdventureProgress({ attemptsOnNext: 1 }),
    zones: CUADERNO_DEL_VIAJERO.zones,
    art: ADVENTURE_ART["cuaderno-del-viajero"]!,
    player: { initials: "AD", name: "Alumno Demo" },
    victory: null,
    action: async () => undefined,
  },
  decorators: [
    (Story) => (
      // There is no platform bar in a story: the row sticks to the top of the window.
      <div style={{ "--map-bar": "0px" } as React.CSSProperties}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AdventureMap>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Four rivals beaten (★★★, ★★, ★, ★★★), the fifth to play on its second attempt: the map opens on it, with the first four stamped and kept. */
export const FourOfTwelve: Story = {};

/** Nothing played: only the first stamp is open, every other is blind with a padlock, and the notebook's pages are closed. */
export const Fresh: Story = {
  args: { progress: fixtureAdventureProgress({ beaten: 0, stars: [] }) },
};

/** Every rival beaten: the seam runs to the palace, the last stamp is cancelled and no page is closed. */
export const Complete: Story = {
  args: { progress: fixtureAdventureProgress({ beaten: 12, stars: [3, 2, 1, 3, 3, 2, 3, 2, 1, 3, 2, 3] }) },
};

/** The same map on a phone: the layout of 420 units, the row folded to icons and the token and the stamps scaled to the width. */
export const Phone: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};

/** Pressing a stamp opens that rival's card over the map: here the fifth, the one to play. */
export const OpenCard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const stamps = await canvas.findAllByRole("button", { name: /Anselmo Quiroga, rival 5 de 12/ });
    const visible = stamps.find((stamp) => stamp.offsetParent !== null);
    await userEvent.click(visible!);
    const dialog = await within(document.body).findByRole("dialog", { name: /Ficha de rival · N.º 05 de 12/ });
    await expect(dialog).toHaveAttribute("open");
  },
};

/** With a game against a bot open: «Empezar» asks, in a second popup over the card, before closing it. */
export const ReplacingAnOpenGame: Story = {
  args: { progress: fixtureAdventureProgress({ attemptsOnNext: 1, openGame: "free" }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const stamps = await canvas.findAllByRole("button", { name: /Anselmo Quiroga, rival 5 de 12/ });
    await userEvent.click(stamps.find((stamp) => stamp.offsetParent !== null)!);
    const card = await within(document.body).findByRole("dialog", { name: /Ficha de rival/ });
    await userEvent.click(within(card).getByRole("button", { name: "Empezar" }));
    const question = await within(document.body).findByRole("dialog", {
      name: /¿Quitar tu partida en curso contra Lupita\?/,
    });
    await expect(question).toHaveAttribute("open");
  },
};

/** The map as the person finds it after a win: five rivals beaten (the fifth at its second try), the sixth open with its pin and the token on it. */
export const AfterVictory: Story = {
  args: { progress: fixtureAdventureProgress({ beaten: 5, stars: [3, 2, 1, 3, 2] }) },
};

/**
 * Coming back from the first win over the fifth rival (`?victoria=5`): the map starts as it was before it — the fifth
 * pinned, the sixth locked, four of twelve — and plays the victory once: the pin comes out, the postmark lands, two
 * stars come out, the keepsake is stuck down, the seam is sewn to the sixth with the needle leading, its padlock falls
 * and it is pinned, and the token hops over; the count goes up to five. The play waits for the end, so the check of
 * accessibility reads the map as it is left.
 */
export const Victory: Story = {
  args: { progress: fixtureAdventureProgress({ beaten: 5, stars: [3, 2, 1, 3, 2] }), victory: 5 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Before it, the count says four.
    await expect(canvas.getAllByText("4 de 12 rivales superados y 9 estrellas").length).toBeGreaterThan(0);
    await waitFor(
      () => expect(canvas.getAllByText("5 de 12 rivales superados y 11 estrellas").length).toBeGreaterThan(0),
      { timeout: 13000 },
    );
    const sixth = canvas.getAllByRole("button", { name: /Inés Cárdenas, rival 6 de 12.*disponible/ });
    await expect(sixth.length).toBeGreaterThan(0);
  },
};

/** The first win over the last page: nothing is left to sew, unlock or hop to, so the sequence ends with the keepsake and the count of twelve. */
export const VictoryOfTheLastPage: Story = {
  args: { progress: fixtureAdventureProgress({ beaten: 12 }), victory: 12 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getAllByText(/12 de 12 rivales superados/).length).toBeGreaterThan(0), {
      timeout: 9000,
    });
  },
};

/** A made-up or old `?victoria=` (here the second rival, with the story well past it) plays nothing: the map is as it is. */
export const VictoryNotPlayed: Story = {
  args: { progress: fixtureAdventureProgress({ beaten: 5, stars: [3, 2, 1, 3, 2] }), victory: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText("5 de 12 rivales superados y 11 estrellas").length).toBeGreaterThan(0);
  },
};

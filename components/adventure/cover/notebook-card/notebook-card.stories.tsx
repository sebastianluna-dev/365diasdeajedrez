import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fixtureAdventureProgress } from "@/lib/testing/fixtures/adventure";
import { NotebookCard } from "./notebook-card.comp";

const meta = {
  title: "adventure/cover/NotebookCard",
  component: NotebookCard,
  parameters: {
    docs: {
      description: {
        component: `
The right-hand page of the cover's open notebook: the adventure's name and
premise, «4 de 12 rivales superados» with the stars and a strip of twelve
stamps, the next rival with the attempt it is on, and the way in — «Continuar
la aventura», a link to the map — with «Elegir otro cuaderno» under it.

Source: \`components/adventure/cover/notebook-card/notebook-card.comp.tsx\`.
Reference page: [Components › NotebookCard](/components/adventure/cover/notebook-card) in the docs site.
`,
      },
    },
  },
  args: { progress: fixtureAdventureProgress() },
  decorators: [
    (Story) => (
      <div
        className="adventure"
        style={{ width: 440, padding: 28, background: "var(--adventure-cream)", boxSizing: "border-box" }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NotebookCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Four of twelve beaten, nine stars, and the fifth rival on its second attempt: the cover as the owner's mock-up shows it. */
export const FourOfTwelve: Story = { args: { progress: fixtureAdventureProgress({ attemptsOnNext: 1 }) } };

/** Nothing written yet: no stars to count, the first rival without an attempt tag, and «Empezar la aventura». */
export const Fresh: Story = { args: { progress: fixtureAdventureProgress({ beaten: 0, stars: [] }) } };

/** All twelve pages written: the next-rival block says the notebook is complete and the button opens the map. */
export const Complete: Story = {
  args: { progress: fixtureAdventureProgress({ beaten: 12, stars: Array(12).fill(3) as (3 | 2 | 1 | 0)[] }) },
};

/** The last page, available after the eleven others: its stamp is sealed with wax. */
export const FinalAvailable: Story = {
  args: { progress: fixtureAdventureProgress({ beaten: 11, stars: Array(11).fill(2) as (3 | 2 | 1 | 0)[] }) },
};

/** A game open against the adventure's own rival: the main button goes on with it. */
export const WithOpenGame: Story = {
  args: { progress: fixtureAdventureProgress({ attemptsOnNext: 1, openGame: "adventure" }) },
};

/** A free game open against a gallery bot: a line says so, and the way in is still the map. */
export const WithFreeGame: Story = { args: { progress: fixtureAdventureProgress({ openGame: "free" }) } };

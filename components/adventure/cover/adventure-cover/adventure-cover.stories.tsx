import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fixtureAdventureProgress } from "@/lib/testing/fixtures/adventure";
import { AdventureCover } from "./adventure-cover.comp";

const meta = {
  title: "adventure/cover/AdventureCover",
  component: AdventureCover,
  parameters: {
    docs: {
      description: {
        component: `
«Jugar» as a desk when the adventure is on: the notebook open in the middle —
the whole journey on the left page, where the person stands on the right.
\`AdventureCoverSection\`
reads the progress and hands it over; this story hands it a fixture.

Source: \`components/adventure/cover/adventure-cover/adventure-cover.comp.tsx\`.
Reference page: [Components › AdventureCover](/components/adventure/cover/adventure-cover) in the docs site.
`,
      },
    },
  },
  args: { progress: fixtureAdventureProgress({ attemptsOnNext: 1 }) },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AdventureCover>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Four of twelve beaten and the fifth rival on its second attempt: the cover as the mock-up shows it. */
export const FourOfTwelve: Story = {};

/** A person who has not played the adventure: no stars, the first rival, «Empezar la aventura». */
export const Fresh: Story = { args: { progress: fixtureAdventureProgress({ beaten: 0, stars: [] }) } };

/** The notebook complete: twelve of twelve, the thread solid to the palace, «Abrir el mapa». */
export const Complete: Story = {
  args: { progress: fixtureAdventureProgress({ beaten: 12, stars: Array(12).fill(3) as (3 | 2 | 1 | 0)[] }) },
};

/** With a game open against the next rival: the main button goes on with the game. */
export const WithOpenGame: Story = {
  args: { progress: fixtureAdventureProgress({ attemptsOnNext: 1, openGame: "adventure" }) },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fixtureAdventureProgress } from "@/lib/testing/fixtures/adventure";
import { EncounterStamp } from "./encounter-stamp.comp";

const encounters = fixtureAdventureProgress({ beaten: 4, stars: [3, 2, 1, 3], attemptsOnNext: 1 }).encounters;
const encounter = (order: number) => encounters[order - 1]!;

const meta = {
  title: "adventure/stamp/EncounterStamp",
  component: EncounterStamp,
  parameters: {
    docs: {
      description: {
        component: `
A rival's stamp on the map: a perforated postage stamp with the rival's
engraved portrait, its level and number, and its label under it. The state
decides the ink: a beaten rival is cancelled with the dated postmark of its
place and shows its stars; the one to play is pinned, lifted and circled in red
and says which attempt it is; a locked one is a blind proof with a pencilled
padlock, and the last page a wax seal. It is one button whose accessible name
says the name, the place in the story, the level, the state and the stars.

Source: \`components/adventure/stamp/encounter-stamp/encounter-stamp.comp.tsx\`.
Reference page: [Components › EncounterStamp](/components/adventure/stamp/encounter-stamp) in the docs site.
`,
      },
    },
  },
  args: {
    encounter: encounter(1),
    adventure: "cuaderno-del-viajero",
    total: 12,
    postmark: "PLAZA",
    position: { left: 50, top: 42, width: 46, tilt: 3 },
    onOpen: () => undefined,
  },
  decorators: [
    (Story) => (
      // The stamp sits in a world: a box with the unit of the art (`--u`) in pixels.
      <div
        className="adventure"
        style={
          {
            position: "relative",
            width: 320,
            height: 360,
            background: "var(--adventure-paper)",
            "--u": "1.1px",
          } as React.CSSProperties
        }
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EncounterStamp>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Beaten at the first try: cancelled with the postmark of the plaza and its date, three stars under the name. */
export const Beaten: Story = {};

/** Beaten after a lost game: two stars. */
export const BeatenWithTwoStars: Story = {
  args: { encounter: encounter(2), postmark: "PLAZA" },
};

/** The rival to play, on its second attempt: pinned and lifted, with the red circle, its brick label and «Intento 2». */
export const Available: Story = {
  args: {
    encounter: encounter(5),
    postmark: "BIBLIOTECA",
    position: { left: 50, top: 42, width: 56, tilt: -3 },
    isFocus: true,
  },
};

/** The rival to play for the first time: the same, without an attempt tag. */
export const AvailableFirstTry: Story = {
  args: {
    encounter: fixtureAdventureProgress({ beaten: 0, stars: [] }).encounters[0]!,
    position: { left: 50, top: 42, width: 56, tilt: 3 },
  },
};

/** A locked rival: a blind proof with a pencilled padlock, a grey label and a lock beside its level. */
export const Locked: Story = {
  args: { encounter: encounter(6), postmark: "BIBLIOTECA" },
};

/** The last page, locked: gold frame and a wax seal instead of the padlock. */
export const FinalLocked: Story = {
  args: { encounter: encounter(12), postmark: "PALACIO", position: { left: 50, top: 42, width: 52, tilt: 0 } },
};

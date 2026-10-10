import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ADVENTURE_ART } from "@/lib/adventure/adventures";
import { fixtureAdventureProgress } from "@/lib/testing/fixtures/adventure";
import { JourneyMiniature } from "./journey-miniature.comp";

const ART = ADVENTURE_ART["cuaderno-del-viajero"]!;
const statesAt = (beaten: number) =>
  fixtureAdventureProgress({ beaten }).encounters.map((encounter) => encounter.state);

const meta = {
  title: "adventure/cover/JourneyMiniature",
  component: JourneyMiniature,
  parameters: {
    docs: {
      description: {
        component: `
The whole journey in one small drawing: cut-paper scenery from the plaza to
the palace, the path sewn over it with red thread and the twelve stamps on their
places — filled when beaten, framed in brick when it is the one to play, grey
and padlocked while locked. The thread is solid as far as the person has got.
The tall one is for the open notebook, the wide one for a phone and for the
shelf's card. It is a drawing of its own until the adventure's art is exported.

Source: \`components/adventure/cover/journey-miniature/journey-miniature.comp.tsx\`.
Reference page: [Components › JourneyMiniature](/components/adventure/cover/journey-miniature) in the docs site.
`,
      },
    },
  },
  args: {
    art: ART.miniature.tall,
    states: statesAt(4),
    variant: "tall",
    label: "El viaje entero: el camino sube de la plaza del barrio al Palacio de los Escaques",
  },
  decorators: [
    (Story) => (
      <div className="adventure" style={{ width: 360, padding: 12, background: "var(--adventure-cream-bright)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof JourneyMiniature>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The tall journey with four pages written: four stamps filled, the fifth framed and the rest padlocked. */
export const Tall: Story = {};

/** Nothing written: the thread is not sewn at all and the first stamp is the one to play. */
export const TallFresh: Story = { args: { states: statesAt(0) } };

/** Every page written: the thread is solid up to the palace and its wax seal carries a tick. */
export const TallComplete: Story = { args: { states: statesAt(12) } };

/** The wide journey of a phone, with four pages written. */
export const Wide: Story = {
  args: {
    art: ART.miniature.wide,
    variant: "wide",
    label: "El viaje entero: de la plaza del barrio al Palacio de los Escaques",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlayerStrip } from "./player-strip.comp";

const meta = {
  title: "chess/game-viewer/PlayerStrip",
  component: PlayerStrip,
  parameters: {
    docs: {
      description: {
        component: `
The line above or below the viewer's board that names a player: colour chip,
federation and its flag, title, name and Elo. It has no root of its own: it
returns its pieces as a fragment and the GameViewer's \`.game-viewer__player\`
lays them out in a row and sets their size, which is why everything inside is
in \`em\`. The viewer places it by colour, because only it knows which side is
on top once the board is flipped.

Here a decorator stands in for that container, with the same rules written
inline (\`parameters.stripWidth\` narrows it).

Source: \`components/chess/game-viewer/player-strip.comp.tsx\`.
Reference page: [Components › PlayerStrip](/components/chess/game-viewer/player-strip) in the docs site.
`,
      },
    },
  },
  args: { name: "Fernanda Ríos", elo: 2391, title: "WGM", country: "MEX", side: "white" },
  argTypes: {
    name: { control: "text" },
    elo: { control: "number" },
    title: { control: "text", description: "FIDE title, as the PGN brings it." },
    country: { control: "text", description: "Federation code; the flag is derived from it, none if unknown." },
    side: { control: "inline-radio", options: ["white", "black"], description: "Which chip to paint." },
  },
  decorators: [
    // The strip's container in the viewer, `.game-viewer__player` of
    // game-viewer.comp.css: a row on the surface, its font size the one the
    // pieces' `em` read. As wide as the viewer's board column, and rounded on
    // all four corners because no board tucks under it here.
    (Story, { parameters }) => (
      <div
        style={{
          maxWidth: (parameters.stripWidth as number | undefined) ?? 560,
          display: "flex",
          alignItems: "center",
          gap: "var(--platform-space-3)",
          padding: "var(--platform-space-2) var(--platform-space-3)",
          background: "var(--platform-surface)",
          borderRadius: 8,
          fontSize: "var(--platform-type-lg)",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlayerStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Everything a PGN can bring, White's strip: chip, federation and its flag, title, name and Elo. */
export const Complete: Story = {};

/** Black's strip: the dark chip, here with another federation and title. */
export const Black: Story = {
  args: { name: "Mateo Vidal", elo: 2476, title: "IM", country: "ARG", side: "black" },
};

/** Only the name, what an old game's PGN brings (Morphy's "Opera game", Paris 1858): the chip still says who has White. */
export const NameOnly: Story = {
  args: { name: "Morphy, Paul", elo: undefined, title: undefined, country: undefined },
};

/** A federation code the table does not know (FID, the FIDE flag): the code is shown and no flag is made up. */
export const UnknownFederation: Story = {
  args: { name: "Mateo Vidal", elo: 2476, title: "IM", country: "FID", side: "black" },
};

/** A long name in a narrow strip: the name is cut with an ellipsis and the Elo keeps its place at the end. */
export const LongName: Story = {
  args: { name: "Fernanda Alejandra Ríos de la Garza" },
  parameters: { stripWidth: 320 },
};

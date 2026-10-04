import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlayerStrip } from "./player-strip.comp";

const meta = {
  title: "chess/game-viewer/PlayerStrip",
  component: PlayerStrip,
  parameters: {
    docs: {
      description: {
        component: `
The line above or below the viewer's board that names a player, low and on a
grey band as Lichess draws it: the point the player took once the game has
ended (1, 0 or ½), federation and its flag, title, name and Elo. It has no
root of its own: it returns its pieces as a fragment and the GameViewer's
\`.game-viewer__player\` lays them out in a row and sets their size, which is
why everything inside is in \`em\`. The viewer places it by colour, because
only it knows which side is on top once the board is flipped.

Here a decorator stands in for that container, with the same rules written
inline (\`parameters.stripWidth\` narrows it).

Source: \`components/chess/game-viewer/player-strip.comp.tsx\`.
Reference page: [Components › PlayerStrip](/components/chess/game-viewer/player-strip) in the docs site.
`,
      },
    },
  },
  args: { name: "Fernanda Ríos", elo: 2391, title: "WGM", country: "MEX", outcome: "win" },
  argTypes: {
    name: { control: "text" },
    elo: { control: "number" },
    title: { control: "text", description: "FIDE title, as the PGN brings it." },
    country: { control: "text", description: "Federation code; the flag is derived from it, none if unknown." },
    outcome: {
      control: "inline-radio",
      options: [undefined, "win", "loss", "draw"],
      description: "How the game ended for the player; none while it has not.",
    },
  },
  decorators: [
    // The strip's container in the viewer, `.game-viewer__player` of
    // game-viewer.comp.css: a low row on the track's grey, its font size the
    // one the pieces' `em` read. As wide as the viewer's board column, and rounded on
    // all four corners because no board tucks under it here.
    (Story, { parameters }) => (
      <div
        style={{
          maxWidth: (parameters.stripWidth as number | undefined) ?? 560,
          display: "flex",
          alignItems: "center",
          gap: "var(--platform-space-2)",
          padding: "var(--platform-space-1) var(--platform-space-3)",
          background: "var(--platform-track)",
          borderRadius: 8,
          fontSize: "var(--platform-type-xs)",
          lineHeight: 1.3,
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlayerStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Everything a PGN can bring, on the winner's strip: the point in the success ink, federation and its flag, title, name and Elo. */
export const Complete: Story = {};

/** The loser's strip: the 0 in the muted grey, here with another federation and title. */
export const Lost: Story = {
  args: { name: "Mateo Vidal", elo: 2476, title: "IM", country: "ARG", outcome: "loss" },
};

/** A draw: each player's strip opens with ½. */
export const Drawn: Story = { args: { outcome: "draw" } };

/** A game that has not ended: no point, and the strip starts at the federation. */
export const Unfinished: Story = { args: { outcome: undefined } };

/** Only the name, what an old game's PGN brings (Morphy's "Opera game", Paris 1858), with the point he took. */
export const NameOnly: Story = {
  args: { name: "Morphy, Paul", elo: undefined, title: undefined, country: undefined },
};

/** A federation code the table does not know (FID, the FIDE flag): the code is shown and no flag is made up. */
export const UnknownFederation: Story = {
  args: { name: "Mateo Vidal", elo: 2476, title: "IM", country: "FID", outcome: "loss" },
};

/** A long name in a narrow strip: the name is cut with an ellipsis and the Elo keeps its place after it. */
export const LongName: Story = {
  args: { name: "Fernanda Alejandra Ríos de la Garza" },
  parameters: { stripWidth: 320 },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StaticDiagram } from "./static-diagram.comp";

/** Lucena's position, the rook ending every course teaches: White to play builds the bridge. */
const LUCENA = "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1";

/** The last position of Morphy's "Opera game", Paris 1858, in the public domain: 17.Td8#. */
const OPERA_MATE = "1n1Rkb1r/p4ppp/4q3/4p1B1/4P3/8/PPP2PPP/2K5 b k - 1 17";

const meta = {
  title: "chess/StaticDiagram",
  component: StaticDiagram,
  parameters: {
    docs: {
      description: {
        component: `
A diagram of a position, the way a book prints one: nothing moves and nothing
loads. A Server Component that parses the FEN's placement into 64 squares and
paints the pieces of \`public/pieces\` as backgrounds, so it costs no client
JavaScript. The class content renderer draws a position block with it, and the
blog's diagram block with \`context="article"\`.

The grid is fluid and stops at 420px: that is its only size, whatever the
column it is put in.

Source: \`components/chess/static-diagram.comp.tsx\`.
Reference page: [Components › StaticDiagram](/components/chess/static-diagram) in the docs site.
`,
      },
    },
  },
  args: { fen: LUCENA, caption: "La posición de Lucena", orientation: "white", context: "platform" },
  argTypes: {
    fen: { control: "text", description: "Full FEN or just its placement field; only the placement is read." },
    orientation: { control: "inline-radio", options: ["white", "black"], description: "Which side is at the bottom." },
    caption: { control: "text", description: "Rendered as `<figcaption>` under the grid." },
    context: {
      control: "inline-radio",
      options: ["platform", "article"],
      description: "The platform, with its tokens, or a blog article, with the site's caption.",
    },
    arrows: {
      control: "object",
      description:
        "Moves drawn over the position, each with its tone: `danger` for the one played, `success` for the one expected.",
    },
  },
} satisfies Meta<typeof StaticDiagram>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A class's position block: the diagram at its full size, the grid's 420px, with the caption under it. */
export const Position: Story = {};

/** Black at the bottom: the 64 squares reversed, here the Opera game's mate seen from the side that got it. */
export const Flipped: Story = {
  args: { fen: OPERA_MATE, orientation: "black", caption: "Después de 17.Td8#, desde las negras" },
};

/** Without a caption: no `<figcaption>`, the figure ends at the grid. */
export const WithoutCaption: Story = {
  args: { caption: undefined },
};

/** Inside a blog article (`context="article"`): the site's light page, the caption a step smaller in the site's grey. */
export const InAnArticle: Story = {
  args: { context: "article", caption: "Juegan las blancas y construyen el puente." },
  decorators: [
    // The article page is the site's light paper; the diagram has no
    // background of its own and is read on it.
    (Story) => (
      <div style={{ maxWidth: 700, padding: "var(--platform-space-6)", background: "var(--color-lighter-gray)" }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * A student's mistake, as the teacher reads it (D24): the move played in the danger red and the one the solution
 * expected in the success green, drawn over the position where it happened — here 1. Td7? instead of the mate 1. Td8#.
 */
export const WithArrows: Story = {
  name: "With arrows",
  args: {
    fen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
    caption: "Jugó Td7 en vez de Td8#",
    arrows: [
      { from: "d1", to: "d7", tone: "danger" },
      { from: "d1", to: "d8", tone: "success" },
    ],
  },
};

/** In a phone's column, 343px: the grid is fluid and shrinks with it. */
export const OnAPhone: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 343 }}>
        <Story />
      </div>
    ),
  ],
};

/** The new design system's board (`look="material"`): the blue squares and the «elegida» pieces, as a study's card shows it. */
export const Material: Story = {
  args: { look: "material", caption: undefined },
};

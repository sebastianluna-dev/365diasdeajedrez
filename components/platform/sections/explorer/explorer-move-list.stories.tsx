import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ExplorerMoveList } from "./explorer-move-list.comp";

/** The Open Sicilian up to 5.Nc3, as the explorer keeps a line: its SAN. */
const OPEN_SICILIAN = ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3"];

/** Stands in for `GameExplorer`'s `setIndex`: a spy records the ply of the move pressed. */
const select = fn().mockName("setIndex");

const meta = {
  title: "platform/sections/explorer/ExplorerMoveList",
  component: ExplorerMoveList,
  parameters: {
    docs: {
      description: {
        component: `
«Jugadas», at the top of the explorer's side column (the new design system):
the line played so far in a white box, as numbered move pills that wrap, the
one on the board filled in the primary. Pressing a move takes the board there.
Here \`onSelect\` is a spy listed in the Actions panel.

Source: \`components/platform/sections/explorer/explorer-move-list.comp.tsx\`.
Reference page: [Components › ExplorerMoveList](/components/platform/sections/explorer/explorer-move-list) in the docs site.
`,
      },
    },
  },
  args: { sans: OPEN_SICILIAN, index: OPEN_SICILIAN.length, onSelect: select },
  argTypes: {
    sans: { control: "object", description: "The line, as SAN." },
    index: { control: "number", description: "The ply on the board; 0 is the initial position." },
    onSelect: { description: "Takes the board to the ply pressed; a spy here." },
  },
  decorators: [
    // The workspace's side column, on the canvas, where the explorer puts it.
    (Story) => (
      <div className="platform-workspace" style={{ minHeight: 0 }}>
        <div className="platform-workspace__side">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof ExplorerMoveList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The Open Sicilian up to 5.Cc3, the last move on the board and filled in blue; the knights drawn as glyphs. */
export const Line: Story = {};

/** The same line taken back to 3.d4: the pill on the board is earlier, the moves after it stay. */
export const EarlierMove: Story = { name: "Earlier move", args: { index: 5 } };

/** Nothing played yet: the hint to move a piece, and that the search is by position. */
export const Empty: Story = { args: { sans: [], index: 0 } };

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { gameEnd } from "@/lib/chess/game-end";
import { PlayVsEngine } from "./play-vs-engine.comp";

const MATE = gameEnd(null, ["e4", "e5", "Bc4", "Nc6", "Qh5", "Nf6", "Qxf7#"]);

const meta = {
  title: "platform/sections/tools/analysis-board/PlayVsEngine",
  component: PlayVsEngine,
  parameters: {
    docs: {
      description: {
        component: `
«Jugar esta posición contra el módulo» on the analysis board (B, T3).
Analysing, the colour — the side to move by default — and the button;
playing, the selection's blue band with whose turn it is, how it ended, and
«Volver al análisis», which leaves the line as a variation.

Source: \`components/platform/sections/tools/analysis-board/play-vs-engine/play-vs-engine.comp.tsx\`.
Reference page: [Components › PlayVsEngine](/components/platform/sections/tools/analysis-board/play-vs-engine) in the docs site.
`,
      },
    },
  },
  args: { sideToMove: "white", playing: null, onStart: fn().mockName("start"), onStop: fn().mockName("stop") },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlayVsEngine>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Analysing, with Black to move at the node: Black is offered first. */
export const Idle: Story = { args: { sideToMove: "black" } };

/** Playing with White, the person's turn. */
export const YourTurn: Story = {
  args: { playing: { color: "white", status: "your-turn", end: null, failed: false } },
};

/** The module answering. */
export const Thinking: Story = {
  args: { playing: { color: "white", status: "thinking", end: null, failed: false } },
};

/** The line ended in mate for the person: «Jaque mate: ganaste.» */
export const Over: Story = {
  args: { playing: { color: "white", status: "over", end: MATE, failed: false } },
};

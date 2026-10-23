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
«Jugar contra el módulo» in the analysis board's side column (B, T3; the
new design system, 2026-10-23). Analysing, a white box with the colour — the
side to move by default — and «Jugar esta posición»; playing, the box in the
pale blue of the info container with the person's colour, that the line stays as
a variation or how it ended, and «Volver al análisis». Whose turn it is is
said on the panel, in the engine's place.

Source: \`components/platform/sections/tools/analysis-board/play-vs-engine/play-vs-engine.comp.tsx\`.
Reference page: [Components › PlayVsEngine](/components/platform/sections/tools/analysis-board/play-vs-engine) in the docs site.
`,
      },
    },
  },
  args: { sideToMove: "white", playing: null, onStart: fn().mockName("start"), onStop: fn().mockName("stop") },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 256, padding: 8, background: "var(--platform-m3-canvas)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlayVsEngine>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Analysing, with Black to move at the node: Black is offered first. */
export const Idle: Story = { args: { sideToMove: "black" } };

/** Playing with White: the box in the pale blue of the info container, the line kept as a variation, the way back. */
export const Playing: Story = {
  args: { playing: { color: "white", status: "your-turn", end: null, failed: false } },
};

/** Playing with Black, the module answering: the black disc before «Juegas con negras». */
export const PlayingBlack: Story = {
  args: { playing: { color: "black", status: "thinking", end: null, failed: false } },
};

/** The module stopped answering: the line ends where it is, and stays. */
export const Failed: Story = {
  args: { playing: { color: "white", status: "over", end: null, failed: true } },
};

/** The line ended in mate for the person: «Jaque mate: ganaste.» */
export const Over: Story = {
  args: { playing: { color: "white", status: "over", end: MATE, failed: false } },
};

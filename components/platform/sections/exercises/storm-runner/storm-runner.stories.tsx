import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";
import { SAMPLE_EXERCISES } from "@/constants/platform/exercise-samples.const";
import { StormRunner } from "./storm-runner.comp";

const DECK = SAMPLE_EXERCISES.slice(0, 8);

const meta = {
  title: "platform/sections/exercises/StormRunner",
  component: StormRunner,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
«Puzzle Rush» on the panel of «Ejercicios», in the new design system: before a
run, the rush's drawing, today's best and the best ever, the three modes as
cards, «Jugar», the marks of every mode and how it is played; during it, the
material board beside the score, the clock, the three mistakes' slots and the
grid of the run's exercises. The scores are this browser's while nothing persists.

Source: \`components/platform/sections/exercises/storm-runner/storm-runner.comp.tsx\`.
Reference page: [Components › StormRunner](/components/platform/sections/exercises/storm-runner) in the docs site.
`,
      },
    },
  },
  args: { deck: DECK },
  decorators: [
    (Story) => (
      <div className="platform-workspace" style={{ minHeight: 0, paddingTop: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StormRunner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Before a run: the modes, «3 min» chosen, «Jugar», the marks and the rules. */
export const Ready: Story = {};

/** «Supervivencia» chosen and the run started by its `play`: the board, the clock counting up, the empty slots and the first exercise ringed. */
export const Running: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("radio", { name: /Supervivencia/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Jugar" }));
    await expect(canvas.getByRole("button", { name: "Salir" })).toBeVisible();
  },
};

/** The library holds nothing yet: «Jugar» is off and a line says why. */
export const EmptyDeck: Story = {
  args: { deck: [] },
};

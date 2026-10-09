import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { PositionInput } from "./position-input.comp";

const meta = {
  title: "platform/sections/tools/analysis-board/PositionInput",
  component: PositionInput,
  parameters: {
    docs: {
      description: {
        component: `
Where a position comes into the analysis board (K1): «FEN» and «PGN», each
with its label, and one «Cargar». It is checked in the browser: a bad FEN or
PGN says so under its own field and the board stays as it was.

Source: \`components/platform/sections/tools/analysis-board/position-input/position-input.comp.tsx\`.
Reference page: [Components › PositionInput](/components/platform/sections/tools/analysis-board/position-input) in the docs site.
`,
      },
    },
  },
  args: { onLoad: fn().mockName("loadOnTheBoard") },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PositionInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Both fields empty, under the board. */
export const Empty: Story = {};

/** A FEN without kings, «Cargar» pressed by its `play`: «No es un FEN válido.» under the field. */
export const InvalidFen: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/^FEN/), "8/8/8/8/8/8/8/8 w - - 0 1");
    await userEvent.click(canvas.getByRole("button", { name: "Cargar" }));
    await expect(canvas.getByText("No es un FEN válido.")).toBeVisible();
    await expect(args.onLoad).not.toHaveBeenCalled();
  },
};

/** Text that is no game in the PGN field: «No es un PGN válido.» under it. */
export const InvalidPgn: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/^PGN/), "hola");
    await userEvent.click(canvas.getByRole("button", { name: "Cargar" }));
    await expect(canvas.getByText("No es un PGN válido.")).toBeVisible();
  },
};

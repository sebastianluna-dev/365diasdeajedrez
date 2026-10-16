import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { DeleteExercise } from "./delete-exercise.comp";

const meta = {
  title: "platform/shared/DeleteExercise",
  component: DeleteExercise,
  parameters: {
    docs: {
      description: {
        component: `
«Eliminar», the row word of an exercise of the bank, behind its
confirmation. The one piece of \`ExerciseCard\` with state, so the card
renders on the server.

Source: \`components/platform/shared/delete-exercise/delete-exercise.comp.tsx\`.
Reference page: [Components › DeleteExercise](/components/platform/shared/delete-exercise) in the docs site.
`,
      },
    },
  },
  args: {
    title: "La dama que se entrega",
    action: fn(async () => undefined),
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DeleteExercise>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The row word, in the danger's ink. */
export const Default: Story = {};

/** «Eliminar» opens its confirmation over the page, naming the exercise. */
export const Confirm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Eliminar" }));
    const dialog = await canvas.findByRole("dialog", { name: "¿Eliminar «La dama que se entrega»?" });
    await waitFor(() => expect(dialog).toBeVisible());
  },
};

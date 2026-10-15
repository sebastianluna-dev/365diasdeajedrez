import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { ClassGameSave } from "./class-game-save.comp";

const meta = {
  title: "platform/shared/ClassGameSave",
  component: ClassGameSave,
  parameters: {
    docs: {
      description: {
        component: `
«Guardar en un estudio» under a game seen in class, with its popup: a copy
into one of the student's own studies.

Source: \`components/platform/shared/class-game-save/class-game-save.comp.tsx\`.
Reference page: [Components › ClassGameSave](/components/platform/shared/class-game-save) in the docs site.
`,
      },
    },
  },
  args: {
    classId: "c1",
    blockId: "b3",
    title: "Morphy – Duque de Brunswick",
    studies: [
      { id: "s1", name: "Mis partidas" },
      { id: "s2", name: "Aperturas" },
    ],
    action: async () => {},
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ minHeight: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClassGameSave>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The button, closed. */
export const Default: Story = {};

/** The popup open, proposing the game's players as the copy's name. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Guardar en un estudio" }));
  },
};

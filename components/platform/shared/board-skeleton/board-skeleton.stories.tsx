import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BoardSkeleton } from "./board-skeleton.comp";

const meta = {
  title: "platform/shared/BoardSkeleton",
  component: BoardSkeleton,
  parameters: {
    docs: {
      description: {
        component: `
A board before its game: the eight by eight painted in chessground's two
greens with one ring turning in its middle. It is what the board's place
shows while the next game of the SAME screen arrives — the next lesson of a
chapter (\`LessonSkeleton\`), the next game of a study (\`GameSkeleton\`) —,
so what lands are the pieces and not a new page. It fills the width it is
given and is square; what is painted is that side rounded down to a whole 8,
as chessground does. Under \`prefers-reduced-motion\` the ring stands still.

Source: \`components/platform/shared/board-skeleton/board-skeleton.comp.tsx\`.
Reference page: [Components › BoardSkeleton](/components/platform/shared/board-skeleton) in the docs site.
`,
      },
    },
  },
  argTypes: {
    label: { control: "text", description: "What is on its way, for a screen reader." },
  },
  args: { label: "Cargando la partida" },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BoardSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A board on its way, in a 360px track: the painted squares and the ring turning in the middle. */
export const Default: Story = {};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BoardLoading } from "./board-loading.comp";

const meta = {
  title: "platform/shared/BoardLoading",
  component: BoardLoading,
  parameters: {
    docs: {
      description: {
        component: `
What a \`loading.tsx\` of the platform shows while one arrives at a screen
— every one but the lesson's and the study game's, which draw their own
skeleton around \`BoardSkeleton\` —: a
knight that hops over its shadow, and one line, announced politely
(\`role="status"\`). Under \`prefers-reduced-motion\` the knight stands still.

Source: \`components/platform/shared/board-loading/board-loading.comp.tsx\`.
Reference page: [Components › BoardLoading](/components/platform/shared/board-loading) in the docs site.
`,
      },
    },
  },
  argTypes: {
    label: { control: "text", description: "The line under the knight; «Cargando…» by default." },
  },
} satisfies Meta<typeof BoardLoading>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The generic line, as every segment but one says it. */
export const Default: Story = {};

/** The study's segment, where what is waited for is a board, says so. */
export const PreparingTheBoard: Story = {
  name: "Preparing the board",
  args: { label: "Preparando el tablero…" },
};

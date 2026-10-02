import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LessonSkeleton } from "./lesson-skeleton.comp";

/**
 * The numbers `.lesson-frame` hands the lesson's column (lesson-frame.comp.css),
 * set on a plain box: the frame itself would also reserve the track of the
 * column of lessons, which is pinned to the window and is not drawn here. The
 * board's ceiling is the one thing changed — the frame measures it by the
 * window's height, which in a canvas is whatever the canvas is — so the story
 * looks the same in the canvas and in the Docs tab.
 */
const FRAME: CSSProperties = {
  ["--viewer-board-max" as string]: "480px",
  ["--viewer-column-gap" as string]: "var(--platform-space-12)",
  ["--viewer-panel-trim" as string]: "62px",
};

const meta = {
  title: "platform/sections/courses/lesson-view/LessonSkeleton",
  component: LessonSkeleton,
  parameters: {
    docs: {
      description: {
        component: `
What the lesson's segment shows while the next lesson's PGN arrives — its
\`loading.tsx\`, the one boundary of the platform that does not render
\`BoardLoading\`. It is the lesson's own shape, empty: the board's square,
painted in chessground's two greens with one ring turning over it, and the
panel of text as a blank card, in the very tracks the viewer will take, so
what arrives are the pieces and the words and nothing jumps. The column of
lessons is the chapter's layout's and is not part of it. Under
\`prefers-reduced-motion\` the ring stands still.

Source: \`components/platform/sections/courses/lesson-view/lesson-skeleton.comp.tsx\`.
Reference page: [Components › LessonSkeleton](/components/platform/sections/courses/lesson-view/lesson-skeleton) in the docs site.
`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={FRAME}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LessonSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A lesson on its way: the painted board with the ring turning, and the blank panel beside it, level with the board, over the room kept for its bar of buttons. */
export const Default: Story = {};

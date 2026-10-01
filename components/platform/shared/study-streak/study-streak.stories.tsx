import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StudyStreak } from "./study-streak.comp";

const meta = {
  title: "platform/shared/StudyStreak",
  component: StudyStreak,
  parameters: {
    docs: {
      description: {
        component: `
«Racha diaria»: how many days in a row the student has been studying, beside
«Mis cursos» and on the dashboard.

While today is not in the streak yet it shows two figures — what the streak is
and what it becomes by studying — and both are drawn smaller, so the card says
either thing in the same room. Once they have studied, the figure is alone and
takes that room.

Source: \`components/platform/shared/study-streak/study-streak.comp.tsx\`.
Reference page: [Components › StudyStreak](/components/platform/shared/study-streak) in the docs site.
`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ padding: 32, maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StudyStreak>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two figures, the second unlit: the streak stands and today is still to be done. */
export const TodayPending: Story = {
  name: "Por mantener (dos figuras)",
  args: { streak: { days: 2, studiedToday: false } },
};

/** One figure, lit: today is already in the streak, so it gets the whole room. */
export const StudiedToday: Story = {
  name: "Mantenida (una figura)",
  args: { streak: { days: 3, studiedToday: true } },
};

/** No streak at all: the figure is a zero, unlit, next to the one it becomes. */
export const NoStreak: Story = {
  name: "Sin racha",
  args: { streak: { days: 0, studiedToday: false } },
};

/** A long streak, to see the figures at three digits. */
export const LongStreak: Story = {
  name: "Racha larga",
  args: { streak: { days: 128, studiedToday: false } },
};

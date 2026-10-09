import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StudyStreakCard } from "./study-streak-card.comp";

const meta = {
  title: "platform/sections/profile/StudyStreakCard",
  component: StudyStreakCard,
  parameters: {
    docs: {
      description: {
        component: `
«Racha de estudio» (N5): the days in a row, whether today is studied, and
this week's days and minutes. Read from the activity log, which playing never
writes.

Source: \`components/platform/sections/profile/study-streak-card/study-streak-card.comp.tsx\`.
Reference page: [Components › StudyStreakCard](/components/platform/sections/profile/study-streak-card) in the docs site.
`,
      },
    },
  },
  args: {
    streak: { streak: { days: 21, studiedToday: true }, daysThisWeek: 4, minutesThisWeek: 95 },
    isOwn: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StudyStreakCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Twenty-one days, today already studied. */
export const Studied: Story = {};

/** A streak still to be kept today, on somebody else's profile. */
export const NotToday: Story = {
  args: { streak: { streak: { days: 1, studiedToday: false }, daysThisWeek: 1, minutesThisWeek: 15 }, isOwn: false },
};

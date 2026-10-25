import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SAMPLE_STREAK, SAMPLE_STREAK_WEEKS } from "@/constants/platform/chart-samples.const";
import { PlatformStreakCalendar } from "./platform-streak-calendar.comp";

const meta = {
  title: "platform/shared/PlatformStreakCalendar",
  component: PlatformStreakCalendar,
  parameters: {
    docs: {
      description: {
        component: `
The streak's calendar: a pill per week, Monday on top, a dot per day as deep
a blue as what was done, the current streak hatched, today ringed, the
months over their first week. Days still to come are left empty. Drawn at
its own size, never larger. One image, named by \`label\`.

Source: \`components/platform/shared/platform-streak-calendar/platform-streak-calendar.comp.tsx\`.
Reference page: [Components › PlatformStreakCalendar](/components/platform/shared/platform-streak-calendar) in the docs site.
`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="platform-workspace" style={{ minHeight: 0 }}>
        <div
          className="platform-workspace__panel"
          style={{ maxWidth: 480, background: "var(--platform-m3-container)" }}
        >
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    weeks: SAMPLE_STREAK_WEEKS,
    streak: SAMPLE_STREAK,
    tag: "12 días",
    label:
      "Tus últimas 16 semanas, del 6 de julio al 25 de octubre: tu racha actual es de 12 días (desde el 14 de octubre) y la mejor, de 19.",
  },
} satisfies Meta<typeof PlatformStreakCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Sixteen weeks with a twelve-day streak that includes today. */
export const OnAStreak: Story = {};

/** Today still to study: the streak ends yesterday and today is ringed outside it. */
export const TodayPending: Story = {
  args: {
    weeks: SAMPLE_STREAK_WEEKS.map((week) => week.map((day) => (day.isToday ? { ...day, count: 0, level: 0 } : day))),
    streak: { days: 11, studiedToday: false },
    tag: "11 días",
  },
};

/** Mid-week: the days still to come are left empty. */
export const MidWeek: Story = {
  args: {
    weeks: SAMPLE_STREAK_WEEKS.map((week, index) =>
      index < 15 ? week : week.map((day, weekday) => ({ ...day, isToday: weekday === 3, isFuture: weekday > 3 })),
    ),
    streak: { days: 9, studiedToday: true },
    tag: "9 días",
  },
};

/** No streak at all: nothing is hatched and there is no tag. */
export const NoStreak: Story = {
  args: {
    weeks: SAMPLE_STREAK_WEEKS.map((week) => week.map((day) => ({ ...day, count: 0, level: 0 }))),
    streak: { days: 0, studiedToday: false },
    tag: undefined,
    label: "Tus últimas 16 semanas: sin días de estudio.",
  },
};

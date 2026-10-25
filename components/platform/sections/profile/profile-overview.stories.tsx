import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PROFILE_FIXTURE_NOW, fixtureProfileView } from "@/lib/testing/fixtures/profile";
import { ProfileOverviewSection } from "./profile-overview.section";

const EMPTY_WEEKS = fixtureProfileView().streak.weeks.map((week) =>
  week.map((day) => ({ ...day, count: 0, level: 0 as const })),
);

const meta = {
  title: "platform/sections/profile/ProfileOverviewSection",
  component: ProfileOverviewSection,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
«Visión general» of a profile in the new design system (the owner's «Perfil
E2»): «Jugar» and the profile's views in the side column, the sheet stuck at
the left of the panel and the profile as a story at its right — this month's
minutes against the last, the streak, the level against bots and the record
against each bot, the last games. On somebody else's profile the sentences
are in the third person and what is one's own is not drawn.

Source: \`components/platform/sections/profile/profile-overview.section.tsx\`.
Reference page: [Components › ProfileOverviewSection](/components/platform/sections/profile/profile-overview-section) in the docs site.
`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="platform-page platform-page_width_full platform-page_frame_bleed">
        <Story />
      </div>
    ),
  ],
  args: { profile: fixtureProfileView(), now: PROFILE_FIXTURE_NOW },
} satisfies Meta<typeof ProfileOverviewSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One's own profile: «Jugar», «Lo tuyo», the pen to edit it and the sentences in the second person. */
export const Own: Story = {};

/** A student's profile as their teacher sees it: no «Jugar», no «Lo tuyo», the sentences in the third person. */
export const AsTheirTeacher: Story = {
  args: { profile: fixtureProfileView({ isOwn: false }) },
};

/** A student who just joined: no minutes, no streak, no games — every chapter says what will come. */
export const NewStudent: Story = {
  args: {
    profile: fixtureProfileView({
      statusLine: null,
      counts: { courses: 0, studies: 0, games: 0 },
      botLevel: { level: null, sampleSize: 0, series: [] },
      record: { wins: 0, losses: 0, draws: 0, open: 0 },
      botRecords: [],
      recentGames: [],
      streak: {
        streak: { days: 0, studiedToday: false },
        weeks: EMPTY_WEEKS,
        daysStudied: 0,
        bestStreak: 0,
        daysThisWeek: 0,
        minutesThisWeek: 0,
      },
      studyMonths: {
        ...fixtureProfileView().studyMonths,
        current: {
          ...fixtureProfileView().studyMonths.current,
          days: fixtureProfileView().studyMonths.current.days.map((entry) => ({ ...entry, minutes: 0 })),
        },
        previous: {
          ...fixtureProfileView().studyMonths.previous,
          days: fixtureProfileView().studyMonths.previous.days.map((entry) => ({ ...entry, minutes: 0 })),
        },
      },
    }),
  },
};

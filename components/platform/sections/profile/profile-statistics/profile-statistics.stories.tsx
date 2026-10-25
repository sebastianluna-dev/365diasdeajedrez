import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProfileStatisticsSection } from "./profile-statistics.section";
import { sampleStatistics as sample } from "./profile-statistics.samples";

const meta = {
  title: "platform/sections/profile/ProfileStatisticsSection",
  component: ProfileStatisticsSection,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
«Estadísticas» (\`/perfil/estadisticas\`), the student's own: the profile's
views and the period in the side column, three tabs with their figure and
sparkline, and the open one's charts. Made-up data, the shapes
\`getStudentStatistics\` returns.

Source: \`components/platform/sections/profile/profile-statistics/profile-statistics.section.tsx\`.
Reference page: [Components › ProfileStatisticsSection](/components/platform/sections/profile/profile-statistics-section) in the docs site.
`,
      },
    },
  },
  args: {
    statistics: sample("mes"),
    tab: "estudio",
    continueHref: "/cursos",
    profile: { slug: "andrea-dominguez", games: 24 },
  },
} satisfies Meta<typeof ProfileStatisticsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** «Estudio» this month: the minutes day by day with today and the goal, the streak, the topics and «Lo que hiciste». */
export const Study: Story = {};

/** «Ejercicios» this month: passed per week, the attempts, the topics and the reviews due. */
export const Exercises: Story = { args: { tab: "ejercicios" } };

/** «Jugar» this month: the level with its slider and the period's record. */
export const Play: Story = { args: { tab: "jugar" } };

/** «Este año»: the minutes month by month, against last year. */
export const ThisYear: Story = { args: { statistics: sample("anio") } };

/** Without «Jugar» or «Ejercicios» switched on: «Estudio» alone, and no profile views. */
export const StudyOnly: Story = {
  args: { statistics: { ...sample("semana"), exercises: null, play: null }, profile: null },
};

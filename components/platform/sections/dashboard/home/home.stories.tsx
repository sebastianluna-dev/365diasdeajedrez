import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CLASS_PHASE } from "@/constants/platform/class-codes.const";
import { studentCard, studentCardAt, studentJoin } from "@/lib/testing/fixtures/student-classes";
import type { DashboardData, DashboardStatsRange } from "@/services/dashboard/dashboard.types";
import type { StudyGoal } from "@/services/study-goal/study-goal.types";
import { HomeSection } from "./home.section";

/** A range of the statistics: every metric, even at zero, and the topics most practised first. */
function range(counts: number[], topics: [label: string, count: number][]): DashboardStatsRange {
  const labels = [
    "Lecciones completadas",
    "Cursos completados",
    "Clases asistidas",
    "Partidas analizadas",
    "Ejercicios superados",
  ];
  return {
    totals: labels.map((label, index) => ({ label, count: counts[index] ?? 0 })),
    topics: topics.map(([label, count]) => ({ label, count })),
  };
}

/** A student some weeks in, a course under way. */
const DASHBOARD: DashboardData = {
  profile: { displayName: "Andrea Domínguez", email: "andrea@example.com", memberSinceLabel: "2 de septiembre, 2026" },
  stats: {
    week: range(
      [4, 0, 1, 2, 7],
      [
        ["Táctica", 6],
        ["Finales", 3],
      ],
    ),
    month: range(
      [15, 1, 4, 6, 23],
      [
        ["Táctica", 18],
        ["Finales", 9],
        ["Aperturas", 7],
      ],
    ),
    year: range(
      [31, 1, 9, 12, 60],
      [
        ["Táctica", 40],
        ["Finales", 20],
      ],
    ),
    all: range(
      [31, 1, 9, 12, 60],
      [
        ["Táctica", 40],
        ["Finales", 20],
      ],
    ),
  },
  continueStudying: {
    courseName: "La Najdorf",
    lessonName: "6.Ae3, el ataque inglés",
    percent: 40,
    completedLessons: 4,
    totalLessons: 10,
    href: "/cursos/12345678/2/abc",
  },
  recentActivity: [
    {
      id: "a1",
      typeLabel: "Lección completada",
      subjectName: "Torre activa",
      topicLabel: "Finales",
      dateLabel: "1 de octubre, 2026",
    },
    { id: "a2", typeLabel: "Clase asistida", subjectName: "Finales de torres", dateLabel: "29 de septiembre, 2026" },
  ],
};

/** Twelve days in a row, twelve of twenty minutes today. */
const GOAL: StudyGoal = { streak: { days: 12, studiedToday: true }, minutesToday: 12, goalMinutes: 20, percent: 60 };

/**
 * Today's group class, eight minutes from now, its link open: drawn from the
 * browser's clock, so the countdown and its ring stay in their last hour
 * whenever the story is opened.
 */
function classInEightMinutes() {
  const now = new Date();
  const start = new Date(now.getTime() + 8 * 60_000);
  const end = new Date(start.getTime() + 60 * 60_000);
  const join = studentJoin({
    startIso: start.toISOString(),
    endIso: end.toISOString(),
    visibleFromIso: new Date(start.getTime() - 30 * 60_000).toISOString(),
    untilIso: new Date(end.getTime() + 30 * 60_000).toISOString(),
    nowIso: now.toISOString(),
  });
  return studentCard({
    title: "Finales de torres",
    startIso: join.startIso,
    nowIso: join.nowIso,
    teacherName: "Laura Méndez",
    isGroup: true,
    classmates: ["Ana", "Diego", "Mateo"],
    join,
  });
}

/** Saturday's workshop, seen from the example Wednesday. */
const SATURDAY = studentCardAt("2026-10-17", "10:00", 90, CLASS_PHASE.UPCOMING, {
  id: "c5",
  href: "/clases/c5",
  title: "Taller de finales de torre",
});

const meta = {
  title: "platform/sections/dashboard/HomeSection",
  component: HomeSection,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
«Inicio», the student's home page, in the new design system (the owner's
«Inicio: un solo foco»): the white panel with no side column, the greeting,
«Lo siguiente» in a block of the primary — today's class with its countdown
ring, the course in progress, the next class, or choosing what to study —,
«Después» as tiles, the day at the first screen's foot, and under it the
statistics and the recent activity.

Source: \`components/platform/sections/dashboard/home/home.section.tsx\`.
Reference page: [Components › HomeSection](/components/platform/sections/dashboard/home/home-section) in the docs site.
`,
      },
    },
  },
  args: {
    dashboard: DASHBOARD,
    nextClass: SATURDAY,
    classExercises: { classTitle: "Finales de torres", href: "/clases/c2/ejercicios/b1/2", done: 1, total: 3 },
    goal: GOAL,
  },
  decorators: [
    (Story) => (
      <div className="platform-theme platform-page platform-page_width_full platform-page_frame_bleed">
        <div className="platform-workspace platform-workspace_side_none">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof HomeSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A class day: the class first, eight minutes to go and its ring, «Entrar a la clase»; the course and the class's exercises after it. */
export const ClassDay: Story = {
  name: "Class day",
  render: (args) => <HomeSection {...args} nextClass={classInEightMinutes()} />,
};

/** Any other day: the course in progress first, «Continuar»; Saturday's class and the exercises after it. */
export const CourseFirst: Story = { name: "Course first" };

/** A student who has just arrived: choosing what to study, no «Después», no streak yet and nothing in the statistics. */
export const NothingYet: Story = {
  name: "Nothing yet",
  args: {
    dashboard: {
      ...DASHBOARD,
      continueStudying: undefined,
      recentActivity: [],
      stats: {
        week: range([0, 0, 0, 0, 0], []),
        month: range([0, 0, 0, 0, 0], []),
        year: range([0, 0, 0, 0, 0], []),
        all: range([0, 0, 0, 0, 0], []),
      },
    },
    nextClass: null,
    classExercises: null,
    goal: { streak: { days: 0, studiedToday: false }, minutesToday: 0, goalMinutes: 20, percent: 0 },
  },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { buildPlatformNavGroups } from "@/constants/platform/nav-items.const";
import { platformRoutes, staffRoutes, teacherRoutes } from "@/lib/platform-routes";
import { PlatformNav } from "./platform-nav.comp";

/** The address a story stands on, as Storybook's router reports it to `usePathname`. */
const at = (pathname: string) => ({ nextjs: { navigation: { pathname } } });

const meta = {
  title: "platform/sections/shell/PlatformNav",
  component: PlatformNav,
  parameters: {
    ...at(platformRoutes.chapterDetail("48120517", 2)),
    docs: {
      description: {
        component: `
The links of the top bar. The shell composes the groups on the server with
\`buildPlatformNavGroups(roles)\` — ONE menu, the widest role's: staff over
teacher, teacher over student — and this only renders them and lights the
current one: the item whose \`href\` is the longest prefix of the address, so
\`/profesor\` and \`/profesor/alumnos\` never light up together. The stories
pass the groups the shell would build for each role, and set the address
through Storybook's router.

In the app it sits in the shell's white bar, next to the wordmark; the frame
here stands in for that bar, because a hovered item takes the page's grey and
on the grey canvas it would not show.

Source: \`components/platform/sections/shell/platform-nav.comp.tsx\`.
Reference page: [Components › PlatformNav](/components/platform/sections/shell/platform-nav) in the docs site.
`,
      },
    },
  },
  args: { groups: buildPlatformNavGroups({ isTeacher: false, isStaff: false }) },
  argTypes: {
    groups: {
      control: "object",
      description: "`PlatformNavGroup[]`, composed by role in the shell: `{ label?, items: { label, href }[] }[]`.",
    },
  },
  decorators: [
    // The shell's bar (platform-shell.section.css): white over the page's grey, closed by its hairline.
    (Story) => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "var(--platform-space-3) var(--platform-space-6)",
          background: "var(--platform-surface)",
          boxShadow: "var(--platform-shadow-bar)",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlatformNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A student's menu, on a chapter of a course: «Mis cursos» is lit, because `/cursos` prefixes the address. */
export const Student: Story = {};

/** A teacher's menu, on one student's page: «Mis alumnos» is lit and «Panel del profesor» is not, though `/profesor` prefixes the address too. */
export const Teacher: Story = {
  args: { groups: buildPlatformNavGroups({ isTeacher: true, isStaff: false }) },
  parameters: at(teacherRoutes.studentDetail("1042")),
};

/** A staff member's menu, on a course's «Temario»: «Cursos» is lit. Staff rules over teacher, so nothing else is added. */
export const Staff: Story = {
  args: { groups: buildPlatformNavGroups({ isTeacher: true, isStaff: true }) },
  parameters: at(staffRoutes.courseSyllabus("4812")),
};

/** On a page that is in no menu, the account's «Ajustes» (reached from the avatar): nothing is lit. */
export const NothingActive: Story = {
  parameters: at(platformRoutes.settings),
};

/** The student's menu with «Ejercicios» on and a teacher who gave them a series, on one of its exercises: the item after «Mis cursos» is lit. */
export const StudentWithExercises: Story = {
  args: {
    groups: buildPlatformNavGroups(
      { isTeacher: false, isStaff: false, hasExerciseSource: true },
      { play: false, analysisBoard: false, trainer: false, exercises: "withTeacher" },
    ),
  },
  parameters: at(platformRoutes.exerciseSeriesItem("serie-1", 2)),
};

/** The student's menu with «Jugar» and «Herramientas» switched on, on the analysis board: the dropdown's trigger is lit. */
export const WithTools: Story = {
  args: {
    groups: buildPlatformNavGroups(
      { isTeacher: false, isStaff: false },
      { play: true, analysisBoard: true, trainer: false, exercises: false },
    ),
  },
  parameters: at(platformRoutes.analysisBoard()),
};

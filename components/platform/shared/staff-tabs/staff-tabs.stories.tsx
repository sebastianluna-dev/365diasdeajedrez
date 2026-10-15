import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { staffRoutes } from "@/lib/platform-routes";
import { StaffTabs } from "./staff-tabs.comp";
import { chapterTabs, courseTabs, studentTabs } from "./staff-tabs.const";

const COURSE_ID = "4812";
const CHAPTER_ID = "3";

/** The address a story stands on, as Storybook's router reports it to `usePathname`. */
const at = (pathname: string) => ({ nextjs: { navigation: { pathname } } });

const meta = {
  title: "platform/shared/StaffTabs",
  component: StaffTabs,
  parameters: {
    ...at(staffRoutes.courseSyllabus(COURSE_ID)),
    docs: {
      description: {
        component: `
The tabs of a record of the administration panel — a course, a chapter, and since 2026-10-15 a student —, and they are PAGES: each tab is a
link with its own URL, so it can be shared, the back button works and each
page loads only its own data. The tabs come from \`courseTabs()\`,
\`chapterTabs()\` and \`studentTabs()\` in \`staff-tabs.const.ts\`, as the record's header builds
them; the current one is the tab whose \`href\` IS the address, read with
\`usePathname\` because the header lives in the record's layout, which is not
rendered again between its pages. The stories set the address through
Storybook's router.

Source: \`components/platform/shared/staff-tabs/staff-tabs.comp.tsx\`.
Reference page: [Components › StaffTabs](/components/platform/shared/staff-tabs) in the docs site.
`,
      },
    },
  },
  args: { tabs: courseTabs({ courseId: COURSE_ID, chapterCount: 6, gameCount: 148 }) },
  argTypes: {
    tabs: {
      control: "object",
      description: "`StaffTab[]`: `{ label, href, count? }[]`, from `courseTabs()` or `chapterTabs()`.",
    },
  },
  decorators: [
    // The page's column in the shell (platform-shell.section.css), where the record's header draws them.
    (Story) => (
      <div style={{ maxWidth: 1040 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StaffTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A course's three pages, on «Temario»: the accent's underline, and its count in the accent's tint. */
export const Course: Story = {};

/** A chapter's three pages, on «Capítulo», the one without a count. */
export const Chapter: Story = {
  args: { tabs: chapterTabs({ courseId: COURSE_ID, chapterId: CHAPTER_ID, lessonCount: 4, gameCount: 12 }) },
  parameters: at(staffRoutes.chapterDetail(COURSE_ID, CHAPTER_ID)),
};

/** A course just created, on «Curso»: no chapters and no games, and the counts say 0 instead of going away. */
export const EmptyCourse: Story = {
  args: { tabs: courseTabs({ courseId: COURSE_ID, chapterCount: 0, gameCount: 0 }) },
  parameters: at(staffRoutes.courseDetail(COURSE_ID)),
};

/** A student's record: «Cuenta» and «Pagos y clases», the current one from the address. */
export const Student: Story = {
  args: { tabs: studentTabs("a1000000-0000-4000-8000-000000000001") },
  parameters: at(staffRoutes.studentPayments("a1000000-0000-4000-8000-000000000001")),
};

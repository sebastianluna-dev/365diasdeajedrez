import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { StudentSharePanel } from "./student-share-panel.comp";
import type { StudentShareOption, StudentShareRow } from "./student-share-panel.types";

const STUDENTS: StudentShareOption[] = [
  { id: "u-d", displayName: "Alumno Demo", email: "alumno.demo@365diasdeajedrez.com" },
  { id: "u-v", displayName: "Valentina Cruz", email: "valentina.demo@365diasdeajedrez.com" },
  { id: "u-m", displayName: "Mateo Ríos", email: "mateo.rios@ejemplo.com" },
];

const SHARES: StudentShareRow[] = [
  {
    userId: "u-d",
    displayName: "Alumno Demo",
    email: "alumno.demo@365diasdeajedrez.com",
    sharedAtLabel: "12 de octubre de 2026",
  },
];

const meta = {
  title: "platform/shared/StudentSharePanel",
  component: StudentSharePanel,
  parameters: {
    docs: {
      description: {
        component: `
Who a teacher's material reaches — a collection of studies or a series of
exercises —: who already has it, with «Quitar» on each, and a select of the
teacher's students who do not, with «Compartir». A Server Component with two
forms against the actions it is given; the stories pass stubs.

Source: \`components/platform/shared/student-share-panel/student-share-panel.comp.tsx\`.
Reference page: [Components › StudentSharePanel](/components/platform/shared/student-share-panel) in the docs site.
`,
      },
    },
  },
  args: {
    subject: "series",
    shares: SHARES,
    students: STUDENTS,
    share: fn(async () => undefined),
    unshare: fn(async () => undefined),
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 720, padding: 24, background: "var(--platform-bg)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StudentSharePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A series given to one of three students: his row with «Quitar», and the other two to choose from. */
export const Series: Story = {};

/** The same panel for a collection of studies: only the heading and the line under it change. */
export const Collection: Story = { args: { subject: "collection" } };

/** Given to nobody yet. */
export const NobodyYet: Story = { name: "Nobody yet", args: { shares: [] } };

/** Every student already has it: no form, and the line says so. */
export const EveryoneHasIt: Story = {
  name: "Everyone has it",
  args: {
    shares: STUDENTS.map((student) => ({ userId: student.id, ...student, sharedAtLabel: "12 de octubre de 2026" })),
  },
};

/** A teacher with no assigned students: nothing to give it to. */
export const NoStudents: Story = { name: "No students", args: { shares: [], students: [] } };

/** In an aside's 280px column: each student on two lines and the form stacked. */
export const Compact: Story = {
  args: { layout: "compact", subject: "collection" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 280 }}>
        <Story />
      </div>
    ),
  ],
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { popupFormDone } from "@/services/shared/form-state";
import type { SchedulableStudent } from "@/services/staff-classes/staff-classes.types";
import { AddStudentsButton } from "./add-students-popup.comp";

const STUDENTS: SchedulableStudent[] = [
  {
    id: "u-d",
    displayName: "Alumno Demo",
    email: "alumno.demo@365diasdeajedrez.com",
    teacherId: "t-1",
    teacherName: "GM Profesor Demo",
    toSchedule: 2,
    oldestPaymentLabel: "pago del jue 1 oct",
    hasPayments: true,
  },
  {
    id: "u-m",
    displayName: "Mateo Ríos",
    email: "mateo.rios@ejemplo.com",
    teacherId: "t-1",
    teacherName: "GM Profesor Demo",
    toSchedule: 1,
    oldestPaymentLabel: "pago del lun 12 oct",
    hasPayments: true,
  },
  {
    id: "u-v",
    displayName: "Valentina Cruz",
    email: "valentina.demo@365diasdeajedrez.com",
    teacherId: "t-1",
    teacherName: "GM Profesor Demo",
    toSchedule: 0,
    oldestPaymentLabel: null,
    hasPayments: true,
  },
  {
    id: "u-l",
    displayName: "Lucía Herrera",
    email: "lucia.herrera@ejemplo.com",
    teacherId: null,
    teacherName: null,
    toSchedule: 0,
    oldestPaymentLabel: null,
    hasPayments: false,
  },
];

const meta = {
  title: "platform/sections/staff/classes/AddStudentsPopup",
  component: AddStudentsButton,
  parameters: {
    docs: {
      description: {
        component: `
«Agregar alumnos»: the students as cards, the ones already in the class
greyed, and how each chosen one enters (D6). A student not assigned to the
teacher is said, not refused. The action comes as a prop; the stories pass
a stub.

Source: \`components/platform/sections/staff/classes/add-students-popup/add-students-popup.comp.tsx\`.
Reference page: [Components › AddStudentsPopup](/components/platform/sections/staff/classes/add-students-popup) in the docs site.
`,
      },
    },
  },
  args: {
    classId: "c5",
    classTitle: "Taller de finales de torre",
    seatsFree: 2,
    seatedIds: ["u-d", "u-m"],
    students: STUDENTS,
    teacher: { id: "t-1", displayName: "GM Profesor Demo" },
    addClassParticipants: async () => popupFormDone("participantsAdded", [1]),
  },
  argTypes: { students: { control: "object" } },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AddStudentsButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "Agregar alumnos" }));
};

/** Open on the workshop: two seats free, two students already in it, greyed. */
export const Open: Story = { play: open };

/** No seat free: the button of the form waits. */
export const Full: Story = { args: { seatsFree: 0 }, play: open };

/** Lucía chosen: she has no teacher, so the line says she will see her name here and not her record. */
export const NotAssigned: Story = {
  name: "Not assigned",
  play: async ({ canvasElement }) => {
    await open({ canvasElement });
    const dialog = canvasElement.querySelector("dialog");
    if (dialog) await userEvent.click(within(dialog).getByRole("checkbox", { name: /Lucía Herrera/ }));
  },
};

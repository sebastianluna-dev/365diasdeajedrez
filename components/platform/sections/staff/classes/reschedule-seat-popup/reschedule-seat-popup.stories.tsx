import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import { popupFormDone } from "@/services/shared/form-state";
import { RescheduleSeatButton } from "./reschedule-seat-popup.comp";

const WORKSHOP = {
  classId: "c5",
  title: "Taller de finales de torre",
  startIso: cdmx("2026-10-17", "10:00").toISOString(),
  durationMin: 90,
  teacherName: "GM Profesor Demo",
  seated: 4,
  capacity: 6,
};

const meta = {
  title: "platform/sections/staff/classes/RescheduleSeatPopup",
  component: RescheduleSeatButton,
  parameters: {
    docs: {
      description: {
        component: `
«Reprogramar la clase de …» (ADM-10): a no-show's seat goes to a new class,
to a group class with a seat free, or back to its payment, keeping its
coverage. The action comes as a prop; the stories pass a stub.

Source: \`components/platform/sections/staff/classes/reschedule-seat-popup/reschedule-seat-popup.comp.tsx\`.
Reference page: [Components › RescheduleSeatPopup](/components/platform/sections/staff/classes/reschedule-seat-popup) in the docs site.
`,
      },
    },
  },
  args: {
    classId: "c4",
    student: { id: "u-v", displayName: "Valentina Cruz" },
    context: "Faltó el mié 14 oct · es la clase 4 de 4 de su pago del mar 15 sep · Profesor: GM Profesor Demo",
    startIso: cdmx("2026-10-14", "19:00").toISOString(),
    durationMin: 60,
    teacher: { id: "t-1", displayName: "GM Profesor Demo", isActive: true },
    teachers: [{ id: "t-1", displayName: "GM Profesor Demo" }],
    groupClasses: [WORKSHOP],
    hasPayment: true,
    timeZone: CLASSES_TIME_ZONE,
    nowIso: CLASSES_NOW.toISOString(),
    rescheduleStudentSeat: async () => popupFormDone("seatRescheduled", [29_900_000, 60]),
  },
  argTypes: { groupClasses: { control: "object" }, teacher: { control: "object" } },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RescheduleSeatButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "Reprogramar" }));
};

const choose = (name: RegExp) => async (context: { canvasElement: HTMLElement }) => {
  await open(context);
  const dialog = context.canvasElement.querySelector("dialog");
  if (dialog) await userEvent.click(within(dialog).getByRole("radio", { name }));
};

/** «En una clase nueva», on the missed class's day and hour. */
export const NewClass: Story = { name: "New class", play: open };

/** The old teacher was deactivated: the form asks for one. */
export const NewClassInactiveTeacher: Story = {
  name: "New class, inactive teacher",
  args: { teacher: { id: "t-0", displayName: "MI Viejo Profesor", isActive: false } },
  play: open,
};

/** «En una clase grupal»: the workshop with its seats free. */
export const Group: Story = { play: choose(/En una clase grupal/) };

/** «Dejarla por programar»: the seat goes back to its payment (D4). */
export const Later: Story = { play: choose(/Dejarla por programar/) };

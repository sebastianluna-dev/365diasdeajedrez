import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import { popupFormDone, type PopupFormState } from "@/services/shared/form-state";
import type { OpenGroupClassOption } from "@/services/staff-payments/staff-payments.types";
import { ScheduleSeatPopup } from "./schedule-seat-popup.comp";

const TEACHERS = [
  { id: "t-1", displayName: "GM Profesor Demo" },
  { id: "t-2", displayName: "MI Ana Torres" },
];

const GROUPS: OpenGroupClassOption[] = [
  {
    classId: "c5",
    title: "Taller de finales de torre",
    startIso: cdmx("2026-10-17", "10:00").toISOString(),
    durationMin: 90,
    teacherName: "GM Profesor Demo",
    seated: 4,
    capacity: 6,
  },
];

/** A stub that never writes: the popup closes as if it had. */
const scheduleSeat = async () =>
  popupFormDone("seatScheduled", [Math.round(cdmx("2026-10-21", "12:00").getTime() / 60_000), 60]);

const meta = {
  title: "platform/shared/ScheduleSeatPopup",
  component: ScheduleSeatPopup,
  parameters: {
    docs: {
      description: {
        component: `
«Programar una clase de …» (ADM-6): a paid class without a date gets one, in
a new individual class or in a group class with a seat free. The server
action comes as a prop; the stories pass a stub.

Source: \`components/platform/shared/schedule-seat-popup/schedule-seat-popup.comp.tsx\`.
Reference page: [Components › ScheduleSeatPopup](/components/platform/shared/schedule-seat-popup) in the docs site.
`,
      },
    },
  },
  args: {
    paymentId: "pay-1",
    studentName: "Alumno Demo",
    seatLabel: "Clase 4 de 4 del pago del jue 1 oct · Profesor: GM Profesor Demo",
    teachers: TEACHERS,
    rhythm: { teacherId: "t-1", firstDate: "2026-10-21", time: "12:00", durationMin: 60 },
    groupClasses: [],
    timeZone: CLASSES_TIME_ZONE,
    nowIso: CLASSES_NOW.toISOString(),
    scheduleSeat,
  },
  argTypes: { groupClasses: { control: "object" }, rhythm: { control: "object" } },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ScheduleSeatPopup>;

export default meta;
type Story = StoryObj<typeof meta>;

const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "Programar" }));
};

/** Open on «En una clase nueva», filled with the student's rhythm: the line says when, in the academy's zone. */
export const Open: Story = { play: open };

/** Without a group class with a seat free: the second choice is offered and cannot be chosen. */
export const GroupDisabled: Story = { name: "Group disabled", play: open };

/** With a group class to go to: the second choice lists it with its seats. */
export const GroupAvailable: Story = {
  name: "Group available",
  args: { groupClasses: GROUPS },
  play: async ({ canvasElement }) => {
    await open({ canvasElement });
    const dialog = canvasElement.querySelector("dialog");
    if (dialog) await userEvent.click(within(dialog).getByRole("radio", { name: /En una clase grupal/ }));
  },
};

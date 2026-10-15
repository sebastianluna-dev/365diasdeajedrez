import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import { popupFormDone } from "@/services/shared/form-state";
import type { StaffSeatView } from "@/services/staff-classes/staff-classes.types";
import { ClassSeatRow } from "./class-seat-row.comp";

const CLASS = {
  id: "c5",
  title: "Taller de finales de torre",
  startIso: cdmx("2026-10-17", "10:00").toISOString(),
  durationMin: 90,
  timeZone: CLASSES_TIME_ZONE,
  nowIso: CLASSES_NOW.toISOString(),
  teacher: { id: "t-1", displayName: "GM Profesor Demo", isActive: true },
};

const DONE_CLASS = {
  ...CLASS,
  id: "c4",
  title: "Clase de Valentina Cruz",
  startIso: cdmx("2026-10-14", "19:00").toISOString(),
  durationMin: 60,
};

const NONE = { remove: false, register: false, changeAttendance: false, moveSeat: false };

function seat(extra: Partial<StaffSeatView> = {}): StaffSeatView {
  return {
    userId: "u-d",
    displayName: "Alumno Demo",
    email: "alumno.demo@365diasdeajedrez.com",
    coverage: { kind: "paid", paymentId: "p-d", label: "Pago del jue 1 oct · clase 3 de 4" },
    attended: null,
    mark: { attended: null },
    markedByName: null,
    isAssigned: true,
    moved: false,
    can: { ...NONE, remove: true },
    moveContext: "",
    ...extra,
  };
}

const stubs = {
  removeClassParticipant: async () => undefined,
  changeAttendanceAsStaff: async () => popupFormDone("attendanceChanged", ["u-v"]),
  rescheduleStudentSeat: async () => popupFormDone("seatRescheduled", [29_900_000, 60]),
  registerPayment: async () => popupFormDone("paymentRegistered", [1, 1, 0]),
  loadPaymentContext: async () => null,
  loadTeacherBusy: async () => [],
};

const meta = {
  title: "platform/sections/staff/classes/ClassSeatRow",
  component: ClassSeatRow,
  parameters: {
    docs: {
      description: {
        component: `
One seat of a class in the staff's record: the student, how the seat is
covered, the mark, and the words at its end by what the phase allows —
«Registrar», «Quitar», «Cambiar», «Reprogramar». The actions come as props;
the stories pass stubs.

Source: \`components/platform/sections/staff/classes/class-seat-row/class-seat-row.comp.tsx\`.
Reference page: [Components › ClassSeatRow](/components/platform/sections/staff/classes/class-seat-row) in the docs site.
`,
      },
    },
  },
  args: {
    seat: seat(),
    classDetail: CLASS,
    teachers: [{ id: "t-1", displayName: "GM Profesor Demo" }],
    groupClasses: [],
    staffName: "Staff Demo",
    actions: stubs,
  },
  argTypes: { seat: { control: "object" }, classDetail: { control: "object" } },
  decorators: [
    (Story) => (
      <div className="platform-theme platform-card" style={{ maxWidth: 820 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClassSeatRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A paid seat of a class ahead: «Pago del jue 1 oct · clase 3 de 4», and «Quitar». */
export const Paid: Story = {};

/** A seat without a payment: «Sin pago», «Registrar» and «Quitar». */
export const Unpaid: Story = {
  args: {
    seat: seat({
      userId: "u-l",
      displayName: "Lucía Herrera",
      email: "lucia.herrera@ejemplo.com",
      coverage: { kind: "unpaid", label: "Sin pago" },
      isAssigned: false,
      can: { ...NONE, register: true, remove: true },
    }),
  },
};

/** A free seat: «Gratis», charged to nobody. */
export const Free: Story = {
  args: {
    seat: seat({
      userId: "u-a",
      displayName: "Andrea López",
      email: "andrea.lopez@ejemplo.com",
      coverage: { kind: "free", label: "Gratis" },
    }),
  },
};

/** A no-show of a finished class: «Faltó», who marked, and «Cambiar» and «Reprogramar». */
export const Absent: Story = {
  args: {
    classDetail: DONE_CLASS,
    seat: seat({
      userId: "u-v",
      displayName: "Valentina Cruz",
      email: "valentina.demo@365diasdeajedrez.com",
      coverage: { kind: "paid", paymentId: "p-v", label: "Pago del mar 15 sep · clase 4 de 4" },
      attended: false,
      mark: { attended: false, markedLine: "Marcó GM Profesor Demo · mié 14 oct, 20:12" },
      markedByName: "GM Profesor Demo",
      can: { ...NONE, changeAttendance: true, moveSeat: true },
      moveContext: "Faltó el mié 14 oct · es la clase 4 de 4 de su pago del mar 15 sep · Profesor: GM Profesor Demo",
    }),
  },
};

/** The seat was given another date: history, faded, with the link to the new class. */
export const Moved: Story = {
  args: {
    classDetail: DONE_CLASS,
    seat: seat({
      userId: "u-v",
      displayName: "Valentina Cruz",
      email: "valentina.demo@365diasdeajedrez.com",
      coverage: { kind: "paid", paymentId: "p-v", label: "Pago del mar 15 sep · clase 4 de 4" },
      attended: false,
      mark: {
        attended: false,
        markedLine: "Marcó GM Profesor Demo · mié 14 oct, 20:12",
        moved: { label: "Faltó · reprogramada al vie 16 oct", href: "/administracion/clases/c-new" },
      },
      markedByName: "GM Profesor Demo",
      moved: true,
      can: NONE,
    }),
  },
};

/** The staff changed the mark after a report: the second line with its reason; only «Cambiar» remains. */
export const ChangedByStaff: Story = {
  name: "Changed by staff",
  args: {
    classDetail: DONE_CLASS,
    seat: seat({
      userId: "u-v",
      displayName: "Valentina Cruz",
      email: "valentina.demo@365diasdeajedrez.com",
      coverage: { kind: "paid", paymentId: "p-v", label: "Pago del mar 15 sep · clase 4 de 4" },
      attended: true,
      mark: {
        attended: true,
        markedLine: "Marcó GM Profesor Demo · mié 14 oct, 20:12",
        changedLine:
          "Cambió Staff Demo · jue 15 oct, 10:05 · «Faltó» → «Asistió»: «Estuvo conectada; se le cayó el audio.»",
      },
      markedByName: "Staff Demo",
      can: { ...NONE, changeAttendance: true },
    }),
  },
};

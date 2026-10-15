import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { CLASS_PHASE } from "@/constants/platform/class-codes.const";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import { popupFormDone, popupFormError } from "@/services/shared/form-state";
import type { PaymentContext } from "@/services/staff-payments/staff-payments.types";
import { RegisterPaymentButton } from "./register-payment-popup.comp";

const TEACHERS = [
  { id: "t-1", displayName: "GM Profesor Demo" },
  { id: "t-2", displayName: "MI Ana Torres" },
];

const VALENTINA: PaymentContext = {
  student: {
    id: "u-v",
    displayName: "Valentina Cruz",
    email: "valentina.demo@365diasdeajedrez.com",
    teacherId: "t-1",
    teacherName: "GM Profesor Demo",
  },
  lastPayment: {
    paidOnLabel: "mar 15 sep 2026",
    classCount: 4,
    amount: "1400.00",
    currencyCode: "MXN",
    amountLabel: "$1,400.00 MXN",
  },
  rhythm: { teacherId: "t-1", firstDate: "2026-10-21", time: "19:00", durationMin: 60 },
  lastMeetingUrl: "https://zoom.us/j/33333333333",
  balanceLine: "Le queda 1 clase (hoy 19:00)",
  unpaidSeats: [],
  studentBusy: [],
  teacherBusy: [
    {
      title: "Plan de aperturas con blancas",
      startIso: cdmx("2026-11-04", "19:00").toISOString(),
      endIso: cdmx("2026-11-04", "20:00").toISOString(),
    },
  ],
};

const LUCIA: PaymentContext = {
  ...VALENTINA,
  student: {
    id: "u-l",
    displayName: "Lucía Herrera",
    email: "lucia.demo@365diasdeajedrez.com",
    teacherId: null,
    teacherName: null,
  },
  lastPayment: null,
  rhythm: { teacherId: null, firstDate: "2026-10-15", time: "12:00", durationMin: 60 },
  lastMeetingUrl: null,
  balanceLine: "Sin clases pagadas",
  unpaidSeats: [
    {
      classId: "c5",
      href: "/administracion/clases/c5",
      title: "Taller de finales de torre",
      startIso: cdmx("2026-10-17", "10:00").toISOString(),
      durationMin: 90,
      phase: CLASS_PHASE.UPCOMING,
    },
  ],
  teacherBusy: [],
};

const CONTEXTS: Record<string, PaymentContext> = { "u-v": VALENTINA, "u-l": LUCIA };

const stubs = {
  registerPayment: async () => popupFormDone("paymentRegistered", [4, 3, 1]),
  updatePayment: async () => popupFormDone("paymentUpdated"),
  loadPaymentContext: async (studentId: string) => CONTEXTS[studentId] ?? null,
  loadTeacherBusy: async () => VALENTINA.teacherBusy,
};

const meta = {
  title: "platform/shared/RegisterPaymentPopup",
  component: RegisterPaymentButton,
  parameters: {
    docs: {
      description: {
        component: `
«Registrar pago» (ADM-2): the student, the payment, the «Sin pago» classes it
covers, and the classes it dates — a weekly rhythm filled from the student's
last class, each row with its day, its hour and its duration, or left «por
programar», or taken to a group class —, with the line that sums it up at
the foot. With \`payment\`, «Editar pago»: the payment's own fields. The
actions come as props; the stories pass stubs, and the context of a student
is read through one of them.

Source: \`components/platform/shared/register-payment-popup/register-payment-popup.comp.tsx\`.
Reference page: [Components › RegisterPaymentPopup](/components/platform/shared/register-payment-popup) in the docs site.
`,
      },
    },
  },
  args: {
    fixedStudent: { id: "u-v", displayName: "Valentina Cruz", email: "valentina.demo@365diasdeajedrez.com" },
    teachers: TEACHERS,
    groupClasses: [],
    timeZone: CLASSES_TIME_ZONE,
    nowIso: CLASSES_NOW.toISOString(),
    ...stubs,
  },
  argTypes: { fixedStudent: { control: "object" }, payment: { control: "object" } },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RegisterPaymentButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: /Registrar pago|Registrar|Editar pago/ }));
};

/** Open on Valentina: her context line, «Repetir ese pago», the rhythm from her last class and four rows, one per class. */
export const Open: Story = { play: open };

/** The student fixed by the record it opens from: initials, name and email, no select. */
export const WithFixedStudent: Story = { name: "With fixed student", play: open };

/** Lucía, with a class «Sin pago» to cover: the cards under «Clases sin pago que cubre», and no teacher of her own. */
export const CoveringUnpaid: Story = {
  name: "Covering unpaid",
  args: {
    fixedStudent: { id: "u-l", displayName: "Lucía Herrera", email: "lucia.demo@365diasdeajedrez.com" },
    preset: { cover: ["c5"] },
  },
  play: open,
};

/** «Dejarlas por programar»: no rows, and the line says they all stay to schedule. */
export const LaterOnly: Story = {
  name: "Later only",
  play: async ({ canvasElement }) => {
    await open({ canvasElement });
    const dialog = canvasElement.querySelector("dialog");
    if (dialog) await userEvent.click(within(dialog).getByRole("radio", { name: /Dejarlas por programar/ }));
  },
};

/** «Editar pago»: the payment's own fields, with the least it may cover. */
export const EditMode: Story = {
  name: "Edit mode",
  args: {
    label: "Editar pago",
    payment: {
      id: "pay-1",
      amount: "1400.00",
      currencyCode: "MXN",
      paidOnIso: "2026-10-01T00:00:00.000Z",
      classCount: 4,
      reference: "Transferencia 8841",
      note: null,
      minClassCount: 3,
    },
  },
  play: open,
};

/** Without a fixed student: the select of students, grouped by their teacher. */
export const StudentWithoutTeacher: Story = {
  name: "Student without teacher",
  args: {
    fixedStudent: undefined,
    students: [
      { label: "Alumnos de GM Profesor Demo", options: [{ value: "u-v", label: "Valentina Cruz" }] },
      { label: "Sin profesor asignado", options: [{ value: "u-l", label: "Lucía Herrera" }] },
    ],
  },
  play: open,
};

/** The server refused: the error under its field, and everything typed still there. */
export const WithServerError: Story = {
  name: "With server error",
  args: {
    registerPayment: async () =>
      popupFormError(
        { classCount: { code: "tooManySeats", args: { total: 5, classCount: 4 } } },
        { amount: "1400.00", currency: "MXN", classCount: "4", reference: "Transferencia 9120", when: "now" },
      ),
  },
  play: async ({ canvasElement }) => {
    await open({ canvasElement });
    const dialog = canvasElement.querySelector("dialog");
    if (!dialog) return;
    await userEvent.type(within(dialog).getByLabelText("Importe cobrado"), "1400.00");
    await userEvent.click(within(dialog).getByRole("button", { name: "Registrar pago" }));
  },
};

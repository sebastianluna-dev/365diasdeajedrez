import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { CLASS_PHASE } from "@/constants/platform/class-codes.const";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import { popupFormDone, type PopupFormState } from "@/services/shared/form-state";
import type { PaymentSeatView, StaffPaymentView } from "@/services/staff-payments/staff-payments.types";
import { PaymentCard } from "./payment-card.comp";

function seat(
  classId: string,
  ordinal: number,
  title: string,
  date: string,
  time: string,
  phase: PaymentSeatView["phase"],
  extra: Partial<PaymentSeatView> = {},
): PaymentSeatView {
  return {
    classId,
    href: `/administracion/clases/${classId}`,
    ordinal,
    title,
    startIso: cdmx(date, time).toISOString(),
    durationMin: 60,
    phase,
    attended: null,
    isGroup: false,
    ...extra,
  };
}

const OCTOBER: StaffPaymentView = {
  id: "pay-1",
  paidOnIso: "2026-10-01T00:00:00.000Z",
  paidOnLabel: "jue 1 oct 2026",
  amount: "1400.00",
  currencyCode: "MXN",
  amountLabel: "$1,400.00 MXN",
  perClassLabel: "$350.00 por clase",
  classCount: 4,
  reference: "Transferencia 8841",
  note: null,
  recordedByName: "Staff Demo",
  seats: [
    seat("c1", 1, "Ataques al rey en el centro", "2026-10-07", "12:00", CLASS_PHASE.DONE, { attended: true }),
    seat("c2", 2, "Repaso de la Najdorf: tus dudas", "2026-10-14", "12:00", CLASS_PHASE.OPEN),
    seat("c5", 3, "Taller de finales de torre", "2026-10-17", "10:00", CLASS_PHASE.UPCOMING, {
      durationMin: 90,
      isGroup: true,
    }),
  ],
  taken: 1,
  scheduled: 2,
  toSchedule: 1,
  returned: 0,
  allTaken: false,
  canDelete: false,
  deleteReason: "Este pago ya cubre clases dadas: corrígelo con «Editar pago».",
  seatsLeftUnpaid: 3,
  minClassCount: 3,
};

const stubs = {
  scheduleSeat: async () => popupFormDone("seatScheduled", [0, 60]),
  deletePayment: async () => undefined,
  updatePayment: async () => popupFormDone("paymentUpdated"),
  registerPayment: async () => popupFormDone("paymentRegistered", [4, 3, 1]),
  loadPaymentContext: async () => null,
  loadTeacherBusy: async () => [],
};

const meta = {
  title: "platform/sections/staff/payments/PaymentCard",
  component: PaymentCard,
  parameters: {
    docs: {
      description: {
        component: `
One payment of a student: what it was, and every class it covers in order,
«clase n de m», with the ones still to date as rows that offer «Programar».
A payment every class of which was given opens folded; the «…» menu edits
it or deletes it, and says why it cannot be deleted.

Source: \`components/platform/sections/staff/payments/payment-card/payment-card.comp.tsx\`.
Reference page: [Components › PaymentCard](/components/platform/sections/staff/payments/payment-card) in the docs site.
`,
      },
    },
  },
  args: {
    payment: OCTOBER,
    student: { id: "u-demo", displayName: "Alumno Demo", teacherName: "GM Profesor Demo" },
    teachers: [{ id: "t-1", displayName: "GM Profesor Demo" }],
    groupClasses: [],
    rhythm: { teacherId: "t-1", firstDate: "2026-10-21", time: "12:00", durationMin: 60 },
    timeZone: CLASSES_TIME_ZONE,
    nowIso: CLASSES_NOW.toISOString(),
    actions: stubs,
  },
  argTypes: { payment: { control: "object" } },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 820, padding: 16, background: "var(--platform-bg)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PaymentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The October payment: one class taken, two dated, one to schedule with its «Programar». */
export const Open: Story = {};

/** Every class given: the card opens folded on «Todas tomadas». */
export const AllTaken: Story = {
  name: "All taken",
  args: {
    payment: {
      ...OCTOBER,
      id: "pay-0",
      paidOnLabel: "jue 3 sep 2026",
      reference: null,
      seats: [15, 16, 17, 18].map((day, index) =>
        seat(
          `c${day}`,
          index + 1,
          ["La Siciliana: ideas", "Estructuras de la Siciliana", "Tácticas en la apertura", "Finales elementales"][
            index
          ]!,
          `2026-09-${String(4 + index * 7).padStart(2, "0")}`,
          "12:00",
          CLASS_PHASE.DONE,
          { attended: true },
        ),
      ),
      taken: 4,
      scheduled: 0,
      toSchedule: 0,
      allTaken: true,
      seatsLeftUnpaid: 4,
      minClassCount: 4,
    },
  },
};

/** A class of the payment was cancelled: the seat went back, and a row waits to be dated again. */
export const WithReturned: Story = {
  name: "With returned",
  args: {
    payment: {
      ...OCTOBER,
      seats: [
        seat("c9", 1, "Finales de peones", "2026-10-05", "17:00", CLASS_PHASE.DONE, { attended: false }),
        seat("c7", 0, "Táctica de la semana", "2026-10-09", "18:00", CLASS_PHASE.CANCELLED),
        seat("c10", 2, "Medio juego: planes", "2026-10-08", "17:00", CLASS_PHASE.DONE, { attended: true }),
      ],
      taken: 2,
      scheduled: 0,
      toSchedule: 2,
      returned: 1,
    },
  },
};

/** A no-show whose seat the staff moved: the old row stays as history, the new one says what it replaces. */
export const WithMovedSeat: Story = {
  name: "With moved seat",
  args: {
    payment: {
      ...OCTOBER,
      seats: [
        seat("c11", 0, "Estructuras de peones", "2026-10-02", "19:00", CLASS_PHASE.DONE, {
          attended: false,
          moved: { toClassId: "c12", label: "Faltó · reprogramada al vie 9 oct" },
        }),
        seat("c12", 1, "Clase de Valentina Cruz", "2026-10-09", "19:00", CLASS_PHASE.DONE, {
          attended: true,
          replacesLabel: "reposición del vie 2 oct",
        }),
      ],
      taken: 1,
      scheduled: 0,
      toSchedule: 3,
    },
  },
};

/** Nothing of it was given yet: «Eliminar pago» is offered. */
export const Deletable: Story = {
  args: {
    payment: {
      ...OCTOBER,
      seats: [seat("c3", 1, "Plan de aperturas con blancas", "2026-10-14", "17:00", CLASS_PHASE.UPCOMING)],
      taken: 0,
      scheduled: 1,
      toSchedule: 3,
      canDelete: true,
      deleteReason: undefined,
      seatsLeftUnpaid: 1,
      minClassCount: 1,
    },
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /Acciones del pago/ }));
  },
};

/** A class of it was given: «Eliminar pago» stays on the menu, greyed, with its reason. */
export const NotDeletable: Story = {
  name: "Not deletable",
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /Acciones del pago/ }));
  },
};

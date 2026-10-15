import { describe, expect, it } from "vitest";
import { CLASS_PHASE, CLASS_STATUS, type ClassStatusCode } from "@/constants/platform/class-codes.const";
import {
  FIXTURE_CLASSES,
  FIXTURE_OTHER_SEATS,
  FIXTURE_PAYMENT,
  FIXTURE_PAYMENT_ID,
  FIXTURE_PAYMENT_SEATS,
  FIXTURE_SECOND_PAYMENT,
} from "@/lib/testing/fixtures/classes";
import {
  isUnpaidSeat,
  paymentSeats,
  planPaymentSeats,
  studentSeatBalance,
  unpaidSeatWhere,
  type SeatRow,
  type UnpaidSeatInput,
} from "./payment-seats";

describe("paymentSeats", () => {
  it("cuenta las tomadas, las programadas y las que faltan por programar", () => {
    const seats = paymentSeats(FIXTURE_PAYMENT, FIXTURE_PAYMENT_SEATS);
    expect(seats).toMatchObject({ taken: 1, scheduled: 2, toSchedule: 1, counting: 3, returned: 0, moved: 0 });
  });

  it("numera «clase n de m» en orden cronológico", () => {
    const { ordinalOf } = paymentSeats(FIXTURE_PAYMENT, FIXTURE_PAYMENT_SEATS);
    expect(ordinalOf[FIXTURE_CLASSES.done.id]).toBe(1);
    expect(ordinalOf[FIXTURE_CLASSES.open.id]).toBe(2);
    expect(ordinalOf[FIXTURE_CLASSES.group.id]).toBe(3);
  });

  it("una falta cuenta: la clase se gastó", () => {
    const seats = paymentSeats(FIXTURE_SECOND_PAYMENT, FIXTURE_SECOND_PAYMENT.seats);
    expect(seats.taken).toBe(2); // the moved-to seat and the plain no-show
    expect(seats.moved).toBe(1);
    expect(seats.ordinalOf["cls-missed-2"]).toBeDefined();
  });

  it("una plaza movida deja de contar y su destino cuenta: el pago no gasta otra", () => {
    const seats = paymentSeats(FIXTURE_SECOND_PAYMENT, FIXTURE_SECOND_PAYMENT.seats);
    expect(seats.ordinalOf["cls-missed"]).toBeUndefined();
    expect(seats.ordinalOf["cls-moved-to"]).toBeDefined();
  });

  it("una clase cancelada devuelve la plaza al pago", () => {
    const seats = paymentSeats(FIXTURE_SECOND_PAYMENT, FIXTURE_SECOND_PAYMENT.seats);
    expect(seats.returned).toBe(1);
    expect(seats.toSchedule).toBe(2); // 4 bought − 2 counting (the moved-to and the no-show)
  });

  it("una plaza gratis o sin pago nunca entra, ni la de otro pago", () => {
    const seats = paymentSeats(FIXTURE_PAYMENT, [
      ...FIXTURE_PAYMENT_SEATS,
      FIXTURE_OTHER_SEATS.free,
      FIXTURE_OTHER_SEATS.unpaid,
      FIXTURE_OTHER_SEATS.missed,
    ]);
    expect(seats.counting).toBe(3);
  });

  it("nunca deja «por programar» en negativo", () => {
    const extra: SeatRow = { ...FIXTURE_PAYMENT_SEATS[0]!, classId: "cls-extra" };
    const seats = paymentSeats({ id: FIXTURE_PAYMENT_ID, classCount: 1 }, [...FIXTURE_PAYMENT_SEATS, extra]);
    expect(seats.toSchedule).toBe(0);
  });
});

describe("studentSeatBalance", () => {
  it("suma lo que queda de cada pago, el más antiguo primero y sin importes", () => {
    const balance = studentSeatBalance([FIXTURE_PAYMENT, FIXTURE_SECOND_PAYMENT]);
    expect(balance).toMatchObject({ left: 5, scheduled: 2, toSchedule: 3 });
    expect(balance.byPayment.map((payment) => payment.paymentId)).toEqual(["pay-sep-15", FIXTURE_PAYMENT_ID]);
    expect(balance.byPayment[1]).toMatchObject({ left: 3, scheduled: 2, toSchedule: 1 });
    expect(JSON.stringify(balance)).not.toMatch(/amount|1400/);
  });

  it("sin pagos, nada queda", () => {
    expect(studentSeatBalance([])).toEqual({ left: 0, scheduled: 0, toSchedule: 0, byPayment: [] });
  });
});

describe("planPaymentSeats", () => {
  it("reparte las clases del pago y deja el resto por programar", () => {
    expect(planPaymentSeats({ classCount: 4, covered: 0, dated: 3, group: 0 })).toEqual({ ok: true, later: 1 });
    expect(planPaymentSeats({ classCount: 4, covered: 1, dated: 2, group: 1 })).toEqual({ ok: true, later: 0 });
  });

  it("rechaza el exceso con el total, para el error del formulario", () => {
    expect(planPaymentSeats({ classCount: 4, covered: 1, dated: 4, group: 0 })).toEqual({ ok: false, total: 5 });
  });
});

describe("isUnpaidSeat y unpaidSeatWhere", () => {
  const cases: { seat: UnpaidSeatInput; unpaid: boolean }[] = [
    {
      seat: { paymentId: null, isFree: false, seatMovedAt: null, classStatusCode: CLASS_STATUS.SCHEDULED },
      unpaid: true,
    },
    {
      seat: { paymentId: "pay", isFree: false, seatMovedAt: null, classStatusCode: CLASS_STATUS.SCHEDULED },
      unpaid: false,
    },
    {
      seat: { paymentId: null, isFree: true, seatMovedAt: null, classStatusCode: CLASS_STATUS.SCHEDULED },
      unpaid: false,
    },
    {
      seat: { paymentId: null, isFree: false, seatMovedAt: new Date(), classStatusCode: CLASS_STATUS.COMPLETED },
      unpaid: false,
    },
    {
      seat: { paymentId: null, isFree: false, seatMovedAt: null, classStatusCode: CLASS_STATUS.CANCELLED },
      unpaid: false,
    },
    {
      seat: { paymentId: null, isFree: false, seatMovedAt: null, classStatusCode: CLASS_STATUS.COMPLETED },
      unpaid: true,
    },
  ];

  /** The `where`, evaluated by hand over a row, so the two spellings of the rule are compared. */
  function matchesWhere(seat: UnpaidSeatInput): boolean {
    const where = unpaidSeatWhere;
    const excluded: ClassStatusCode = where.class.status.code.not;
    return (
      seat.paymentId === where.paymentId &&
      seat.isFree === where.isFree &&
      seat.seatMovedAt === where.seatMovedAt &&
      seat.classStatusCode !== excluded
    );
  }

  it("las dos escrituras de «sin pago» coinciden sobre cada caso", () => {
    for (const { seat, unpaid } of cases) {
      expect(isUnpaidSeat(seat), JSON.stringify(seat)).toBe(unpaid);
      expect(matchesWhere(seat), JSON.stringify(seat)).toBe(unpaid);
    }
  });

  it("también sobre las plazas de la demo", () => {
    const toInput = (seat: SeatRow): UnpaidSeatInput => ({
      paymentId: seat.paymentId,
      isFree: seat.isFree,
      seatMovedAt: seat.seatMovedAt,
      classStatusCode: seat.phase === CLASS_PHASE.CANCELLED ? CLASS_STATUS.CANCELLED : CLASS_STATUS.SCHEDULED,
    });
    expect(isUnpaidSeat(toInput(FIXTURE_OTHER_SEATS.unpaid))).toBe(true);
    expect(isUnpaidSeat(toInput(FIXTURE_OTHER_SEATS.free))).toBe(false);
    expect(isUnpaidSeat(toInput(FIXTURE_OTHER_SEATS.returned))).toBe(false);
    for (const seat of [...FIXTURE_PAYMENT_SEATS, ...Object.values(FIXTURE_OTHER_SEATS)]) {
      expect(isUnpaidSeat(toInput(seat))).toBe(matchesWhere(toInput(seat)));
    }
  });
});

import { describe, expect, it } from "vitest";
import { ACTIVITY_TYPE } from "../constants/platform/activity-codes.const";
import { CLASS_BLOCK_KIND, CLASS_FORMAT, CLASS_PHASE, CLASS_STATUS } from "../constants/platform/class-codes.const";
import { classPhase } from "../services/shared/class-phase";
import { paymentSeats, studentSeatBalance, type SeatRow } from "../services/shared/payment-seats";
import { exerciseBlockError } from "../services/teacher-classes/block-rules";
import { buildClassPayments, buildClassSchedule, CLASS_BLOCKS, DEMO_CLASSMATES } from "./seed-classes";
import { ACTIVITIES, IDS } from "./seed-data";
import { DEMO_EXERCISES } from "./seed-exercises";

// The demo as the rules read it, without a database: the reference instant
// is Wednesday 14 October 2026 at 18:00 UTC, so D is that day in Mexico City
// and 11:40 of D is 17:40 UTC.
const NOW = new Date("2026-10-14T18:00:00.000Z");
const AT_11_40 = new Date("2026-10-14T17:40:00.000Z");
const AT_12_20 = new Date("2026-10-14T18:20:00.000Z");

const classes = buildClassSchedule(NOW);
const byId = new Map(classes.map((cls) => [cls.id, cls]));

function phaseOf(id: string, at: Date) {
  const cls = byId.get(id)!;
  return classPhase(
    {
      statusCode: cls.status,
      scheduledAt: cls.scheduledAt,
      endsAt: cls.endsAt,
      visibleFrom: cls.meetingUrl ? new Date(cls.scheduledAt.getTime() - 30 * 60_000) : null,
      hasLink: cls.meetingUrl !== null,
    },
    at,
  );
}

/** The seats of every class as `paymentSeats` reads them, the move applied as the seed applies it. */
function seatRows(): SeatRow[] {
  const rows: SeatRow[] = [];
  for (const cls of classes) {
    for (const seat of cls.seats) {
      const paymentId = typeof seat.coverage === "object" ? seat.coverage.paymentId : null;
      rows.push({
        classId: cls.id,
        paymentId,
        isFree: seat.coverage === "free",
        attended: seat.attended,
        seatMovedAt: seat.movedTo ? cls.endsAt : null,
        phase: phaseOf(cls.id, AT_11_40),
        scheduledAt: cls.scheduledAt,
      });
    }
  }
  return rows;
}

describe("the classes demo", () => {
  it("places the classes at the academy's hours around the reference day", () => {
    expect(byId.get(IDS.classUpcoming)!.scheduledAt).toEqual(new Date("2026-10-14T18:00:00.000Z"));
    expect(byId.get(IDS.classPast)!.scheduledAt).toEqual(new Date("2026-10-07T18:00:00.000Z"));
    expect(byId.get(IDS.classGroup)!.endsAt).toEqual(new Date("2026-10-17T17:30:00.000Z"));
  });

  it("has a class in every phase at 11:40 of D, and the Najdorf live at 12:20", () => {
    expect(phaseOf(IDS.classUpcoming, AT_11_40)).toBe(CLASS_PHASE.OPEN);
    expect(phaseOf(IDS.classMateoToday, AT_11_40)).toBe(CLASS_PHASE.UPCOMING);
    expect(phaseOf(IDS.classAwaitingClose, AT_11_40)).toBe(CLASS_PHASE.AWAITING_CLOSE);
    expect(phaseOf(IDS.classPast, AT_11_40)).toBe(CLASS_PHASE.DONE);
    expect(phaseOf(IDS.classCancelled, AT_11_40)).toBe(CLASS_PHASE.CANCELLED);
    expect(phaseOf(IDS.classUpcoming, AT_12_20)).toBe(CLASS_PHASE.IN_PROGRESS);
  });

  it("shows every kind of seat: paid, free, unpaid, a no-show, a moved one and one given back", () => {
    const rows = seatRows();
    expect(rows.some((row) => row.paymentId !== null)).toBe(true);
    expect(rows.some((row) => row.isFree)).toBe(true);
    expect(rows.some((row) => row.paymentId === null && !row.isFree)).toBe(true);
    expect(rows.some((row) => row.attended === false && row.seatMovedAt === null)).toBe(true);
    expect(rows.some((row) => row.seatMovedAt !== null)).toBe(true);
    expect(rows.some((row) => row.phase === CLASS_PHASE.CANCELLED && row.paymentId !== null)).toBe(true);
  });

  it("never spends more classes than a payment bought, and the balances are the story's", () => {
    const rows = seatRows();
    const payments = buildClassPayments(NOW);
    for (const payment of payments) {
      expect(paymentSeats(payment, rows).counting, payment.id).toBeLessThanOrEqual(payment.classCount);
    }
    const balanceOf = (studentId: string) =>
      studentSeatBalance(
        payments.filter((payment) => payment.studentId === studentId).map((payment) => ({ ...payment, seats: rows })),
      );
    // Alumno Demo: three left of the October payment, two dated and one to schedule; the old one spent.
    expect(balanceOf(IDS.demoUser)).toMatchObject({ left: 3, scheduled: 2, toSchedule: 1 });
    expect(
      paymentSeats(
        payments.find((payment) => payment.id === IDS.paymentDemoOld)!,
        rows,
      ),
    ).toMatchObject({ taken: 4, toSchedule: 0 });
    expect(
      paymentSeats(
        payments.find((payment) => payment.id === IDS.paymentDemo)!,
        rows,
      ),
    ).toMatchObject({ taken: 1, scheduled: 2, toSchedule: 1 });
    expect(balanceOf(IDS.valentinaUser)).toMatchObject({ left: 1 });
    expect(balanceOf(IDS.diegoUser)).toMatchObject({ left: 1 });
    expect(balanceOf(IDS.mateoUser)).toMatchObject({ left: 2, scheduled: 2 });
    expect(balanceOf(IDS.luciaUser)).toMatchObject({ left: 0, byPayment: [] });
  });

  it("the moved seat is a no-show, and its destination exists", () => {
    for (const cls of classes) {
      for (const seat of cls.seats) {
        if (!seat.movedTo) continue;
        expect(seat.attended).toBe(false);
        expect(byId.get(seat.movedTo.classId)?.seats.some((other) => other.studentId === seat.studentId)).toBe(true);
      }
    }
  });

  it("the group class has a title and a capacity; an individual one seats one", () => {
    for (const cls of classes) {
      if (cls.format === CLASS_FORMAT.GROUP) {
        expect(cls.title).toBeTruthy();
        expect(cls.seats.length).toBeLessThanOrEqual(cls.capacity!);
      } else {
        expect(cls.capacity).toBeNull();
        expect(cls.seats).toHaveLength(1);
      }
    }
  });

  it("no two live classes of the teacher overlap", () => {
    const live = classes.filter((cls) => cls.status !== CLASS_STATUS.CANCELLED);
    for (const one of live) {
      for (const other of live) {
        if (one.id >= other.id) continue;
        const overlap = one.scheduledAt < other.endsAt && other.scheduledAt < one.endsAt;
        expect(overlap, `${one.id} overlaps ${other.id}`).toBe(false);
      }
    }
  });

  it("seeds at most one attendance activity per student and class, and only for attended classes", () => {
    const attended = ACTIVITIES.filter((activity) => activity.type === ACTIVITY_TYPE.CLASS_ATTENDED);
    const keys = attended.map((activity) => activity.subjectId);
    expect(new Set(keys).size).toBe(keys.length);
    for (const activity of attended) {
      const cls = byId.get(activity.subjectId);
      expect(cls?.seats.find((seat) => seat.studentId === IDS.demoUser)?.attended, activity.id).toBe(true);
    }
  });

  it("every block points at a seeded class, with its visibility, and the classmates are five", () => {
    for (const block of CLASS_BLOCKS) expect(byId.has(block.classId), block.id).toBe(true);
    expect(CLASS_BLOCKS.filter((block) => block.visibility === "TEACHER")).toHaveLength(2);
    expect(DEMO_CLASSMATES).toHaveLength(5);
    expect(new Set(DEMO_CLASSMATES.map((user) => user.email)).size).toBe(5);
  });

  it("one EXERCISE block «Para preparar», in the Najdorf class, with two of the demo teacher's exercises (D29)", () => {
    const blocks = CLASS_BLOCKS.filter((block) => block.kind === CLASS_BLOCK_KIND.EXERCISE);
    expect(blocks).toHaveLength(1);
    const [block] = blocks;
    expect(block).toMatchObject({ classId: IDS.classUpcoming, visibility: "BEFORE" });
    expect(block!.exerciseIds).toHaveLength(2);
    expect(exerciseBlockError({ exerciseIds: block!.exerciseIds, visibility: block!.visibility })).toBeNull();
    const demo = new Set(DEMO_EXERCISES.map((exercise) => exercise.id));
    for (const id of block!.exerciseIds) expect(demo.has(id), id).toBe(true);
    // An exercise block uses none of the single references, and no other kind carries exercises.
    expect([block!.gameId, block!.lessonId, block!.positionId, block!.text, block!.videoUrl]).toEqual([
      null,
      null,
      null,
      null,
      null,
    ]);
    for (const other of CLASS_BLOCKS) {
      if (other.kind !== CLASS_BLOCK_KIND.EXERCISE) expect(other.exerciseIds, other.id).toEqual([]);
    }
    expect(new Set(CLASS_BLOCKS.map((candidate) => `${candidate.classId}:${candidate.order}`)).size).toBe(
      CLASS_BLOCKS.length,
    );
  });
});

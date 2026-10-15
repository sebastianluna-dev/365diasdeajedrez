import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { PROJECT_ROOT, reach } from "@/lib/testing/module-reach";

// The frontier between the papers. The teacher sees their assigned classes,
// prepares their content, takes attendance and finalizes; creating a class,
// dating it, seating a student and everything about money are the staff's.
// So no module of the teacher's side — its services, its sections, its pages
// — may reach the writers of seats and schedules, the staff's class services
// or the payments, and none of them may so much as name a payment.
//
// TEMPORARY exception, until phase 6 retires the old teacher screens: the old
// actions (`services/teacher-classes/teacher-classes.actions.ts`) still create
// classes and seat students through the writers. They are reported but not
// followed (`stopAt`), so what lies ONLY behind them is allowed; a second
// teacher-side module reaching a staff writer is not.

const TEACHER_SIDE = [
  "services/teacher-classes",
  "services/teacher",
  "components/platform/sections/teacher",
  "app/(platform)/profesor",
];
const STAFF_ONLY = [
  "services/shared/class-seats.service.ts",
  "services/shared/class-schedule.service.ts",
  "services/staff-classes/",
  "services/staff-payments/",
];
const OLD_TEACHER_ACTIONS = join(PROJECT_ROOT, "services/teacher-classes/teacher-classes.actions.ts");
const PAYMENT_TOKEN = /\b(?:classPayment|ClassPayment)\b/;

function sourcesOf(folder: string): string[] {
  const directory = join(PROJECT_ROOT, folder);
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return sourcesOf(relative(PROJECT_ROOT, path));
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

describe("the teacher's side", () => {
  const files = TEACHER_SIDE.flatMap(sourcesOf);

  it("finds its modules", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it("reaches no writer of seats or schedules, nor the staff's class or payment services", () => {
    const stopAt = new Set([OLD_TEACHER_ACTIONS]);
    const offenders = files.flatMap((file) =>
      reach(file, stopAt)
        .filter((reached) => reached !== OLD_TEACHER_ACTIONS)
        .map((reached) => relative(PROJECT_ROOT, reached))
        .filter((reached) => STAFF_ONLY.some((forbidden) => reached.startsWith(forbidden)))
        .map((reached) => `${relative(PROJECT_ROOT, file)} → ${reached}`),
    );
    expect(offenders).toEqual([]);
  });

  it("never names a payment", () => {
    const offenders = files
      .filter((file) => PAYMENT_TOKEN.test(readFileSync(file, "utf8")))
      .map((file) => relative(PROJECT_ROOT, file));
    expect(offenders).toEqual([]);
  });
});

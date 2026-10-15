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
// No exceptions: since phase 6 (2026-10-15) the teacher neither creates nor
// schedules classes nor seats students; their actions reach only the
// attendance and status writers.

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
    const offenders = files.flatMap((file) =>
      reach(file)
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

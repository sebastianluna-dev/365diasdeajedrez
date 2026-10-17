import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { PROJECT_ROOT, reach } from "@/lib/testing/module-reach";

// The student's side of the exercises, the sibling of class-roles.test.ts: a
// student writes attempts, never exercises (D06, D07). So no module of the
// student's screens — their services, their sections, their pages, the
// classes they sit in included — may reach the writers of an exercise's
// content or status, nor the teacher's or the staff's exercise services. Its
// one write, `submitExerciseAttempt`, reaches the attempt's writer only.
//
// No exceptions.

const STUDENT_SIDE = [
  "services/exercises",
  "services/classes",
  "components/platform/sections/exercises",
  "components/platform/sections/classes",
  "app/(platform)/ejercicios",
  "app/(platform)/clases",
];
const AUTHOR_ONLY = [
  "services/shared/exercise-record.service.ts",
  "services/shared/exercise-status.service.ts",
  "services/teacher-exercises/",
  "services/staff-exercises/",
];

function sourcesOf(folder: string): string[] {
  const directory = join(PROJECT_ROOT, folder);
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return sourcesOf(relative(PROJECT_ROOT, path));
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

describe("the student's side of the exercises", () => {
  const files = STUDENT_SIDE.flatMap(sourcesOf);

  it("finds its modules, the exercise pages and the attempt's action among them", () => {
    const found = files.map((file) => relative(PROJECT_ROOT, file));
    expect(found.length).toBeGreaterThan(15);
    expect(found).toContain("services/exercises/exercises.actions.ts");
    expect(found).toContain("app/(platform)/ejercicios/series/[seriesId]/[n]/page.tsx");
    expect(found).toContain("app/(platform)/clases/[classId]/ejercicios/[blockId]/[n]/page.tsx");
    expect(found).toContain("services/exercises/class-practice.service.ts");
  });

  it("reaches no writer of an exercise's content or status, nor the authors' exercise services", () => {
    const offenders = files.flatMap((file) =>
      reach(file)
        .map((reached) => relative(PROJECT_ROOT, reached))
        .filter((reached) => AUTHOR_ONLY.some((forbidden) => reached.startsWith(forbidden)))
        .map((reached) => `${relative(PROJECT_ROOT, file)} → ${reached}`),
    );
    expect(offenders).toEqual([]);
  });

  it("records its attempts through the attempt's writer", () => {
    const action = join(PROJECT_ROOT, "services/exercises/exercises.actions.ts");
    expect(reach(action).map((reached) => relative(PROJECT_ROOT, reached))).toContain(
      "services/shared/exercise-attempt.service.ts",
    );
  });
});

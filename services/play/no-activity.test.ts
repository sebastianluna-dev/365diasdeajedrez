import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { PROJECT_ROOT, reach } from "@/lib/testing/module-reach";

// Playing never counts toward the study streak (planning decision F). The
// streak counts ANY row of UserActivity, with no filter, so the guarantee is
// that «Jugar» never writes one: no module reached from services/play,
// services/bots, services/profile or services/adventure is the activity log's
// writer (nor the position index's: a played game is never indexed), and no
// file of theirs names the activity tables — a direct write or a raw query
// would not pass.

const FOLDERS = ["services/play", "services/bots", "services/profile", "services/adventure"];
const FORBIDDEN_MODULES = [
  "services/shared/user-activity.service.ts",
  "services/game-positions/game-positions.service.ts",
];
const FORBIDDEN_NAMES = /\b(?:userActivity|userStatDaily|UserActivity|UserStatDaily)\b/;

function sourcesOf(folder: string): string[] {
  const directory = join(PROJECT_ROOT, folder);
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return sourcesOf(relative(PROJECT_ROOT, path));
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

describe("playing writes no activity", () => {
  const files = FOLDERS.flatMap(sourcesOf);

  it("finds the folders' modules", () => {
    expect(files.length).toBeGreaterThan(8);
  });

  it("reaches neither the activity log's writer nor the position index", () => {
    // `copyPlayedGameToStudy` indexes the COPY it makes into a study, which is a study's game; that one import is the exception.
    const offenders = files
      .filter((file) => !file.endsWith("play.actions.ts"))
      .flatMap((file) =>
        reach(file)
          .map((module) => relative(PROJECT_ROOT, module))
          .filter((module) => FORBIDDEN_MODULES.includes(module))
          .map((module) => `${relative(PROJECT_ROOT, file)} reaches ${module}`),
      );
    expect(offenders).toEqual([]);
  });

  it("never reaches the activity log's writer, not even from the actions", () => {
    const actions = files.find((file) => file.endsWith("play.actions.ts"))!;
    expect(reach(actions).map((module) => relative(PROJECT_ROOT, module))).not.toContain(FORBIDDEN_MODULES[0]);
  });

  it("never names the activity tables", () => {
    const offenders = files
      .filter((file) => FORBIDDEN_NAMES.test(readFileSync(file, "utf8")))
      .map((file) => relative(PROJECT_ROOT, file));
    expect(offenders).toEqual([]);
  });
});

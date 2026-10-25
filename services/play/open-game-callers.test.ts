import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { PROJECT_ROOT } from "@/lib/testing/module-reach";

// Every game against a bot is an encounter of an adventure (2026-10-25): there
// is no gallery, no free game and no rematch. The server opens a game against
// a bot only through `openGame` (services/play/open-game.ts), so the one
// module that may import it is the adventure's action, which checks the story
// before it does.

/** The source files under the folders that hold server code and pages. */
function sourcesUnder(folder: string): string[] {
  return readdirSync(join(PROJECT_ROOT, folder), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name))
    .map((entry) => relative(PROJECT_ROOT, join(entry.parentPath, entry.name)));
}

describe("who opens a game against a bot", () => {
  it("is only the adventure's action: nothing else imports openGame", () => {
    const callers = ["app", "services", "lib", "components"]
      .flatMap(sourcesUnder)
      .filter((file) =>
        /from\s+["'](@\/services\/play\/open-game|\.\/open-game)["']/.test(
          readFileSync(join(PROJECT_ROOT, file), "utf8"),
        ),
      );
    expect(callers).toEqual(["services/adventure/adventure.actions.ts"]);
  });

  it("leaves no action that starts a free game or a rematch", () => {
    const actions = readFileSync(join(PROJECT_ROOT, "services/play/play.actions.ts"), "utf8");
    expect(actions).not.toMatch(/export async function (startPlayedGame|rematchPlayedGame)\b/);
  });
});

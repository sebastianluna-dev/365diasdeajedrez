import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { PROJECT_ROOT, reach } from "@/lib/testing/module-reach";

// A story draws a piece with sample data; it must not pull a server action
// in. The section that renders the piece in the app imports the action from
// its `.actions.ts` and hands it to the piece as a prop (the `NewCourseForm`
// pattern), and the stories pass stubs. A story that reached an action would
// drag the server-only modules it imports into Storybook's browser build, and
// would tie a piece to one action for good.

function storiesOf(folder: string): string[] {
  const directory = join(PROJECT_ROOT, folder);
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return storiesOf(relative(PROJECT_ROOT, path));
    return name.endsWith(".stories.tsx") ? [path] : [];
  });
}

describe("the stories", () => {
  const files = storiesOf("components");

  it("are found", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it("reach no server action", () => {
    const offenders = files.flatMap((file) =>
      reach(file)
        .filter((reached) => reached.endsWith(".actions.ts"))
        .map((reached) => `${relative(PROJECT_ROOT, file)} → ${relative(PROJECT_ROOT, reached)}`),
    );
    expect(offenders).toEqual([]);
  });
});

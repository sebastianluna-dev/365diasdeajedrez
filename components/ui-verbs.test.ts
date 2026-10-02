import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// One action, one verb. The product said «Añadir» on some screens and
// «Agregar» on others, «Borrar» here and «Eliminar» there, for the same thing;
// the owner settled it (2026-10-01): a thing is put in with «Agregar», taken
// out of where it is with «Quitar», and destroyed with «Eliminar». The verbs
// that lost are not written again: this reads the copy and fails on them. The
// table of verbs is in the docs' glossary.

const ROOT = fileURLToPath(new URL("../", import.meta.url));

/** Where copy is written: pages, components, the message maps, and what the services say. */
const SOURCES = ["app", "components", "constants", "services", "lib"];

/**
 * Any form of «añadir» and of «borrar»: the infinitive, the gerund of a
 * pending label, the imperative of a hint («Añade…», «Bórralo»). `\p{L}`
 * because JavaScript's `\b` does not know that «ñ» and «á» are letters.
 * «Borrador» is a draft, not a verb, and stays; so does an English "borrow"
 * in a comment.
 */
const RULED_OUT = /(?<!\p{L})(?:a[ñn][aá]d|b[oó]rr(?!ador|ow))\p{L}*/giu;

/** A form with several submit buttons that share one label passes the resting label: see SubmitButton. */
const RESTING_PENDING_LABEL = [
  "components/platform/sections/teacher/classes/attendance-form.comp.tsx",
  // Its "Several in one form" story draws that same form.
  "components/platform/shared/submit-button/submit-button.stories.tsx",
];

const PENDING_LABEL = /pendingLabel="([^"]*)"/g;

function filesOf(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return filesOf(path);
    // A test names what it checks in Spanish, in its own words: it is not copy.
    const isCopy = /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name);
    return isCopy ? [path] : [];
  });
}

const sources = SOURCES.flatMap((directory) => filesOf(join(ROOT, directory)));

describe("the verbs of the interface", () => {
  it("finds the files where copy is written", () => {
    // A renamed folder would leave the rules below watching nothing.
    expect(sources.length).toBeGreaterThan(400);
  });

  it("are «Agregar» and «Eliminar», never «Añadir» or «Borrar»", () => {
    const found = sources.flatMap((path) =>
      readFileSync(path, "utf8")
        .split("\n")
        .flatMap((line, index) =>
          [...line.matchAll(RULED_OUT)].map((match) => `${relative(ROOT, path)}:${index + 1} ${match[0]}`),
        ),
    );
    expect(found).toEqual([]);
  });

  it("say what is happening while a form is on its way: a gerund and «…»", () => {
    const unfinished = sources.flatMap((path) => {
      const file = relative(ROOT, path);
      if (RESTING_PENDING_LABEL.includes(file)) return [];
      return [...readFileSync(path, "utf8").matchAll(PENDING_LABEL)]
        .map((match) => match[1] ?? "")
        .filter((label) => !/(?:ando|iendo|yendo)…$/.test(label))
        .map((label) => `${file}: "${label}"`);
    });
    expect(unfinished).toEqual([]);
  });

  it("keep their exceptions true", () => {
    // An entry leaves the list the day its file stops passing a resting label.
    const stale = RESTING_PENDING_LABEL.filter((file) => {
      const labels = [...readFileSync(join(ROOT, file), "utf8").matchAll(PENDING_LABEL)].map((match) => match[1] ?? "");
      return labels.every((label) => label.endsWith("…"));
    });
    expect(stale).toEqual([]);
  });
});

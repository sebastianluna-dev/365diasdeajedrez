import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isValidUserSlug } from "@/constants/platform/user-slug.const";
import {
  proposeUserSlug,
  SLUG_FOLD_FROM,
  SLUG_FOLD_TO,
  userSlugFrom,
  withSuffix,
  type UserSlugReader,
} from "./user-slug.service";

/** A reader whose taken slugs are these, answering the prefix query as the database would. */
function readerWith(taken: string[]): UserSlugReader {
  return {
    user: {
      findMany: async (args: unknown) => {
        const prefix = (args as { where: { slug: { startsWith: string } } }).where.slug.startsWith;
        return taken.filter((slug) => slug.startsWith(prefix)).map((slug) => ({ slug }));
      },
    },
  };
}

describe("userSlugFrom", () => {
  it("folds accents and the ñ, lowers the case and joins the words with dashes", () => {
    expect(userSlugFrom("Ana Pérez")).toBe("ana-perez");
    expect(userSlugFrom("José Ñúñez  Íñiguez")).toBe("jose-nunez-iniguez");
    expect(userSlugFrom("  María-José O'Connor ")).toBe("maria-jose-o-connor");
    expect(userSlugFrom("Alumno Demo")).toBe("alumno-demo");
  });

  it("keeps at most thirty characters and never ends on a dash", () => {
    const slug = userSlugFrom("Maximiliano Bartolomé de las Casas Rodríguez");
    expect(slug.length).toBeLessThanOrEqual(30);
    expect(slug).toBe("maximiliano-bartolome-de-las-c");
  });

  it("falls back to usuario when fewer than three characters are left", () => {
    expect(userSlugFrom("")).toBe("usuario");
    expect(userSlugFrom("李明")).toBe("usuario");
    expect(userSlugFrom("Al")).toBe("usuario");
  });

  it("always proposes a well-formed slug", () => {
    for (const name of ["Ana Pérez", "José Ñúñez", "李明", "Al", "--x--", "Ü 2026 !!", "Profesor Demo"]) {
      const slug = userSlugFrom(name);
      expect(slug.length).toBeGreaterThanOrEqual(3);
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });
});

describe("withSuffix", () => {
  it("adds the number within thirty characters", () => {
    expect(withSuffix("ana-perez", 2)).toBe("ana-perez-2");
    expect(withSuffix("maximiliano-bartolome-de-las", 12)).toBe("maximiliano-bartolome-de-la-12");
    expect(withSuffix("maximiliano-bartolome-de-las", 12).length).toBeLessThanOrEqual(30);
  });
});

describe("proposeUserSlug", () => {
  it("gives the name's own slug when it is free", async () => {
    expect(await proposeUserSlug(readerWith([]), "Ana Pérez")).toBe("ana-perez");
  });

  it("numbers it when it is taken, from 2", async () => {
    expect(await proposeUserSlug(readerWith(["ana-perez"]), "Ana Pérez")).toBe("ana-perez-2");
    expect(await proposeUserSlug(readerWith(["ana-perez", "ana-perez-2"]), "Ana Pérez")).toBe("ana-perez-3");
  });

  it("never proposes a word the platform's addresses use", async () => {
    expect(await proposeUserSlug(readerWith([]), "Jugar")).toBe("jugar-2");
    expect(isValidUserSlug("jugar")).toBe(false);
    expect(isValidUserSlug("jugar-2")).toBe(true);
  });
});

describe("the migration that brought the column", () => {
  const sql = readFileSync(
    new URL("../../prisma/migrations/20261008120000_user_slug/migration.sql", import.meta.url),
    "utf8",
  );

  it("folds accents with the same table as userSlugFrom", () => {
    expect(sql).toContain(`translate(lower("displayName"), '${SLUG_FOLD_FROM}', '${SLUG_FOLD_TO}')`);
    expect(SLUG_FOLD_FROM.length).toBe(SLUG_FOLD_TO.length);
  });

  it("checks the same pattern and length as isValidUserSlug", () => {
    expect(sql).toContain(`"slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length("slug") BETWEEN 3 AND 30`);
    expect(sql).toContain("'usuario'");
  });
});

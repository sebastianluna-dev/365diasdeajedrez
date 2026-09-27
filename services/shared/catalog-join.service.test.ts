import { describe, expect, it } from "vitest";
import { syncCatalogJoin, type CatalogReader, type JoinWriter } from "./catalog-join.service";

// A catalog of three codes and a join that records every call, so the test
// reads what the sync asked of Prisma instead of a database.
const CATALOG = [
  { id: 1, code: "OPENINGS" },
  { id: 2, code: "TACTICS" },
  { id: 3, code: "ENDGAMES" },
];

interface DeleteArgs {
  where: Record<string, string>;
}
interface CreateArgs {
  data: Record<string, string | number>[];
}
interface FindArgs {
  where: { code: { in: string[] } };
}

function fakes() {
  const calls: { deleted?: unknown; created?: unknown; lookedUp?: string[] } = {};
  const join: JoinWriter = {
    async deleteMany(args) {
      calls.deleted = (args as DeleteArgs).where;
    },
    async createMany(args) {
      calls.created = (args as CreateArgs).data;
    },
  };
  const catalog: CatalogReader = {
    async findMany(args) {
      const wanted = (args as FindArgs).where.code.in;
      calls.lookedUp = wanted;
      return CATALOG.filter((row) => wanted.includes(row.code));
    },
  };
  return { join, catalog, calls };
}

describe("syncCatalogJoin", () => {
  it("borra las filas del padre y crea una por código conocido", async () => {
    const { join, catalog, calls } = fakes();
    const written = await syncCatalogJoin(join, catalog, {
      parent: { courseId: "c1" },
      catalogColumn: "contentTypeId",
      codes: ["TACTICS", "OPENINGS"],
    });

    expect(written).toBe(2);
    expect(calls.deleted).toEqual({ courseId: "c1" });
    expect(calls.created).toEqual([
      { courseId: "c1", contentTypeId: 1 },
      { courseId: "c1", contentTypeId: 2 },
    ]);
  });

  it("colapsa los duplicados y omite los códigos desconocidos", async () => {
    const { join, catalog, calls } = fakes();
    const written = await syncCatalogJoin(join, catalog, {
      parent: { courseId: "c1" },
      catalogColumn: "contentTypeId",
      codes: ["ENDGAMES", "ENDGAMES", "NOPE"],
    });

    expect(written).toBe(1);
    expect(calls.lookedUp).toEqual(["ENDGAMES", "NOPE"]);
    expect(calls.created).toEqual([{ courseId: "c1", contentTypeId: 3 }]);
  });

  it("con la lista vacía sólo borra, sin consultar el catálogo", async () => {
    const { join, catalog, calls } = fakes();
    const written = await syncCatalogJoin(join, catalog, {
      parent: { entityId: "e1" },
      catalogColumn: "kindId",
      codes: [],
    });

    expect(written).toBe(0);
    expect(calls.deleted).toEqual({ entityId: "e1" });
    expect(calls.lookedUp).toBeUndefined();
    expect(calls.created).toBeUndefined();
  });
});

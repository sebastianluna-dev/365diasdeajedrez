import { describe, expect, it } from "vitest";
import { TOPIC_VALUES } from "@/prisma/seed-data";
import { exerciseActivityTopic, type TopicNode } from "./exercise-activity-topic";

// The seed's catalog, with ids by position: the migration and the seed agree
// on codes, orders and parents (prisma/exercise-migration.test.ts).
const ids = new Map<string, number>(TOPIC_VALUES.map(([code], index) => [code, index + 1]));
const CATALOG: TopicNode[] = TOPIC_VALUES.map(([code, , order, parent]) => ({
  id: ids.get(code)!,
  parentId: parent ? ids.get(parent)! : null,
  order,
}));
const id = (code: string) => ids.get(code)!;

describe("exerciseActivityTopic", () => {
  it("un motivo táctico acredita su raíz, «Táctica»", () => {
    expect(exerciseActivityTopic([id("FORK")], CATALOG)).toBe(id("TACTICS"));
  });

  it("con temas bajo dos raíces, gana la raíz de menor orden, en cualquier orden de entrada", () => {
    expect(exerciseActivityTopic([id("ENDGAME"), id("PIN")], CATALOG)).toBe(id("TACTICS"));
    expect(exerciseActivityTopic([id("STRATEGY"), id("ENDGAME")], CATALOG)).toBe(id("ENDGAME"));
    expect(exerciseActivityTopic([id("ENDGAME"), id("STRATEGY")], CATALOG)).toBe(id("ENDGAME"));
  });

  it("a igual orden, desempata por id", () => {
    const catalog: TopicNode[] = [
      { id: 7, parentId: null, order: 0 },
      { id: 3, parentId: null, order: 0 },
      { id: 9, parentId: 7, order: 10 },
    ];
    expect(exerciseActivityTopic([9, 3], catalog)).toBe(3);
  });

  it("sin temas, o con temas que el catálogo no conoce, no acredita ninguno", () => {
    expect(exerciseActivityTopic([], CATALOG)).toBeNull();
    expect(exerciseActivityTopic([9999], CATALOG)).toBeNull();
  });

  it("no se pierde en un ciclo de padres", () => {
    const catalog: TopicNode[] = [
      { id: 1, parentId: 2, order: 0 },
      { id: 2, parentId: 1, order: 1 },
    ];
    expect(exerciseActivityTopic([1], catalog)).not.toBeUndefined();
  });
});

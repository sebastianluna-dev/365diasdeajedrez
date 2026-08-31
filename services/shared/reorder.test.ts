import { describe, expect, it } from "vitest";
import { nextOrder, planDenseRenumber, planSwap, TEMP_ORDER, type OrderUpdate, type ReorderRow } from "./reorder";

// Se simula lo que hace PostgreSQL: aplicar los updates uno a uno y comprobar
// que en NINGÚN paso intermedio hay dos filas con el mismo orden (que es
// exactamente lo que lanzaría el P2002 del índice único).
function applyUpdates(rows: ReorderRow[], updates: OrderUpdate[]): ReorderRow[] {
  const state = new Map(rows.map((row) => [row.id, row.order]));

  for (const update of updates) {
    state.set(update.id, update.order);
    const realOrders = [...state.values()].filter((order) => order !== TEMP_ORDER);
    expect(new Set(realOrders).size, `orden duplicado tras ${update.id} → ${update.order}`).toBe(realOrders.length);
  }

  return [...state].map(([id, order]) => ({ id, order })).sort((left, right) => left.order - right.order);
}

function listOf(size: number): ReorderRow[] {
  return Array.from({ length: size }, (_, index) => ({ id: `b${index + 1}`, order: index + 1 }));
}

describe("planSwap", () => {
  it("intercambia dos filas contiguas sin duplicar el orden en ningún paso", () => {
    const rows = listOf(3);
    const result = applyUpdates(rows, planSwap(rows, "b2", "down"));
    expect(result.map((row) => row.id)).toEqual(["b1", "b3", "b2"]);
    expect(result.map((row) => row.order)).toEqual([1, 2, 3]);
  });

  it("pasa siempre por un orden temporal fuera de rango", () => {
    const updates = planSwap(listOf(3), "b2", "up");
    expect(updates[0]).toEqual({ id: "b2", order: TEMP_ORDER });
    expect(updates).toHaveLength(3);
  });

  it("no hace nada en los extremos ni con ids desconocidos", () => {
    expect(planSwap(listOf(3), "b1", "up")).toEqual([]);
    expect(planSwap(listOf(3), "b3", "down")).toEqual([]);
    expect(planSwap(listOf(3), "no-existe", "up")).toEqual([]);
    expect(planSwap(listOf(1), "b1", "up")).toEqual([]);
    expect(planSwap(listOf(1), "b1", "down")).toEqual([]);
    expect(planSwap([], "b1", "up")).toEqual([]);
  });

  it("sobrevive a todas las permutaciones de movimiento en listas de 1 a 6", () => {
    for (let size = 1; size <= 6; size += 1) {
      for (let position = 0; position < size; position += 1) {
        for (const direction of ["up", "down"] as const) {
          const rows = listOf(size);
          const id = `b${position + 1}`;
          const updates = planSwap(rows, id, direction);
          const result = applyUpdates(rows, updates);

          expect(result.map((row) => row.order), `lista de ${size}`).toEqual(
            Array.from({ length: size }, (_, index) => index + 1),
          );

          const finalIndex = result.findIndex((row) => row.id === id);
          const expectedIndex =
            direction === "up" ? Math.max(0, position - 1) : Math.min(size - 1, position + 1);
          expect(finalIndex, `${id} ${direction} en lista de ${size}`).toBe(expectedIndex);
        }
      }
    }
  });

  it("funciona con órdenes con huecos (listas ya desalineadas)", () => {
    const rows: ReorderRow[] = [
      { id: "a", order: 1 },
      { id: "b", order: 5 },
      { id: "c", order: 9 },
    ];
    const result = applyUpdates(rows, planSwap(rows, "c", "up"));
    expect(result.map((row) => row.id)).toEqual(["a", "c", "b"]);
  });
});

describe("planDenseRenumber", () => {
  it("cierra el hueco que deja un borrado en el medio", () => {
    // Se ha borrado el que tenía order 3.
    const remaining: ReorderRow[] = [
      { id: "b1", order: 1 },
      { id: "b2", order: 2 },
      { id: "b4", order: 4 },
      { id: "b5", order: 5 },
    ];
    const result = applyUpdates(remaining, planDenseRenumber(remaining));
    expect(result.map((row) => row.order)).toEqual([1, 2, 3, 4]);
    expect(result.map((row) => row.id)).toEqual(["b1", "b2", "b4", "b5"]);
  });

  it("cierra el hueco del primero", () => {
    const remaining: ReorderRow[] = [
      { id: "b2", order: 2 },
      { id: "b3", order: 3 },
    ];
    const result = applyUpdates(remaining, planDenseRenumber(remaining));
    expect(result.map((row) => row.order)).toEqual([1, 2]);
  });

  it("no genera updates cuando la lista ya es densa", () => {
    expect(planDenseRenumber(listOf(4))).toEqual([]);
    expect(planDenseRenumber([])).toEqual([]);
  });

  it("aplica los updates en orden ascendente de destino", () => {
    const remaining: ReorderRow[] = [
      { id: "b3", order: 3 },
      { id: "b7", order: 7 },
      { id: "b9", order: 9 },
    ];
    const updates = planDenseRenumber(remaining);
    expect(updates.map((update) => update.order)).toEqual([1, 2, 3]);
  });
});

describe("nextOrder", () => {
  it("añade siempre al final, con la lista vacía incluida", () => {
    expect(nextOrder(0)).toBe(1);
    expect(nextOrder(4)).toBe(5);
  });
});

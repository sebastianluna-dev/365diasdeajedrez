import { describe, expect, it } from "vitest";

import { CONTENT_ROLE } from "@/constants/platform/course-codes.const";
import { isPlainContent, sortByRole, withRole } from "@/services/shared/content-order";

const item = (order: number, roleCode: string | null = null) => ({ order, roleCode });

describe("sortByRole", () => {
  it("la introducción va delante y el cierre al final, pase lo que pase con `order`", () => {
    // The closing with the lowest number and the introduction with the highest: if
    // the order ruled, they would come out the other way round.
    const sorted = sortByRole([
      item(1, CONTENT_ROLE.CLOSING),
      item(5),
      item(3),
      item(9, CONTENT_ROLE.INTRO),
    ]);
    expect(sorted.map((row) => row.roleCode)).toEqual([
      CONTENT_ROLE.INTRO,
      null,
      null,
      CONTENT_ROLE.CLOSING,
    ]);
  });

  it("entre el contenido normal manda su orden", () => {
    expect(sortByRole([item(3), item(1), item(2)]).map((row) => row.order)).toEqual([1, 2, 3]);
  });

  it("los cuatro son opcionales: sin ninguno, la lista es la de siempre", () => {
    expect(sortByRole([item(1), item(2)]).map((row) => row.order)).toEqual([1, 2]);
  });

  it("no toca la lista que recibe", () => {
    const original = [item(2), item(1)];
    sortByRole(original);
    expect(original.map((row) => row.order)).toEqual([2, 1]);
  });
});

describe("isPlainContent", () => {
  it("sólo el contenido normal se reordena", () => {
    expect(isPlainContent(item(1))).toBe(true);
    expect(isPlainContent(item(1, CONTENT_ROLE.INTRO))).toBe(false);
    expect(isPlainContent(item(1, CONTENT_ROLE.CLOSING))).toBe(false);
  });
});

describe("withRole", () => {
  it("encuentra el que abre y el que cierra, o nada", () => {
    const rows = [item(1, CONTENT_ROLE.INTRO), item(2)];
    expect(withRole(rows, CONTENT_ROLE.INTRO)?.order).toBe(1);
    expect(withRole(rows, CONTENT_ROLE.CLOSING)).toBeUndefined();
  });
});

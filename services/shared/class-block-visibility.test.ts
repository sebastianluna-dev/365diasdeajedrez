import { describe, expect, it } from "vitest";
import { CLASS_BLOCK_VISIBILITY, CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { CLASSES_NOW } from "@/lib/testing/fixtures/classes";
import { studentVisibleClassBlockWhere } from "./class-block-visibility";

describe("studentVisibleClassBlockWhere", () => {
  const where = studentVisibleClassBlockWhere("alumna", CLASSES_NOW);
  const [membership, visibility] = where.AND as [Record<string, unknown>, { OR: Record<string, unknown>[] }];

  it("sólo en una clase en la que participa y que no está cancelada", () => {
    expect(membership).toEqual({
      class: { participants: { some: { userId: "alumna" } }, status: { code: { not: CLASS_STATUS.CANCELLED } } },
    });
  });

  it("lo de preparar siempre; lo de después desde el fin o al finalizar", () => {
    expect(visibility.OR).toContainEqual({ visibility: { code: CLASS_BLOCK_VISIBILITY.BEFORE } });
    expect(visibility.OR).toContainEqual({
      visibility: { code: CLASS_BLOCK_VISIBILITY.AFTER },
      class: { OR: [{ endsAt: { lte: CLASSES_NOW } }, { status: { code: CLASS_STATUS.COMPLETED } }] },
    });
  });

  it("el guion del profesor nunca", () => {
    expect(visibility.OR).toHaveLength(2);
    expect(JSON.stringify(where)).not.toContain(CLASS_BLOCK_VISIBILITY.TEACHER);
  });
});

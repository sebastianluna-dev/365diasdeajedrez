import { describe, expect, it } from "vitest";

import { saveLabelOf } from "./use-game-autosave.hook";

describe("la etiqueta del guardado", () => {
  it("no dice nada cuando no se puede editar, ni cuando no hay nada que decir", () => {
    expect(saveLabelOf({ enabled: false, saveState: "error", dirty: true })).toBeUndefined();
    expect(saveLabelOf({ enabled: true, saveState: "idle", dirty: false })).toBeUndefined();
  });

  it("sigue el ciclo: sin guardar, guardando, guardado", () => {
    expect(saveLabelOf({ enabled: true, saveState: "idle", dirty: true })).toBe("sin guardar");
    expect(saveLabelOf({ enabled: true, saveState: "saving", dirty: true })).toBe("guardando…");
    expect(saveLabelOf({ enabled: true, saveState: "saved", dirty: false })).toBe("guardado");
    expect(saveLabelOf({ enabled: true, saveState: "saved", dirty: true })).toBe("sin guardar");
  });

  it("el error gana aunque se haya vuelto a escribir", () => {
    expect(saveLabelOf({ enabled: true, saveState: "error", dirty: true })).toBe("no se pudo guardar");
    expect(saveLabelOf({ enabled: true, saveState: "error", dirty: false })).toBe("no se pudo guardar");
  });
});

import { describe, expect, it } from "vitest";

import { dayKey, startOfDay, streakLength } from "@/lib/study-streak";

const MX = "America/Mexico_City";

describe("dayKey", () => {
  it("da el día de la zona, no el de UTC", () => {
    // 00:10 UTC del día 16 son todavía las 18:10 del día 15 en México: la racha
    // de esa tarde tiene que contar como del 15.
    expect(dayKey(new Date("2026-03-16T00:10:00.000Z"), MX)).toBe("2026-03-15");
    expect(dayKey(new Date("2026-03-16T06:10:00.000Z"), MX)).toBe("2026-03-16");
  });

  it("en UTC es el día de UTC", () => {
    expect(dayKey(new Date("2026-03-15T23:30:00.000Z"), "UTC")).toBe("2026-03-15");
  });
});

describe("startOfDay", () => {
  it("es la medianoche local expresada en UTC", () => {
    expect(startOfDay("2026-03-15", MX).toISOString()).toBe("2026-03-15T06:00:00.000Z");
    expect(startOfDay("2026-03-15", "UTC").toISOString()).toBe("2026-03-15T00:00:00.000Z");
  });

  it("es la vuelta de dayKey: el primer instante del día pertenece a ese día", () => {
    for (const key of ["2026-01-01", "2026-03-15", "2026-07-04", "2026-11-02", "2026-12-31"]) {
      expect(dayKey(startOfDay(key, MX), MX)).toBe(key);
      // Y un milisegundo antes es del día anterior, que es lo que hace que
      // acotar una consulta con `gte` no se coma parte de ayer.
      expect(dayKey(new Date(startOfDay(key, MX).getTime() - 1), MX)).not.toBe(key);
    }
  });

  it("sigue al horario de verano en lugar de suponer un desfase fijo", () => {
    // España cambia la hora el último domingo de marzo: antes va +1, después +2.
    expect(startOfDay("2026-03-01", "Europe/Madrid").toISOString()).toBe("2026-02-28T23:00:00.000Z");
    expect(startOfDay("2026-04-01", "Europe/Madrid").toISOString()).toBe("2026-03-31T22:00:00.000Z");
  });
});

describe("streakLength", () => {
  it("sin actividad no hay racha", () => {
    expect(streakLength([], "2026-03-15")).toBe(0);
  });

  it("cuenta los días seguidos que terminan hoy", () => {
    const days = ["2026-03-13", "2026-03-14", "2026-03-15"];
    expect(streakLength(days, "2026-03-15")).toBe(3);
  });

  it("el día de hoy todavía en blanco NO rompe la racha", () => {
    // Son las nueve de la mañana y aún no ha estudiado: ayer, anteayer y el
    // anterior siguen contando.
    const days = ["2026-03-12", "2026-03-13", "2026-03-14"];
    expect(streakLength(days, "2026-03-15")).toBe(3);
  });

  it("pero dos días en blanco sí la rompen", () => {
    expect(streakLength(["2026-03-12", "2026-03-13"], "2026-03-15")).toBe(0);
  });

  it("un hueco corta la cuenta ahí, no antes", () => {
    // Falta el 13: sólo cuentan el 14 y el 15.
    const days = ["2026-03-10", "2026-03-11", "2026-03-12", "2026-03-14", "2026-03-15"];
    expect(streakLength(days, "2026-03-15")).toBe(2);
  });

  it("los días repetidos son un solo día", () => {
    const days = ["2026-03-15", "2026-03-15", "2026-03-14", "2026-03-15"];
    expect(streakLength(days, "2026-03-15")).toBe(2);
  });

  it("no le importa el orden en que lleguen", () => {
    const days = ["2026-03-15", "2026-03-13", "2026-03-14"];
    expect(streakLength(days, "2026-03-15")).toBe(3);
  });

  it("cruza el cambio de mes", () => {
    const days = ["2026-02-27", "2026-02-28", "2026-03-01"];
    expect(streakLength(days, "2026-03-01")).toBe(3);
  });

  it("cruza el 29 de febrero de un año bisiesto", () => {
    const days = ["2024-02-28", "2024-02-29", "2024-03-01"];
    expect(streakLength(days, "2024-03-01")).toBe(3);
  });

  it("cruza el fin de año", () => {
    const days = ["2025-12-30", "2025-12-31", "2026-01-01"];
    expect(streakLength(days, "2026-01-01")).toBe(3);
  });

  it("la actividad futura no infla la racha de hoy", () => {
    // Un desfase de reloj podría dejar una fila con fecha de mañana; contarla
    // regalaría un día que no se ha estudiado.
    const days = ["2026-03-15", "2026-03-16"];
    expect(streakLength(days, "2026-03-15")).toBe(1);
  });

  it("una racha de un solo día es 1", () => {
    expect(streakLength(["2026-03-15"], "2026-03-15")).toBe(1);
  });
});

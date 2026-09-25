import { describe, expect, it } from "vitest";
import { formatRelativeSpanish } from "./format-relative-spanish";

const now = new Date(2026, 8, 24, 12, 0, 0);
const ago = (seconds: number) => new Date(now.getTime() - seconds * 1000);

describe("formatRelativeSpanish", () => {
  it("elige la unidad más grande que cabe", () => {
    expect(formatRelativeSpanish(ago(30), now)).toBe("ahora mismo");
    expect(formatRelativeSpanish(ago(5 * 60), now)).toBe("hace 5 minutos");
    expect(formatRelativeSpanish(ago(3 * 3600), now)).toBe("hace 3 horas");
    expect(formatRelativeSpanish(ago(4 * 86400), now)).toBe("hace 4 días");
    expect(formatRelativeSpanish(ago(95 * 86400), now)).toBe("hace 3 meses");
    expect(formatRelativeSpanish(ago(3 * 365 * 86400), now)).toBe("hace 3 años");
  });

  it("usa la palabra cuando la hay: ayer, el mes pasado, el año pasado", () => {
    expect(formatRelativeSpanish(ago(86400), now)).toBe("ayer");
    expect(formatRelativeSpanish(ago(31 * 86400), now)).toBe("el mes pasado");
    expect(formatRelativeSpanish(ago(366 * 86400), now)).toBe("el año pasado");
  });

  it("una fecha futura, por un reloj adelantado, cuenta como ahora", () => {
    expect(formatRelativeSpanish(new Date(now.getTime() + 60_000), now)).toBe("ahora mismo");
  });
});

import { describe, expect, it } from "vitest";
import { formatTime, handAngles } from "./use-chess-clock.hook";

describe("formatTime", () => {
  it("muestra minutos y segundos, redondeando hacia arriba el segundo en curso", () => {
    expect(formatTime(180)).toBe("3:00");
    expect(formatTime(179.2)).toBe("3:00");
    expect(formatTime(65)).toBe("1:05");
    expect(formatTime(0)).toBe("0:00");
  });

  it("por debajo de veinte segundos añade las décimas", () => {
    expect(formatTime(19.94)).toBe("0:20.9");
    expect(formatTime(4.25)).toBe("0:05.2");
    expect(formatTime(20)).toBe("0:20");
  });
});

describe("handAngles", () => {
  it("convierte el tiempo restante en los ángulos de las tres agujas", () => {
    expect(handAngles(0)).toEqual({ hour: 0, min: 0, sec: 0 });
    // 90 segundos: la de segundos a media vuelta, la de minutos a minuto y medio.
    expect(handAngles(90)).toEqual({ hour: 0.75, min: 9, sec: 180 });
    // Una hora: la aguja horaria en la una.
    expect(handAngles(3600)).toEqual({ hour: 30, min: 0, sec: 0 });
  });
});

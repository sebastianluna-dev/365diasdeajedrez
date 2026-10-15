import { describe, expect, it } from "vitest";
import { CURRENCY } from "@/constants/platform/currency-codes.const";
import { amountToCents, formatClassAmount, perClassAmount } from "./format-class-amount";

describe("formatClassAmount", () => {
  it("escribe el importe con su símbolo y su código", () => {
    expect(formatClassAmount("1400.00", CURRENCY.MXN)).toBe("$1,400.00 MXN");
    expect(formatClassAmount("1400", CURRENCY.USD)).toBe("$1,400.00 USD");
    expect(formatClassAmount("99.5", CURRENCY.EUR)).toBe("€99.50 EUR");
  });

  it("sin el código, sólo el símbolo", () => {
    expect(formatClassAmount("350.00", CURRENCY.MXN, { withCode: false })).toBe("$350.00");
  });
});

describe("amountToCents", () => {
  it("lee el decimal sin pasar por un flotante", () => {
    expect(amountToCents("1400.00")).toBe(140000);
    expect(amountToCents("0.1")).toBe(10);
    expect(amountToCents("19.99")).toBe(1999);
    expect(amountToCents("7")).toBe(700);
  });
});

describe("perClassAmount", () => {
  it("reparte en centavos enteros, redondeando hacia abajo", () => {
    expect(perClassAmount("1400.00", 4, CURRENCY.MXN)).toBe("$350.00");
    expect(perClassAmount("700.00", 2, CURRENCY.MXN)).toBe("$350.00");
    expect(perClassAmount("100.00", 3, CURRENCY.MXN)).toBe("$33.33");
    expect(perClassAmount("100.00", 0, CURRENCY.MXN)).toBe("$0.00");
  });
});

import { describe, expect, it } from "vitest";
import { postmarkDate, postmarkText } from "./postmark";

describe("postmarkDate", () => {
  it("says the day in Mexico City's time, not the server's", () => {
    // 03:30 UTC on the 15th is still the evening of the 14th in Mexico City (UTC-6).
    expect(postmarkText(new Date("2026-09-15T03:30:00Z"))).toBe("14 SEP 2026");
    expect(postmarkText(new Date("2026-09-15T12:00:00Z"))).toBe("15 SEP 2026");
  });

  it("writes the month in three capitals and the day with no zero", () => {
    expect(postmarkDate(new Date("2026-01-05T18:00:00Z"))).toEqual({ day: "5", month: "ENE", year: "2026" });
    expect(postmarkDate(new Date("2026-12-31T18:00:00Z")).month).toBe("DIC");
  });
});

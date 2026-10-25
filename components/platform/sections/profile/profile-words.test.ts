import { describe, expect, it } from "vitest";
import { fixtureProfileView } from "@/lib/testing/fixtures/profile";
import { playWords, shortDate, streakWords, studyWords } from "./profile-words";

const OWN = { isOwn: true };
const THEIRS = { isOwn: false };
const RULES = { window: 10, minimum: 5 };

describe("the profile's sentences", () => {
  const profile = fixtureProfileView();

  it("say how this month goes against the last, in the voice of whoever reads", () => {
    const own = studyWords(profile.studyMonths, OWN);
    expect(own.eyebrow).toBe("Estudio · octubre");
    expect(own.heading).toBe("Octubre ya rebasó a todo septiembre");
    expect(own.lead).toMatch(/^Llevas \d+ minutos de lecciones en 25 días; septiembre completo sumó \d+\.$/);
    expect(own.range).toBe("Del 1 al 25 de octubre");
    expect(own.current).toHaveLength(25);
    expect(studyWords(profile.studyMonths, THEIRS).lead).toMatch(/^Lleva /);
  });

  it("say a month with nothing yet as what will come", () => {
    const empty = {
      ...profile.studyMonths,
      current: { ...profile.studyMonths.current, days: [{ day: "2026-10-01", minutes: 0 }] },
      previous: { ...profile.studyMonths.previous, days: [] },
    };
    const words = studyWords(empty, OWN);
    expect(words.heading).toBe("Octubre todavía no tiene minutos de lecciones");
    expect(words.tag).toBeNull();
  });

  it("read the streak, and never count games in it", () => {
    const own = streakWords(profile.streak, OWN);
    expect(own.heading).toBe("12 días seguidos, y hoy ya cuenta");
    expect(own.tag).toBe("12 días");
    expect(own.weekDays).toBe(7);
    expect(own.sheetNote).toBe("Hoy ya estudiaste · la mejor, 19");
    expect(streakWords({ ...profile.streak, streak: { days: 3, studiedToday: false } }, THEIRS).heading).toBe(
      "3 días seguidos; hoy aún no estudia",
    );
    expect(streakWords({ ...profile.streak, streak: { days: 0, studiedToday: false } }, OWN).tag).toBeUndefined();
  });

  it("read the level, the share won and the record against each bot", () => {
    const own = playWords(profile.botLevel, profile.record, profile.botRecords, OWN, RULES);
    expect(own.heading).toBe("Tu nivel contra los bots subió a ≈ 850");
    expect(own.lead).toBe("+54 desde el 13 oct, con 13 ganadas de 23 partidas terminadas.");
    expect(own.winShare).toBe(56.5);
    expect(own.points).toHaveLength(10);
    expect(own.barsReads).toContain("Mariana");
    const theirs = playWords(profile.botLevel, profile.record, profile.botRecords, THEIRS, RULES);
    expect(theirs.heading).toMatch(/^Su nivel/);
  });

  it("say what is missing before there is a level", () => {
    const none = playWords(
      { level: null, sampleSize: 0, series: [] },
      { wins: 0, losses: 0, draws: 0, open: 0 },
      [],
      OWN,
      RULES,
    );
    expect(none.heading).toBe("Todavía sin partidas contra los bots");
    expect(none.winShare).toBeNull();
    const three = playWords(
      { level: null, sampleSize: 3, series: [] },
      { wins: 2, losses: 1, draws: 0, open: 0 },
      [],
      OWN,
      RULES,
    );
    expect(three.levelNote).toBe("Faltan 2 partidas terminadas para calcularlo");
  });

  it("write a day as «13 oct», in the study day's calendar", () => {
    // 03:00 UTC on the 14th is still the 13th in Mexico City.
    expect(shortDate(new Date("2026-10-14T03:00:00Z"))).toBe("13 oct");
  });
});

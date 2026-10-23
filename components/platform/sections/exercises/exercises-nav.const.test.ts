import { describe, expect, it } from "vitest";
import { exercisesNavAction, exercisesNavGroups, type ExercisesNavData } from "./exercises-nav.const";

const DATA: ExercisesNavData = {
  topics: [
    { code: "TACTICS", label: "Táctica", parentCode: null },
    ...["A", "B", "C", "D", "E", "F", "G"].map((letter) => ({
      code: `SUB_${letter}`,
      label: `Subtema ${letter}`,
      parentCode: "TACTICS",
    })),
    { code: "ENDGAME", label: "Finales", parentCode: null },
  ],
  levels: [
    { slug: "inicial", name: "Inicial", range: "hasta 1199" },
    { slug: "intermedio", name: "Intermedio", range: "1200–1599" },
  ],
  teacherSeriesIds: ["s1", "s2"],
  academySeriesIds: ["a1"],
};

const at = (url: string) => {
  const parsed = new URL(url, "https://x.invalid");
  return { pathname: parsed.pathname, params: parsed.searchParams };
};

// The topics and «Tuyo»: what is lit as a view, not as a level's ring.
const lit = (groups: ReturnType<typeof exercisesNavGroups>["groups"]) =>
  groups
    .filter((group) => group.title !== "Nivel")
    .flatMap((group) => group.links.flatMap((link) => [link, ...(link.subLinks ?? [])]).filter((link) => link.current));

describe("the side column of «Ejercicios»", () => {
  it("lights «Todos los temas» on the bare page and opens no topic", () => {
    const { groups } = exercisesNavGroups(DATA, at("/ejercicios"), false);
    expect(lit(groups).map((link) => link.label)).toEqual(["Todos los temas"]);
    expect(groups[0]?.links.every((link) => link.subLinks === undefined)).toBe(true);
  });

  it("opens the parent of the subtopic on screen, five subtopics and the count of the rest", () => {
    const { groups, hiddenSubtopics } = exercisesNavGroups(DATA, at("/ejercicios?tema=SUB_B&nivel=intermedio"), false);
    const tactics = groups[0]?.links.find((link) => link.label === "Táctica");
    expect(tactics?.subLinks?.map((link) => link.label)).toEqual([
      "Subtema A",
      "Subtema B",
      "Subtema C",
      "Subtema D",
      "Subtema E",
    ]);
    expect(hiddenSubtopics).toBe(2);
    expect(lit(groups).map((link) => link.label)).toEqual(["Subtema B"]);
    // A topic keeps the level chosen.
    expect(tactics?.href).toBe("/ejercicios?tema=TACTICS&nivel=intermedio");
  });

  it("shows every subtopic when expanded, or when the one on screen is past the fifth", () => {
    expect(exercisesNavGroups(DATA, at("/ejercicios?tema=TACTICS"), true).hiddenSubtopics).toBe(0);
    expect(exercisesNavGroups(DATA, at("/ejercicios?tema=SUB_G"), false).hiddenSubtopics).toBe(0);
  });

  it("lights a series' view on its pages, the teacher's or the academy's", () => {
    expect(lit(exercisesNavGroups(DATA, at("/ejercicios/series"), false).groups)[0]?.label).toBe("De tu profesor");
    expect(lit(exercisesNavGroups(DATA, at("/ejercicios/series?de=academia"), false).groups)[0]?.label).toBe(
      "Series de la academia",
    );
    expect(lit(exercisesNavGroups(DATA, at("/ejercicios/series/s2/3"), false).groups)[0]?.label).toBe("De tu profesor");
    expect(lit(exercisesNavGroups(DATA, at("/ejercicios/series/a1"), false).groups)[0]?.label).toBe(
      "Series de la academia",
    );
  });

  it("counts the teacher's series, and leaves out the academy's view when it has none", () => {
    const { groups } = exercisesNavGroups({ ...DATA, academySeriesIds: [] }, at("/ejercicios/historial"), false);
    expect(groups[1]?.links.map((link) => [link.label, link.count])).toEqual([
      ["De tu profesor", 2],
      ["Historial", undefined],
    ]);
    expect(lit(groups).map((link) => link.label)).toEqual(["Historial"]);
  });

  it("fills «Puzzle Rush» only on its own page", () => {
    expect(exercisesNavAction(at("/puzzle-rush")).current).toBe(true);
    expect(exercisesNavAction(at("/ejercicios")).current).toBe(false);
  });

  it("offers the levels on the trainer only, as rings that keep the topic, the one in the address lit", () => {
    const { groups } = exercisesNavGroups(DATA, at("/ejercicios?tema=ENDGAME&nivel=intermedio"), false);
    const levels = groups.find((group) => group.title === "Nivel");
    expect(levels?.links.map((link) => [link.label, link.href, link.current, link.choice])).toEqual([
      ["Todos los niveles", "/ejercicios?tema=ENDGAME", false, true],
      ["Inicial", "/ejercicios?tema=ENDGAME&nivel=inicial", false, true],
      ["Intermedio", "/ejercicios?tema=ENDGAME&nivel=intermedio", true, true],
    ]);
    expect(
      exercisesNavGroups(DATA, at("/ejercicios/historial"), false).groups.some((group) => group.title === "Nivel"),
    ).toBe(false);
  });
});

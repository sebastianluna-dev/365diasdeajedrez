import { describe, expect, it } from "vitest";
import type { StudySummary } from "@/services/studies/studies.types";
import { studyPermissionsOf } from "@/services/studies/study-rules";
import {
  resumeStudyOf,
  studiesHref,
  studiesNavGroups,
  studiesOfView,
  studySortOf,
  studyViewOf,
} from "./studies-nav.const";

function study(id: string, overrides: Partial<StudySummary> & { own?: boolean } = {}): StudySummary {
  const { own = true, ...rest } = overrides;
  return {
    id,
    name: id,
    kindLabel: "Estudio",
    kindCode: "STUDY",
    gameCount: 1,
    updatedAtLabel: "",
    updatedAgoLabel: "",
    recentAt: "2026-01-01T00:00:00.000Z",
    boardFen: "",
    boardOrientation: "white",
    searchText: id,
    isCourseStudy: false,
    permissions: studyPermissionsOf({ kindCode: rest.kindCode ?? "STUDY", isOwner: own }),
    citedGameCount: 0,
    href: `/estudios/${id}`,
    ...rest,
  };
}

const LIBRARY = [
  study("mine", { kindCode: "MY_GAMES", gameCount: 42, recentAt: "2026-10-20T00:00:00.000Z" }),
  study("abierto", { kindCode: "TOURNAMENT", gameCount: 9, recentAt: "2026-10-23T00:00:00.000Z" }),
  study("najdorf", { gameCount: 14, recentAt: "2026-10-15T00:00:00.000Z" }),
  study("compartida", { kindCode: "COLLECTION", own: false, gameCount: 12 }),
];

describe("the views of «Mis estudios»", () => {
  it("reads only the values it knows from the address", () => {
    expect(studyViewOf("torneos")).toBe("torneos");
    expect(studyViewOf("cualquiera")).toBeUndefined();
    expect(studySortOf("nombre")).toBe("nombre");
    expect(studySortOf(undefined)).toBeUndefined();
  });

  it("shows a kind of their own, or what they received, in the order asked", () => {
    expect(studiesOfView(LIBRARY, undefined, undefined).map((s) => s.id)).toEqual([
      "abierto",
      "mine",
      "najdorf",
      "compartida",
    ]);
    expect(studiesOfView(LIBRARY, "torneos", undefined).map((s) => s.id)).toEqual(["abierto"]);
    expect(studiesOfView(LIBRARY, "recibidos", undefined).map((s) => s.id)).toEqual(["compartida"]);
    expect(studiesOfView(LIBRARY, undefined, "partidas").map((s) => s.id)).toEqual([
      "mine",
      "najdorf",
      "compartida",
      "abierto",
    ]);
  });

  it("keeps the other choice in each link, and leaves the defaults out of the address", () => {
    expect(studiesHref(undefined, undefined)).toBe("/estudios");
    expect(studiesHref("torneos", "nombre")).toBe("/estudios?tipo=torneos&orden=nombre");
    const [kinds, sorts] = studiesNavGroups(LIBRARY, "torneos", "nombre");
    expect(kinds?.links.map((link) => [link.label, link.count, link.current])).toEqual([
      ["Todos", 4, false],
      ["Mis partidas", 1, false],
      ["Estudios", 1, false],
      ["Torneos", 1, true],
      ["Recibidos", 1, false],
    ]);
    expect(kinds?.links[0]?.href).toBe("/estudios?orden=nombre");
    expect(sorts?.links.map((link) => [link.href, link.current, link.choice])).toEqual([
      ["/estudios?tipo=torneos", false, true],
      ["/estudios?tipo=torneos&orden=nombre", true, true],
      ["/estudios?tipo=torneos&orden=partidas", false, true],
    ]);
  });

  it("goes on with the study whose game was opened last", () => {
    const resume = { players: "Pérez — Gómez", openedAgoLabel: "hace 2 horas" };
    const opened = [
      study("antes", { recentAt: "2026-10-01T00:00:00.000Z", resume }),
      study("despues", { recentAt: "2026-10-22T00:00:00.000Z", resume }),
      study("nunca", { recentAt: "2026-10-23T00:00:00.000Z" }),
    ];
    expect(resumeStudyOf(opened)?.id).toBe("despues");
    expect(resumeStudyOf(LIBRARY)).toBeUndefined();
  });
});

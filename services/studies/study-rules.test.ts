import { describe, expect, it } from "vitest";

import { DATABASE_KIND } from "@/constants/platform/study-codes.const";
import {
  canChangeKindTo,
  canCreateKind,
  creatableKinds,
  studyPermissionsOf,
} from "@/services/studies/study-rules";

const OWNED = { isOwner: true };
const RECEIVED = { isOwner: false };

describe("qué puede crear cada quien", () => {
  it("el alumno crea estudios y torneos, y nada más", () => {
    expect(creatableKinds(false)).toEqual([DATABASE_KIND.STUDY, DATABASE_KIND.TOURNAMENT]);
  });

  it("«Mis partidas» no se crea a mano: nace con la cuenta", () => {
    expect(canCreateKind(DATABASE_KIND.MY_GAMES, false)).toBe(false);
    expect(canCreateKind(DATABASE_KIND.MY_GAMES, true)).toBe(false);
  });

  it("el alumno no puede crearse una colección; el profesor sí", () => {
    expect(canCreateKind(DATABASE_KIND.COLLECTION, false)).toBe(false);
    expect(canCreateKind(DATABASE_KIND.COLLECTION, true)).toBe(true);
  });

  it("un code inventado no cuela", () => {
    expect(canCreateKind("REPERTOIRE", true)).toBe(false);
    expect(canCreateKind("", false)).toBe(false);
  });
});

describe("colección: sólo lectura para quien la recibe", () => {
  const received = studyPermissionsOf({ kindCode: DATABASE_KIND.COLLECTION, ...RECEIVED });

  it("no deja tocar nada de lo que la spec prohíbe", () => {
    expect(received).toEqual({ canEdit: false, canDelete: false, canEditGames: false, canChangeKind: false });
  });

  it("pero quien la reparte sí la mantiene", () => {
    const owned = studyPermissionsOf({ kindCode: DATABASE_KIND.COLLECTION, ...OWNED });
    expect(owned.canEditGames).toBe(true);
    expect(owned.canDelete).toBe(true);
  });

  it("y ni siquiera su dueño puede convertirla en otra cosa", () => {
    expect(studyPermissionsOf({ kindCode: DATABASE_KIND.COLLECTION, ...OWNED }).canChangeKind).toBe(false);
  });
});

describe("«Mis partidas»", () => {
  const mine = studyPermissionsOf({ kindCode: DATABASE_KIND.MY_GAMES, ...OWNED });

  it("acepta partidas pero no se borra", () => {
    expect(mine.canEditGames).toBe(true);
    expect(mine.canDelete).toBe(false);
  });

  it("no puede dejar de ser «Mis partidas»", () => {
    expect(canChangeKindTo({ kindCode: DATABASE_KIND.MY_GAMES, ...OWNED }, DATABASE_KIND.STUDY)).toBe(false);
  });
});

describe("torneo y estudio", () => {
  it("son del alumno de principio a fin", () => {
    for (const kindCode of [DATABASE_KIND.TOURNAMENT, DATABASE_KIND.STUDY]) {
      expect(studyPermissionsOf({ kindCode, ...OWNED })).toEqual({
        canEdit: true,
        canDelete: true,
        canEditGames: true,
        canChangeKind: true,
      });
    }
  });

  it("se convierten entre sí", () => {
    expect(canChangeKindTo({ kindCode: DATABASE_KIND.STUDY, ...OWNED }, DATABASE_KIND.TOURNAMENT)).toBe(true);
    expect(canChangeKindTo({ kindCode: DATABASE_KIND.TOURNAMENT, ...OWNED }, DATABASE_KIND.STUDY)).toBe(true);
  });

  it("pero no en colección ni en «Mis partidas»", () => {
    expect(canChangeKindTo({ kindCode: DATABASE_KIND.STUDY, ...OWNED }, DATABASE_KIND.COLLECTION)).toBe(false);
    expect(canChangeKindTo({ kindCode: DATABASE_KIND.STUDY, ...OWNED }, DATABASE_KIND.MY_GAMES)).toBe(false);
  });

  it("el estudio de un alumno es intocable para quien lo mira de fuera", () => {
    expect(studyPermissionsOf({ kindCode: DATABASE_KIND.STUDY, ...RECEIVED }).canEditGames).toBe(false);
  });
});

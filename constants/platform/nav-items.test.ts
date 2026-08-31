import { describe, expect, it } from "vitest";
import {
  activeNavHref,
  buildPlatformNavGroups,
  STAFF_NAV_ITEMS,
  STUDENT_NAV_ITEMS,
  TEACHER_NAV_ITEMS,
} from "./nav-items.const";

describe("buildPlatformNavGroups", () => {
  it("da sólo el grupo base al alumno, sin encabezado", () => {
    const groups = buildPlatformNavGroups({ isTeacher: false, isStaff: false });
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBeUndefined();
    expect(groups[0].items).toEqual(STUDENT_NAV_ITEMS);
  });

  it("apila el grupo del profesor sobre el del alumno", () => {
    const groups = buildPlatformNavGroups({ isTeacher: true, isStaff: false });
    expect(groups.map((group) => group.label)).toEqual([undefined, "Profesor"]);
    expect(groups[1].items).toEqual(TEACHER_NAV_ITEMS);
  });

  it("acumula ambos roles: son ortogonales, no excluyentes", () => {
    const groups = buildPlatformNavGroups({ isTeacher: true, isStaff: true });
    expect(groups.map((group) => group.label)).toEqual([undefined, "Profesor", "Administración"]);
    expect(groups[2].items).toEqual(STAFF_NAV_ITEMS);
  });
});

describe("activeNavHref", () => {
  const groups = buildPlatformNavGroups({ isTeacher: true, isStaff: true });

  it("marca la coincidencia exacta", () => {
    expect(activeNavHref(groups, "/dashboard")).toBe("/dashboard");
  });

  it("marca el ítem por prefijo en las rutas hijas", () => {
    expect(activeNavHref(groups, "/studies/abc/games/xyz")).toBe("/studies");
  });

  it("se queda con la coincidencia más larga y no enciende dos ítems", () => {
    expect(activeNavHref(groups, "/teacher/students")).toBe("/teacher/students");
    expect(activeNavHref(groups, "/teacher/students/abc")).toBe("/teacher/students");
    expect(activeNavHref(groups, "/teacher")).toBe("/teacher");
    expect(activeNavHref(groups, "/staff/courses/abc/chapters/def")).toBe("/staff/courses");
  });

  it("no marca nada fuera de la plataforma", () => {
    expect(activeNavHref(groups, "/login")).toBeNull();
  });

  it("no confunde un prefijo textual con una ruta hija", () => {
    // "/staff" no debe encenderse en "/stafftest".
    expect(activeNavHref(groups, "/stafftest")).toBeNull();
  });
});

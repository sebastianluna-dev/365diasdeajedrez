import { describe, expect, it } from "vitest";
import {
  activeNavHref,
  buildPlatformNavGroups,
  STAFF_NAV_ITEMS,
  STUDENT_NAV_ITEMS,
  TEACHER_NAV_ITEMS,
} from "./nav-items.const";

describe("buildPlatformNavGroups", () => {
  it("da sólo el grupo del alumno, sin encabezado", () => {
    const groups = buildPlatformNavGroups({ isTeacher: false, isStaff: false }, { play: false });
    expect(groups).toHaveLength(1);
    expect(groups[0]?.label).toBeUndefined();
    expect(groups[0]?.items).toEqual(STUDENT_NAV_ITEMS);
  });

  it("sustituye el menú del alumno por el del profesor, no lo apila", () => {
    const groups = buildPlatformNavGroups({ isTeacher: true, isStaff: false }, { play: false });
    expect(groups).toHaveLength(1);
    expect(groups[0]?.label).toBe("Profesor");
    expect(groups[0]?.items).toEqual(TEACHER_NAV_ITEMS);
  });

  it("da el menú de administración al staff", () => {
    const groups = buildPlatformNavGroups({ isTeacher: false, isStaff: true });
    expect(groups).toHaveLength(1);
    expect(groups[0]?.items).toEqual(STAFF_NAV_ITEMS);
  });

  it("ofrece el explorador tanto al alumno como al profesor", () => {
    // It is a cross-cutting tool: who sees which games is decided by the
    // visibility filter, not the menu.
    const hasExplorer = (items: { href: string }[]) => items.some((item) => item.href === "/explorador");

    expect(hasExplorer(STUDENT_NAV_ITEMS)).toBe(true);
    expect(hasExplorer(TEACHER_NAV_ITEMS)).toBe(true);
  });

  it("pone «Jugar» antes del explorador para el alumno y el profesor sólo con su interruptor encendido", () => {
    const hrefs = (roles: { isTeacher: boolean; isStaff: boolean }, play: boolean) =>
      buildPlatformNavGroups(roles, { play }).flatMap((group) => group.items.map((item) => item.href));
    const student = { isTeacher: false, isStaff: false };
    const teacher = { isTeacher: true, isStaff: false };
    expect(hrefs(student, true)).toEqual(["/inicio", "/clases", "/estudios", "/cursos", "/jugar", "/explorador"]);
    expect(hrefs(teacher, true).slice(-3)).toEqual(["/jugar", "/explorador", "/profesor/perfil"]);
    expect(hrefs(student, false)).not.toContain("/jugar");
    expect(hrefs({ isTeacher: false, isStaff: true }, true)).not.toContain("/jugar");
  });

  it("con varios roles manda el de mayor alcance: staff sobre profesor", () => {
    const groups = buildPlatformNavGroups({ isTeacher: true, isStaff: true });
    expect(groups).toHaveLength(1);
    expect(groups[0]?.label).toBe("Administración");
    expect(groups[0]?.items).toEqual(STAFF_NAV_ITEMS);
  });
});

describe("activeNavHref", () => {
  const alumno = buildPlatformNavGroups({ isTeacher: false, isStaff: false });
  const profesor = buildPlatformNavGroups({ isTeacher: true, isStaff: false });
  const staff = buildPlatformNavGroups({ isTeacher: false, isStaff: true });

  it("marca la coincidencia exacta", () => {
    expect(activeNavHref(alumno, "/inicio")).toBe("/inicio");
  });

  it("marca el ítem por prefijo en las rutas hijas", () => {
    expect(activeNavHref(alumno, "/estudios/abc/partidas/xyz")).toBe("/estudios");
  });

  it("se queda con la coincidencia más larga y no enciende dos ítems", () => {
    expect(activeNavHref(profesor, "/profesor/alumnos")).toBe("/profesor/alumnos");
    expect(activeNavHref(profesor, "/profesor/alumnos/abc")).toBe("/profesor/alumnos");
    expect(activeNavHref(profesor, "/profesor")).toBe("/profesor");
    expect(activeNavHref(staff, "/administracion/cursos/abc/capitulos/def")).toBe("/administracion/cursos");
  });

  it("no marca nada fuera de la plataforma", () => {
    expect(activeNavHref(alumno, "/iniciar-sesion")).toBeNull();
  });

  it("no marca las áreas del alumno en el menú del profesor", () => {
    // With the exclusive menu, a teacher who enters /estudios (still theirs as
    // a user) has no item to light up.
    expect(activeNavHref(profesor, "/estudios")).toBeNull();
  });

  it("no confunde un prefijo textual con una ruta hija", () => {
    // "/profesor" must not light up on "/profesorado".
    expect(activeNavHref(profesor, "/profesorado")).toBeNull();
  });
});

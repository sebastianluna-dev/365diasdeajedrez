import { describe, expect, it } from "vitest";
import {
  activeNavHref,
  buildPlatformNavGroups,
  isNavDropdown,
  type PlatformNavFeatures,
  type PlatformNavGroup,
  STAFF_NAV_ITEMS,
} from "./nav-items.const";

const ALL_ON: PlatformNavFeatures = { play: true, analysisBoard: true, trainer: true };
const ALL_OFF: PlatformNavFeatures = { play: false, analysisBoard: false, trainer: false };
const STUDENT = { isTeacher: false, isStaff: false };
const TEACHER = { isTeacher: true, isStaff: false };
const STAFF = { isTeacher: false, isStaff: true };

/** Every address of a menu, a dropdown's tools in place of the dropdown. */
const hrefsOf = (groups: PlatformNavGroup[]) =>
  groups.flatMap((group) =>
    group.items.flatMap((entry) => (isNavDropdown(entry) ? entry.items.map((item) => item.href) : [entry.href])),
  );

/** What the bar shows at its top level: a link's label or a dropdown's. */
const labelsOf = (groups: PlatformNavGroup[]) => groups.flatMap((group) => group.items.map((entry) => entry.label));

describe("buildPlatformNavGroups", () => {
  it("da sólo el grupo del alumno, sin encabezado", () => {
    const groups = buildPlatformNavGroups(STUDENT, ALL_OFF);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.label).toBeUndefined();
    expect(labelsOf(groups)).toEqual(["Inicio", "Mis clases", "Mis estudios", "Mis cursos", "Explorador"]);
  });

  it("sustituye el menú del alumno por el del profesor, no lo apila", () => {
    const groups = buildPlatformNavGroups(TEACHER, ALL_OFF);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.label).toBe("Profesor");
    expect(labelsOf(groups)).toEqual([
      "Panel del profesor",
      "Mis alumnos",
      "Clases que imparto",
      "Explorador",
      "Mi ficha",
    ]);
  });

  it("da el menú de administración al staff, sin «Jugar» ni «Herramientas»", () => {
    const groups = buildPlatformNavGroups(STAFF, ALL_ON);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.items).toEqual(STAFF_NAV_ITEMS);
  });

  it("con varios roles manda el de mayor alcance: staff sobre profesor", () => {
    const groups = buildPlatformNavGroups({ isTeacher: true, isStaff: true }, ALL_ON);
    expect(groups[0]?.label).toBe("Administración");
    expect(groups[0]?.items).toEqual(STAFF_NAV_ITEMS);
  });

  it("ofrece el explorador al alumno y al profesor, de primer nivel o dentro de «Herramientas»", () => {
    // It is a cross-cutting tool: who sees which games is decided by the
    // visibility filter, not the menu.
    for (const features of [ALL_ON, ALL_OFF]) {
      expect(hrefsOf(buildPlatformNavGroups(STUDENT, features))).toContain("/explorador");
      expect(hrefsOf(buildPlatformNavGroups(TEACHER, features))).toContain("/explorador");
    }
  });

  it("con todo encendido, reúne las herramientas en un desplegable después de «Jugar»", () => {
    const groups = buildPlatformNavGroups(STUDENT, ALL_ON);
    expect(labelsOf(groups)).toEqual(["Inicio", "Mis clases", "Mis estudios", "Mis cursos", "Jugar", "Herramientas"]);
    const tools = groups[0]?.items.find(isNavDropdown);
    expect(tools?.items.map((item) => item.label)).toEqual(["Tablero de análisis", "Explorador", "Entrenador"]);
    expect(tools?.items.every((item) => item.description.length > 0)).toBe(true);
    expect(labelsOf(buildPlatformNavGroups(TEACHER, ALL_ON)).slice(-3)).toEqual(["Jugar", "Herramientas", "Mi ficha"]);
  });

  it("deja fuera lo apagado: «Jugar» sin su interruptor, el entrenador sin el suyo", () => {
    const noPlay = buildPlatformNavGroups(STUDENT, { ...ALL_ON, play: false });
    expect(hrefsOf(noPlay)).not.toContain("/jugar");
    const noTrainer = buildPlatformNavGroups(STUDENT, { ...ALL_ON, trainer: false });
    expect(hrefsOf(noTrainer)).not.toContain("/entrenador");
    const noBoard = buildPlatformNavGroups(STUDENT, { ...ALL_ON, analysisBoard: false });
    expect(labelsOf(noBoard)).toEqual(["Inicio", "Mis clases", "Mis estudios", "Mis cursos", "Jugar", "Explorador"]);
  });
});

describe("activeNavHref", () => {
  const alumno = buildPlatformNavGroups(STUDENT, ALL_ON);
  const profesor = buildPlatformNavGroups(TEACHER, ALL_ON);
  const staff = buildPlatformNavGroups(STAFF, ALL_ON);

  it("marca la coincidencia exacta", () => {
    expect(activeNavHref(alumno, "/inicio")).toBe("/inicio");
  });

  it("marca el ítem por prefijo en las rutas hijas", () => {
    expect(activeNavHref(alumno, "/estudios/abc/partidas/xyz")).toBe("/estudios");
  });

  it("encuentra una herramienta dentro de su desplegable", () => {
    expect(activeNavHref(alumno, "/herramientas/tablero-de-analisis")).toBe("/herramientas/tablero-de-analisis");
    expect(activeNavHref(profesor, "/explorador")).toBe("/explorador");
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

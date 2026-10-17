import { describe, expect, it } from "vitest";
import {
  activeNavHref,
  buildPlatformNavGroups,
  isNavDropdown,
  needsStudentExerciseAccess,
  type PlatformNavFeatures,
  type PlatformNavGroup,
  STAFF_NAV_ITEMS,
} from "./nav-items.const";

const ALL_ON: PlatformNavFeatures = { play: true, analysisBoard: true, trainer: true, exercises: "all" };
const ALL_OFF: PlatformNavFeatures = { play: false, analysisBoard: false, trainer: false, exercises: false };
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

  it("da el menú de administración al staff, sin «Jugar» ni «Herramientas»; sólo «Ejercicios» con su interruptor", () => {
    const groups = buildPlatformNavGroups(STAFF, ALL_ON);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.items.filter((item) => item.label !== "Ejercicios")).toEqual(STAFF_NAV_ITEMS);
    expect(buildPlatformNavGroups(STAFF, ALL_OFF)[0]?.items).toEqual(STAFF_NAV_ITEMS);
  });

  it("con varios roles manda el de mayor alcance: staff sobre profesor", () => {
    const groups = buildPlatformNavGroups({ isTeacher: true, isStaff: true }, ALL_OFF);
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
    expect(labelsOf(groups)).toEqual([
      "Inicio",
      "Mis clases",
      "Mis estudios",
      "Mis cursos",
      "Ejercicios",
      "Jugar",
      "Herramientas",
    ]);
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
    const noBoard = buildPlatformNavGroups(STUDENT, { ...ALL_ON, analysisBoard: false, exercises: false });
    expect(labelsOf(noBoard)).toEqual(["Inicio", "Mis clases", "Mis estudios", "Mis cursos", "Jugar", "Explorador"]);
  });

  it("da «Ejercicios» al profesor después de sus clases, sólo con su interruptor", () => {
    expect(labelsOf(buildPlatformNavGroups(TEACHER, ALL_ON)).slice(0, 4)).toEqual([
      "Panel del profesor",
      "Mis alumnos",
      "Clases que imparto",
      "Ejercicios",
    ]);
    expect(hrefsOf(buildPlatformNavGroups(TEACHER, ALL_ON))).toContain("/profesor/ejercicios");
    expect(hrefsOf(buildPlatformNavGroups(TEACHER, { ...ALL_ON, exercises: false }))).not.toContain(
      "/profesor/ejercicios",
    );
    expect(hrefsOf(buildPlatformNavGroups(TEACHER, { ...ALL_ON, exercises: "withTeacher" }))).toContain(
      "/profesor/ejercicios",
    );
    // The staff's menu is the panel's: «Ejercicios» after «Cursos» with the switch (phase 4), never the teacher's bank.
    expect(hrefsOf(buildPlatformNavGroups(STAFF, ALL_ON))).not.toContain("/profesor/ejercicios");
    expect(labelsOf(buildPlatformNavGroups(STAFF, ALL_ON))).toEqual([
      "Administración",
      "Alumnos",
      "Profesores",
      "Cursos",
      "Ejercicios",
      "Clases",
    ]);
    expect(hrefsOf(buildPlatformNavGroups(STAFF, ALL_ON))).toContain("/administracion/ejercicios");
    expect(hrefsOf(buildPlatformNavGroups(STAFF, { ...ALL_ON, exercises: false }))).not.toContain(
      "/administracion/ejercicios",
    );
    // A teacher's menu never carries the student's section, whatever they have.
    expect(hrefsOf(buildPlatformNavGroups({ ...TEACHER, hasExerciseSource: true }, ALL_ON))).not.toContain(
      "/ejercicios",
    );
  });

  it("da «Ejercicios» al alumno después de sus cursos: a todos, a quien tiene algo ahí, o a nadie", () => {
    const labels = (features: PlatformNavFeatures, hasExerciseSource?: boolean) =>
      labelsOf(buildPlatformNavGroups({ ...STUDENT, hasExerciseSource }, { ...ALL_OFF, ...features }));
    const withItem = ["Inicio", "Mis clases", "Mis estudios", "Mis cursos", "Ejercicios", "Explorador"];
    const withoutItem = ["Inicio", "Mis clases", "Mis estudios", "Mis cursos", "Explorador"];

    // "all": every student, with or without a teacher (phase 4, the library).
    expect(labels({ ...ALL_OFF, exercises: "all" })).toEqual(withItem);
    expect(labels({ ...ALL_OFF, exercises: "all" }, false)).toEqual(withItem);
    // "withTeacher": only one with an active teacher or a series given (phases 1–3).
    expect(labels({ ...ALL_OFF, exercises: "withTeacher" }, true)).toEqual(withItem);
    expect(labels({ ...ALL_OFF, exercises: "withTeacher" }, false)).toEqual(withoutItem);
    expect(labels({ ...ALL_OFF, exercises: "withTeacher" })).toEqual(withoutItem);
    // Off: nobody, whatever they have.
    expect(labels({ ...ALL_OFF, exercises: false }, true)).toEqual(withoutItem);
    expect(hrefsOf(buildPlatformNavGroups({ ...STUDENT, hasExerciseSource: true }, ALL_ON))).toContain("/ejercicios");
  });

  it("pregunta a la base por lo del alumno sólo cuando el ítem depende de ello", () => {
    const withTeacher: PlatformNavFeatures = { ...ALL_OFF, exercises: "withTeacher" };
    expect(needsStudentExerciseAccess(STUDENT, withTeacher)).toBe(true);
    expect(needsStudentExerciseAccess(TEACHER, withTeacher)).toBe(false);
    expect(needsStudentExerciseAccess(STAFF, withTeacher)).toBe(false);
    expect(needsStudentExerciseAccess(STUDENT, ALL_ON)).toBe(false);
    expect(needsStudentExerciseAccess(STUDENT, ALL_OFF)).toBe(false);
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
    expect(activeNavHref(profesor, "/profesor/ejercicios/abc")).toBe("/profesor/ejercicios");
    expect(activeNavHref(alumno, "/ejercicios/series/abc/2")).toBe("/ejercicios");
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

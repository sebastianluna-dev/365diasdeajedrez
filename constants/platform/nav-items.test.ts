import { describe, expect, it } from "vitest";
import {
  activeApp,
  buildPlatformApps,
  HOME_PAGE,
  needsStudentExerciseAccess,
  pageNameOf,
  SETTINGS_PAGE,
  PLATFORM_SHORTCUTS,
  type PlatformApps,
  type PlatformNavFeatures,
  type PlatformNavRoles,
} from "./nav-items.const";

const ALL_ON: PlatformNavFeatures = { play: true, analysisBoard: true, trainer: true, exercises: "all" };
const ALL_OFF: PlatformNavFeatures = { play: false, analysisBoard: false, trainer: false, exercises: false };
const STUDENT = { isTeacher: false, isStaff: false };
const TEACHER = { isTeacher: true, isStaff: false };
const STAFF = { isTeacher: false, isStaff: true };

/** Every tool of a menu, «Tus atajos» first, by its name. */
const labelsOf = (apps: PlatformApps) => [...apps.shortcuts, ...apps.more].map((app) => app.label);
/** Every address of a menu. */
const hrefsOf = (apps: PlatformApps) => [...apps.shortcuts, ...apps.more].map((app) => app.href);
const labels = (roles: PlatformNavRoles, features: PlatformNavFeatures) => labelsOf(buildPlatformApps(roles, features));

describe("buildPlatformApps", () => {
  it("da al alumno «Jugar», sus ejercicios, lo que estudia y las herramientas, en ese orden", () => {
    expect(labels(STUDENT, ALL_ON)).toEqual([
      "Jugar",
      "Ejercicios",
      "Ejercicios por tema",
      "Puzzle Rush",
      "Cursos",
      "Clases",
      "Estudiar",
      "Tablero de análisis",
      "Explorador",
      "Entrenador",
    ]);
    expect(hrefsOf(buildPlatformApps(STUDENT, ALL_ON))).toContain("/ejercicios/temas");
  });

  it("parte la lista en «Tus atajos», dos filas de tres, y el resto", () => {
    const apps = buildPlatformApps(STUDENT, ALL_ON);
    expect(apps.shortcuts).toHaveLength(PLATFORM_SHORTCUTS);
    expect(apps.shortcuts.map((app) => app.label)).toEqual([
      "Jugar",
      "Ejercicios",
      "Ejercicios por tema",
      "Puzzle Rush",
      "Cursos",
      "Clases",
    ]);
    // With less switched on, the shortcuts are what there is, and nothing is left under them.
    const few = buildPlatformApps(STUDENT, ALL_OFF);
    expect(few.shortcuts.map((app) => app.label)).toEqual(["Cursos", "Clases", "Estudiar", "Explorador"]);
    expect(few.more).toEqual([]);
  });

  it("sustituye el menú del alumno por el del profesor, no lo suma", () => {
    expect(labels(TEACHER, ALL_ON)).toEqual([
      "Panel del profesor",
      "Clases que imparto",
      "Calendario",
      "Mis alumnos",
      "Ejercicios",
      "Tablero de análisis",
      "Clases prediseñadas",
      "Cursos",
      "Estudiar",
      "Explorador",
      "Entrenador",
      "Mi ficha",
    ]);
    expect(labels(TEACHER, ALL_OFF)).toEqual([
      "Panel del profesor",
      "Clases que imparto",
      "Calendario",
      "Mis alumnos",
      "Clases prediseñadas",
      "Cursos",
      "Estudiar",
      "Explorador",
      "Mi ficha",
    ]);
  });

  it("da a administración su panel y, con su interruptor, el banco de ejercicios con revisión, series e importar", () => {
    expect(labels(STAFF, ALL_ON)).toEqual([
      "Administración",
      "Clases",
      "Alumnos",
      "Profesores",
      "Cursos",
      "Ejercicios",
      "Revisión",
      "Series",
      "Importar",
    ]);
    expect(labels(STAFF, ALL_OFF)).toEqual(["Administración", "Clases", "Alumnos", "Profesores", "Cursos"]);
    expect(hrefsOf(buildPlatformApps(STAFF, ALL_ON))).toEqual(
      expect.arrayContaining([
        "/administracion/ejercicios",
        "/administracion/ejercicios/revision",
        "/administracion/ejercicios/series",
        "/administracion/ejercicios/importar",
      ]),
    );
  });

  it("el rol más amplio manda: administración sobre profesor, profesor sobre alumno", () => {
    expect(labels({ isTeacher: true, isStaff: true }, ALL_OFF)).toEqual(labels(STAFF, ALL_OFF));
    expect(hrefsOf(buildPlatformApps({ ...TEACHER, hasExerciseSource: true }, ALL_ON))).not.toContain("/ejercicios");
  });

  it("ofrece el explorador al alumno y al profesor, con o sin el tablero", () => {
    // It is a cross-cutting tool: who sees which games is decided by the
    // visibility filter, not the menu.
    for (const features of [ALL_ON, ALL_OFF]) {
      expect(hrefsOf(buildPlatformApps(STUDENT, features))).toContain("/explorador");
      expect(hrefsOf(buildPlatformApps(TEACHER, features))).toContain("/explorador");
    }
  });

  it("deja fuera lo apagado: «Jugar» sin su interruptor, el entrenador sin el suyo o sin el tablero", () => {
    expect(hrefsOf(buildPlatformApps(STUDENT, { ...ALL_ON, play: false }))).not.toContain("/jugar");
    expect(hrefsOf(buildPlatformApps(STUDENT, { ...ALL_ON, trainer: false }))).not.toContain("/entrenador");
    expect(hrefsOf(buildPlatformApps(STUDENT, { ...ALL_ON, analysisBoard: false }))).not.toContain("/entrenador");
  });

  it("nunca da «Jugar» al profesor ni a administración", () => {
    expect(hrefsOf(buildPlatformApps(TEACHER, ALL_ON))).not.toContain("/jugar");
    expect(hrefsOf(buildPlatformApps(STAFF, ALL_ON))).not.toContain("/jugar");
  });

  it("da «Ejercicios» al profesor sólo con su interruptor, y nunca su banco a administración", () => {
    expect(hrefsOf(buildPlatformApps(TEACHER, ALL_ON))).toContain("/profesor/ejercicios");
    expect(hrefsOf(buildPlatformApps(TEACHER, { ...ALL_ON, exercises: false }))).not.toContain("/profesor/ejercicios");
    expect(hrefsOf(buildPlatformApps(TEACHER, { ...ALL_ON, exercises: "withTeacher" }))).toContain(
      "/profesor/ejercicios",
    );
    expect(hrefsOf(buildPlatformApps(STAFF, ALL_ON))).not.toContain("/profesor/ejercicios");
  });

  it("da los ejercicios al alumno: a todos, a quien tiene algo ahí, o a nadie", () => {
    const has = (features: PlatformNavFeatures, hasExerciseSource?: boolean) =>
      hrefsOf(buildPlatformApps({ ...STUDENT, hasExerciseSource }, features)).includes("/ejercicios");

    // "all": every student, with or without a teacher (phase 4, the library).
    expect(has({ ...ALL_OFF, exercises: "all" })).toBe(true);
    expect(has({ ...ALL_OFF, exercises: "all" }, false)).toBe(true);
    // "withTeacher": only one with an active teacher or a series given (phases 1–3).
    expect(has({ ...ALL_OFF, exercises: "withTeacher" }, true)).toBe(true);
    expect(has({ ...ALL_OFF, exercises: "withTeacher" }, false)).toBe(false);
    expect(has({ ...ALL_OFF, exercises: "withTeacher" })).toBe(false);
    // Off: nobody, whatever they have.
    expect(has({ ...ALL_OFF, exercises: false }, true)).toBe(false);
  });

  it("pregunta a la base por lo del alumno sólo cuando el menú depende de ello", () => {
    const withTeacher: PlatformNavFeatures = { ...ALL_OFF, exercises: "withTeacher" };
    expect(needsStudentExerciseAccess(STUDENT, withTeacher)).toBe(true);
    expect(needsStudentExerciseAccess(TEACHER, withTeacher)).toBe(false);
    expect(needsStudentExerciseAccess(STAFF, withTeacher)).toBe(false);
    expect(needsStudentExerciseAccess(STUDENT, ALL_ON)).toBe(false);
    expect(needsStudentExerciseAccess(STUDENT, ALL_OFF)).toBe(false);
  });
});

describe("activeApp", () => {
  const alumno = buildPlatformApps(STUDENT, ALL_ON);
  const profesor = buildPlatformApps(TEACHER, ALL_ON);
  const staff = buildPlatformApps(STAFF, ALL_ON);
  const hrefOf = (apps: PlatformApps, pathname: string) => activeApp(apps, pathname)?.href ?? null;

  it("marca la coincidencia exacta, y su nombre es el de la página", () => {
    expect(activeApp(alumno, "/jugar")?.label).toBe("Jugar");
    expect(activeApp(profesor, "/profesor/calendario")?.label).toBe("Calendario");
  });

  it("marca la herramienta por prefijo en las rutas hijas", () => {
    expect(hrefOf(alumno, "/estudios/abc/partidas/xyz")).toBe("/estudios");
    expect(hrefOf(alumno, "/herramientas/tablero-de-analisis")).toBe("/herramientas/tablero-de-analisis");
  });

  it("se queda con la coincidencia más larga y no enciende dos herramientas", () => {
    expect(hrefOf(profesor, "/profesor/alumnos/abc")).toBe("/profesor/alumnos");
    expect(hrefOf(profesor, "/profesor")).toBe("/profesor");
    expect(hrefOf(profesor, "/profesor/ejercicios/abc")).toBe("/profesor/ejercicios");
    expect(hrefOf(alumno, "/ejercicios/series/abc/2")).toBe("/ejercicios");
    expect(hrefOf(alumno, "/ejercicios/temas")).toBe("/ejercicios/temas");
    expect(hrefOf(staff, "/administracion/cursos/abc/capitulos/def")).toBe("/administracion/cursos");
    expect(hrefOf(staff, "/administracion/ejercicios/revision")).toBe("/administracion/ejercicios/revision");
    expect(hrefOf(staff, "/administracion/ejercicios/abc")).toBe("/administracion/ejercicios");
  });

  it("no marca nada fuera de la plataforma ni lo que no es del rol", () => {
    expect(activeApp(alumno, "/iniciar-sesion")).toBeNull();
    expect(activeApp(alumno, "/inicio")).toBeNull();
    expect(activeApp(profesor, "/clases/abc")).toBeNull();
    expect(activeApp(profesor, "/ejercicios")).toBeNull();
  });

  it("no confunde un prefijo textual con una ruta hija", () => {
    // "/profesor" must not light up on "/profesorado".
    expect(activeApp(profesor, "/profesorado")).toBeNull();
  });
});

describe("pageNameOf", () => {
  const alumno = buildPlatformApps(STUDENT, ALL_ON);

  it("nombra la página por su herramienta", () => {
    expect(pageNameOf(alumno, "/clases/abc")?.label).toBe("Clases");
  });

  it("nombra «Inicio» en la página de inicio, que no es una herramienta", () => {
    expect(pageNameOf(alumno, "/inicio")).toEqual(HOME_PAGE);
    expect(HOME_PAGE.art).toBe("home");
  });

  it("nombra «Ajustes» en los ajustes, que tampoco son una herramienta", () => {
    expect(pageNameOf(alumno, "/ajustes")).toEqual(SETTINGS_PAGE);
  });

  it("no nombra nada donde no hay herramienta ni es el inicio", () => {
    expect(pageNameOf(alumno, "/inicio/otra")).toBeNull();
    expect(pageNameOf(alumno, "/lecciones/abc")).toBeNull();
  });
});

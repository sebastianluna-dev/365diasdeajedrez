import { describe, expect, it } from "vitest";
import {
  isPracticeOnlyLesson,
  lessonExerciseAllowed,
  lessonExerciseStatusLabel,
  lessonSaveButtons,
  mapLessonExerciseRow,
} from "./lesson-exercises.mapper";

const LEVELS = [
  { slug: "principiante", name: "Principiante", order: 1, eloMin: 800, eloMax: 1199, isActive: true },
  { slug: "intermedio", name: "Intermedio", order: 2, eloMin: 1200, eloMax: 1599, isActive: true },
];

const LESSON = { courseId: "10000001", chapterId: "ch-1", lessonId: "20000004" };

const row = (overrides: Record<string, unknown> = {}) => ({
  id: "e0000000-0000-4000-8000-000000000001",
  title: "La línea principal de la Najdorf",
  difficulty: 1000,
  mateIn: null,
  startFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
  playerMoves: 5,
  lessonOrder: 1,
  kind: { code: "SEQUENCE" },
  status: { code: "PUBLISHED" },
  topics: [{ topic: { label: "Táctica", order: 0 } }, { topic: { label: "Apertura", order: 1 } }],
  _count: { attempts: 0 },
  ...overrides,
});

describe("lessonExerciseAllowed", () => {
  it("ofrece «Eliminar» sólo a lo que nadie intentó y «Archivar» a lo que sí, nunca ambas ni las del banco", () => {
    expect(lessonExerciseAllowed("PUBLISHED", 0)).toEqual({
      duplicate: false,
      archive: false,
      restore: false,
      delete: true,
    });
    expect(lessonExerciseAllowed("DRAFT", 0)).toMatchObject({ archive: false, delete: true });
    expect(lessonExerciseAllowed("PUBLISHED", 3)).toEqual({
      duplicate: false,
      archive: true,
      restore: false,
      delete: false,
    });
    expect(lessonExerciseAllowed("DRAFT", 1)).toMatchObject({ archive: true, delete: false });
  });

  it("a un archivado no le ofrece nada: la lección no tiene vuelta para él", () => {
    expect(lessonExerciseAllowed("ARCHIVED", 0)).toEqual({
      duplicate: false,
      archive: false,
      restore: false,
      delete: false,
    });
    expect(lessonExerciseAllowed("ARCHIVED", 5)).toEqual({
      duplicate: false,
      archive: false,
      restore: false,
      delete: false,
    });
  });
});

describe("lessonExerciseStatusLabel", () => {
  it("dice «Publicado», no «En la biblioteca»: el de una lección nunca está en ella", () => {
    expect(lessonExerciseStatusLabel("PUBLISHED")).toBe("Publicado");
    expect(lessonExerciseStatusLabel("DRAFT")).toBe("Borrador");
    expect(lessonExerciseStatusLabel("ARCHIVED")).toBe("Archivado");
  });
});

describe("lessonSaveButtons", () => {
  it("un nuevo o un borrador se guarda como borrador o se publica, con la publicación como acento y completa", () => {
    for (const status of [null, "DRAFT"] as const) {
      const buttons = lessonSaveButtons(status);
      expect(buttons.map((button) => button.intent)).toEqual(["draft", "publish"]);
      expect(buttons[0]).toMatchObject({ accent: false, needsReadiness: false });
      expect(buttons[1]).toMatchObject({ accent: true, needsReadiness: true, label: "Guardar y publicar" });
    }
  });

  it("un publicado sólo se guarda y sigue completo; un archivado se guarda tal cual", () => {
    expect(lessonSaveButtons("PUBLISHED")).toEqual([
      expect.objectContaining({ intent: "save", accent: true, needsReadiness: true }),
    ]);
    expect(lessonSaveButtons("ARCHIVED")).toEqual([
      expect.objectContaining({ intent: "save", accent: true, needsReadiness: false }),
    ]);
  });
});

describe("mapLessonExerciseRow", () => {
  it("dibuja la tarjeta del banco con el enlace al editor de la lección, el nivel y los temas en su orden", () => {
    const mapped = mapLessonExerciseRow(row(), LESSON, LEVELS);
    expect(mapped).toMatchObject({
      href: "/administracion/cursos/10000001/capitulos/ch-1/lecciones/20000004/ejercicios/e0000000-0000-4000-8000-000000000001",
      orientation: "black",
      statusCode: "PUBLISHED",
      statusLabel: "Publicado",
      kindLabel: "Secuencia",
      levelName: "Principiante",
      topicLabels: ["Táctica", "Apertura"],
      lessonOrder: 1,
      attemptCount: 0,
      allowed: { duplicate: false, archive: false, restore: false, delete: true },
    });
  });

  it("con intentos, archiva en vez de eliminar; sin nivel que la contenga, ninguno", () => {
    const mapped = mapLessonExerciseRow(row({ difficulty: 2600, _count: { attempts: 2 } }), LESSON, LEVELS);
    expect(mapped.levelName).toBeNull();
    expect(mapped.allowed).toMatchObject({ archive: true, delete: false });
  });
});

describe("isPracticeOnlyLesson", () => {
  it("es sólo de práctica sin contenido y con algún ejercicio en juego; uno archivado no cuenta", () => {
    expect(isPracticeOnlyLesson(false, [{ lessonOrder: 1 }])).toBe(true);
    expect(isPracticeOnlyLesson(false, [{ lessonOrder: null }])).toBe(false);
    expect(isPracticeOnlyLesson(false, [])).toBe(false);
    expect(isPracticeOnlyLesson(true, [{ lessonOrder: 1 }])).toBe(false);
  });
});

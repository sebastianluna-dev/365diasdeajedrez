// De dónde sale el contenido de una lección.
//
// Hay dos fuentes posibles y UN solo sitio que decide entre ellas:
//
//  - si la lección referencia una partida de la colección del curso
//    (`gameId`), el contenido es el PGN de esa partida —así, corregirla arregla
//    todas las lecciones que la usan—;
//  - si no, el contenido es su propio `pgn`, que es como nacieron las lecciones.
//
// Módulo puro (sólo tipos estructurales, nada de Prisma ni de `server-only`)
// para que lo puedan usar los servicios, los mappers y los tests sin arrastrar
// acceso a datos. `lessonPgnSelect` viaja con él a propósito: quien lee el PGN
// de una lección tiene que traerse también el de su partida, y tenerlos juntos
// es lo que evita que una consulta se olvide de la mitad.

/** Lo que hay que pedirle a Prisma para poder resolver el contenido. */
export const lessonPgnSelect = {
  pgn: true,
  game: { select: { pgn: true } },
} as const;

export interface LessonPgnSource {
  pgn: string;
  /** La partida referenciada, o `null` si la lección tiene contenido propio. */
  game: { pgn: string } | null;
}

/** El PGN que se le enseña al alumno. */
export function lessonPgnOf(lesson: LessonPgnSource): string {
  return lesson.game?.pgn ?? lesson.pgn;
}

/** Si la lección tiene contenido, venga de donde venga. */
export function lessonHasContent(lesson: LessonPgnSource): boolean {
  return lessonPgnOf(lesson).trim().length > 0;
}

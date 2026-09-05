import { DATABASE_KIND, type DatabaseKindCode } from "@/constants/platform/study-codes.const";

// Qué se puede hacer con un estudio según su TIPO y quién pregunta.
//
// Módulo puro —sin DAL, sin `server-only`— por el mismo motivo que
// services/shared/game-visibility-rules: es la frontera que decide si una
// colección es de sólo lectura, y comprobarla no debería exigir montar una
// petición con sesión. Lo consultan las server actions (que además vuelven a
// mirar la propiedad contra la base de datos) y la interfaz, para no ofrecer
// botones que la acción va a rechazar.
//
// La propiedad NO se decide aquí: llega resuelta en `isOwner`.

export interface StudyPermissions {
  /** Renombrar el estudio y cambiar su descripción. */
  canEdit: boolean;
  /** Borrar el estudio entero. */
  canDelete: boolean;
  /** Crear, importar, editar y borrar sus partidas, y anotar sus PGN. */
  canEditGames: boolean;
  /** Cambiar el tipo por otro. */
  canChangeKind: boolean;
}

const READ_ONLY: StudyPermissions = {
  canEdit: false,
  canDelete: false,
  canEditGames: false,
  canChangeKind: false,
};

/**
 * Tipos que un alumno crea desde «Mis estudios».
 *
 * Fuera quedan los dos que no se crean a mano: `MY_GAMES` nace con la cuenta y
 * `COLLECTION` le llega hecha. Este mismo par es al que se puede CAMBIAR un
 * estudio existente, y por eso hay una sola lista.
 */
export const STUDENT_KINDS: readonly DatabaseKindCode[] = [DATABASE_KIND.STUDY, DATABASE_KIND.TOURNAMENT];

/**
 * Tipos que puede crear un profesor: los del alumno más la colección, que es
 * la que reparte a sus alumnos.
 */
export const TEACHER_KINDS: readonly DatabaseKindCode[] = [...STUDENT_KINDS, DATABASE_KIND.COLLECTION];

export function creatableKinds(isTeacher: boolean): readonly DatabaseKindCode[] {
  return isTeacher ? TEACHER_KINDS : STUDENT_KINDS;
}

export function canCreateKind(kindCode: string, isTeacher: boolean): boolean {
  return (creatableKinds(isTeacher) as readonly string[]).includes(kindCode);
}

export interface StudyRuleInput {
  kindCode: string;
  /**
   * Si quien pregunta es el dueño de la base. Es lo único que separa a un
   * alumno que RECIBE una colección del profesor que la HIZO: los dos ven la
   * misma fila y sólo uno la escribe.
   */
  isOwner: boolean;
}

/**
 * La tabla de la spec, en una función.
 *
 * Quien no es dueño no puede nada: ahí caen las bases de curso, las colecciones
 * repartidas por un maestro y la mirada del profesor sobre el estudio de su
 * alumno. Que la colección sea de sólo lectura NO es una regla aparte, es esta
 * misma: al alumno le llega repartida, nunca es suya.
 */
export function studyPermissionsOf({ kindCode, isOwner }: StudyRuleInput): StudyPermissions {
  if (!isOwner) return READ_ONLY;

  // «Mis partidas» es la única cuenta pendiente del alumno consigo mismo: hace
  // lo que quiera con las partidas de dentro, pero la base no se borra ni deja
  // de ser «Mis partidas» —es única por alumno y algo tiene que ocupar ese
  // sitio—.
  if (kindCode === DATABASE_KIND.MY_GAMES) {
    return { canEdit: true, canDelete: false, canEditGames: true, canChangeKind: false };
  }

  // Una colección sólo la posee quien la reparte. Cambiarle el tipo dejaría a
  // sus alumnos mirando algo que ya no es una colección, así que se queda
  // quieta; borrarla sí puede, es suya.
  if (kindCode === DATABASE_KIND.COLLECTION) {
    return { canEdit: true, canDelete: true, canEditGames: true, canChangeKind: false };
  }

  // Torneo y Estudio: del alumno de principio a fin, y se puede pasar de uno a
  // otro —lo que empezó como material suelto acaba siendo un torneo—.
  return { canEdit: true, canDelete: true, canEditGames: true, canChangeKind: true };
}

/**
 * Si un estudio puede pasar a `nextKind`. Se comprueba el tipo de PARTIDA y el
 * de DESTINO: un torneo puede volverse estudio, pero ninguno de los dos puede
 * volverse colección —eso lo reparte un maestro— ni «Mis partidas».
 */
export function canChangeKindTo(current: StudyRuleInput, nextKind: string): boolean {
  return studyPermissionsOf(current).canChangeKind && (STUDENT_KINDS as readonly string[]).includes(nextKind);
}

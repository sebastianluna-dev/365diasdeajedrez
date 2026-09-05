// Datos del seed de la plataforma. IDs fijos (UUIDs literales) para que el
// seed sea idempotente: ejecutarlo varias veces actualiza, nunca duplica.
// Los codes provienen de constants/platform/*; los labels van en español.

import { ACTIVITY_TYPE, STAT_METRIC, SUBJECT_TYPE } from "../constants/platform/activity-codes.const";
import { CLASS_BLOCK_KIND, CLASS_STATUS, MEETING_PROVIDER, TRANSCRIPT_STATUS } from "../constants/platform/class-codes.const";
import {
  AUTHOR_ROLE,
  COURSE_STATUS,
  COURSE_TYPE,
  INITIAL_POSITION_TYPE,
  LEVEL,
  PRESENTATION_MODE,
} from "../constants/platform/course-codes.const";
import { BOARD_ORIENTATION, OWNER_TYPE, PROGRESS_STATUS, TOPIC } from "../constants/platform/shared-codes.const";
import { DATABASE_KIND, GAME_RESULT, GAME_SOURCE } from "../constants/platform/study-codes.const";
import { ATTEMPT_CONTEXT, ATTEMPT_RESULT, EXERCISE_MODE } from "../constants/platform/training-codes.const";

import { DEMO_STAFF_EMAIL, DEMO_TEACHER_EMAIL, DEMO_USER_EMAIL } from "../constants/platform/demo-user.const";
import { mainlinePath } from "../lib/chess/exercise-derivation";
import {
  THINK_LIKE_A_GRANDMASTER,
  THINK_LIKE_A_GRANDMASTER_DATABASE,
  THINK_LIKE_A_GRANDMASTER_GAMES,
} from "./seed-courses/think-like-a-grandmaster";

// ---------------------------------------------------------------------------
// Catálogos: [code, label] (order = índice)
// ---------------------------------------------------------------------------

export const CATALOG_VALUES = {
  courseType: [
    [COURSE_TYPE.OPENING, "Apertura"],
    [COURSE_TYPE.ENDGAME, "Finales"],
    [COURSE_TYPE.STRATEGY, "Estrategia"],
    [COURSE_TYPE.TACTICS, "Táctica"],
  ],
  courseStatus: [
    [COURSE_STATUS.DRAFT, "Borrador"],
    [COURSE_STATUS.PUBLISHED, "Publicado"],
    [COURSE_STATUS.ARCHIVED, "Archivado"],
  ],
  authorRole: [
    [AUTHOR_ROLE.CONTENT_AUTHOR, "Autor del contenido"],
    [AUTHOR_ROLE.DIGITAL_ADAPTATION, "Adaptación digital"],
  ],
  level: [
    [LEVEL.BEGINNER, "Principiante"],
    [LEVEL.INTERMEDIATE, "Intermedio"],
    [LEVEL.ADVANCED, "Avanzado"],
    [LEVEL.EXPERT, "Experto"],
  ],
  presentationMode: [
    [PRESENTATION_MODE.MOVE_SEQUENCE, "Secuencia de jugadas"],
    [PRESENTATION_MODE.GAME_ANALYSIS, "Análisis de partida"],
    [PRESENTATION_MODE.STATIC_DIAGRAMS, "Diagramas estáticos"],
  ],
  initialPositionType: [
    [INITIAL_POSITION_TYPE.STARTING_POSITION, "Posición inicial"],
    [INITIAL_POSITION_TYPE.FEN, "Posición FEN"],
  ],
  boardOrientation: [
    [BOARD_ORIENTATION.WHITE, "Blancas"],
    [BOARD_ORIENTATION.BLACK, "Negras"],
    [BOARD_ORIENTATION.AUTO, "Automática"],
  ],
  exerciseMode: [
    [EXERCISE_MODE.REPRODUCE_LINE, "Reproducir la línea"],
    [EXERCISE_MODE.FIND_MOVE, "Encontrar la jugada"],
  ],
  progressStatus: [
    [PROGRESS_STATUS.NOT_STARTED, "Sin empezar"],
    [PROGRESS_STATUS.IN_PROGRESS, "En curso"],
    [PROGRESS_STATUS.COMPLETED, "Completado"],
  ],
  attemptResult: [
    [ATTEMPT_RESULT.PASSED, "Superado"],
    [ATTEMPT_RESULT.FAILED, "Fallado"],
  ],
  attemptContext: [
    [ATTEMPT_CONTEXT.LESSON, "Lección"],
    [ATTEMPT_CONTEXT.CHAPTER_QUIZ, "Quiz de capítulo"],
    [ATTEMPT_CONTEXT.TRAINER, "Entrenador"],
  ],
  ownerType: [
    [OWNER_TYPE.USER, "Usuario"],
    [OWNER_TYPE.COURSE, "Curso"],
    [OWNER_TYPE.TEACHER, "Profesor"],
  ],
  databaseKind: [
    [DATABASE_KIND.MY_GAMES, "Mis partidas"],
    [DATABASE_KIND.TOURNAMENT, "Torneo"],
    [DATABASE_KIND.STUDY, "Estudio"],
    [DATABASE_KIND.COLLECTION, "Colección"],
  ],
  gameSource: [
    [GAME_SOURCE.MANUAL, "Registrada a mano"],
    [GAME_SOURCE.PGN_IMPORT, "Importada de PGN"],
    [GAME_SOURCE.PLATFORM_GAME, "Jugada en la plataforma"],
  ],
  gameResult: [
    [GAME_RESULT.WHITE_WINS, "1-0"],
    [GAME_RESULT.BLACK_WINS, "0-1"],
    [GAME_RESULT.DRAW, "1/2-1/2"],
    [GAME_RESULT.ONGOING, "*"],
  ],
  classStatus: [
    [CLASS_STATUS.SCHEDULED, "Programada"],
    [CLASS_STATUS.LIVE, "En vivo"],
    [CLASS_STATUS.COMPLETED, "Finalizada"],
    [CLASS_STATUS.CANCELLED, "Cancelada"],
  ],
  meetingProvider: [
    [MEETING_PROVIDER.ZOOM, "Zoom"],
    [MEETING_PROVIDER.MEET, "Google Meet"],
    [MEETING_PROVIDER.OTHER, "Otro"],
  ],
  classBlockKind: [
    [CLASS_BLOCK_KIND.TEXT, "Texto"],
    [CLASS_BLOCK_KIND.VIDEO, "Video"],
    [CLASS_BLOCK_KIND.GAME_REF, "Partida"],
    [CLASS_BLOCK_KIND.LESSON_REF, "Lección"],
    [CLASS_BLOCK_KIND.POSITION_REF, "Posición"],
    [CLASS_BLOCK_KIND.FILE, "Archivo"],
  ],
  transcriptStatus: [
    [TRANSCRIPT_STATUS.PENDING, "Pendiente"],
    [TRANSCRIPT_STATUS.READY, "Lista"],
    [TRANSCRIPT_STATUS.FAILED, "Fallida"],
  ],
  activityType: [
    [ACTIVITY_TYPE.LESSON_COMPLETED, "Lección completada"],
    [ACTIVITY_TYPE.COURSE_COMPLETED, "Curso completado"],
    [ACTIVITY_TYPE.CLASS_ATTENDED, "Clase asistida"],
    [ACTIVITY_TYPE.GAME_ANALYZED, "Partida analizada"],
    [ACTIVITY_TYPE.EXERCISE_PASSED, "Ejercicio superado"],
  ],
  subjectType: [
    [SUBJECT_TYPE.COURSE, "Curso"],
    [SUBJECT_TYPE.CHAPTER, "Capítulo"],
    [SUBJECT_TYPE.LESSON, "Lección"],
    [SUBJECT_TYPE.CLASS, "Clase"],
    [SUBJECT_TYPE.GAME, "Partida"],
    [SUBJECT_TYPE.EXERCISE, "Ejercicio"],
  ],
  statMetric: [
    [STAT_METRIC.LESSONS_COMPLETED, "Lecciones completadas"],
    [STAT_METRIC.COURSES_COMPLETED, "Cursos completados"],
    [STAT_METRIC.CLASSES_ATTENDED, "Clases asistidas"],
    [STAT_METRIC.GAMES_ANALYZED, "Partidas analizadas"],
    [STAT_METRIC.EXERCISES_PASSED, "Ejercicios superados"],
  ],
} satisfies Record<string, [code: string, label: string][]>;

export const TOPIC_VALUES: [code: string, label: string][] = [
  [TOPIC.TACTICS, "Táctica"],
  [TOPIC.OPENING_LINE, "Aperturas"],
  [TOPIC.PAWN_STRUCTURE, "Estructuras de peones"],
  [TOPIC.ENDGAME, "Finales"],
  [TOPIC.STRATEGY, "Estrategia"],
];

// ---------------------------------------------------------------------------
// IDs fijos
// ---------------------------------------------------------------------------

export const IDS = {
  demoUser: "a0000000-0000-4000-8000-000000000001",
  teacherUser: "a0000000-0000-4000-8000-000000000002",
  teacher: "a0000000-0000-4000-8000-000000000003",
  author: "a0000000-0000-4000-8000-000000000004",
  staffUser: "a0000000-0000-4000-8000-000000000005",
  staff: "a0000000-0000-4000-8000-000000000006",
  teacherStudent: "a0000000-0000-4000-8000-000000000007",

  courseSicilian: "10000001",
  courseRookEndings: "10000002",

  chSicilianBasics: "c1000000-0000-4000-8000-000000000001",
  chSicilianNajdorf: "c1000000-0000-4000-8000-000000000002",
  chRookFundamentals: "c1000000-0000-4000-8000-000000000003",

  lsWhatIsSicilian: "20000001",
  lsPawnStructure: "20000002",
  lsBreakD5: "20000003",
  lsNajdorfStart: "20000004",
  lsPoisonedPawn: "20000005",
  lsLucena: "20000006",
  lsPhilidor: "20000007",

  exNajdorfLine: "e0000000-0000-4000-8000-000000000001",
  exPoisonedPawn: "e0000000-0000-4000-8000-000000000002",
  exLucenaBridge: "e0000000-0000-4000-8000-000000000003",
  exPhilidorDefense: "e0000000-0000-4000-8000-000000000004",

  dbMyGames: "demoMisP",
  dbKingAttacks: "demoAtaq",
  dbSicilianModels: "demoSici",
  dbTeacherMyGames: "profMisP",
  dbNationalOpen: "demoTorn",
  dbTeacherPack: "demoColP",

  gameNationalR1: "demoRon1",
  gameTeacherPin: "demoClav",

  gameOpera: "demoOper",
  gameImmortal: "demoInmo",
  gameEvergreen: "demoSiem",
  gameModelOpocensky: "demoOpoc",
  gameModelAlapin: "demoAlap",

  classPast: "b0000000-0000-4000-8000-000000000001",
  classUpcoming: "b0000000-0000-4000-8000-000000000002",

  blockPastIntro: "b1000000-0000-4000-8000-000000000001",
  blockPastGame: "b1000000-0000-4000-8000-000000000002",
  blockPastLesson: "b1000000-0000-4000-8000-000000000003",
  blockPastVideo: "b1000000-0000-4000-8000-000000000004",

  attempt1: "e1000000-0000-4000-8000-000000000001",
  attempt2: "e1000000-0000-4000-8000-000000000002",
  attempt3: "e1000000-0000-4000-8000-000000000003",
} as const;

// ---------------------------------------------------------------------------
// Usuarios, autor, profesor
// ---------------------------------------------------------------------------

export const USERS = [
  { id: IDS.demoUser, email: DEMO_USER_EMAIL, displayName: "Alumno Demo" },
  { id: IDS.teacherUser, email: DEMO_TEACHER_EMAIL, displayName: "Profesor Demo" },
  { id: IDS.staffUser, email: DEMO_STAFF_EMAIL, displayName: "Staff Demo" },
];

export const TEACHER = {
  id: IDS.teacher,
  userId: IDS.teacherUser,
  displayName: "GM Profesor Demo",
  title: "Gran Maestro",
  bio: "Profesor titular de la academia. Especialista en aperturas abiertas y finales de torre.",
  timezone: "America/Mexico_City",
};

/// Rol Administrador/Editor de la plataforma para la cuenta de staff demo.
export const STAFF = {
  id: IDS.staff,
  userId: IDS.staffUser,
};

/// Asignación activa del alumno demo con el profesor demo. El seed la deja
/// abierta al crearla, pero NO toca endedAt al actualizar: si alguien la cerró
/// desde el panel, un re-seed no la resucita.
export const TEACHER_STUDENT = {
  id: IDS.teacherStudent,
  teacherId: IDS.teacher,
  studentId: IDS.demoUser,
  assignedBy: IDS.staffUser,
  note: "Asignación de ejemplo creada por el seed.",
};

export const AUTHOR = {
  id: IDS.author,
  name: "Equipo 365",
  slug: "equipo-365",
  bio: "Equipo editorial de 365 Días de Ajedrez.",
};

// ---------------------------------------------------------------------------
// Cursos → capítulos → lecciones → ejercicios
// Los ejercicios definen afterSans (jugadas previas desde la posición inicial
// de la lección) y lineSans (el tramo a entrenar); el seed calcula startFen
// replicando esas jugadas con chessops, de modo que la copia congelada siempre
// es legal y coherente con el PGN.
// ---------------------------------------------------------------------------

export interface SeedExercise {
  id: string;
  order: number;
  mode: string;
  promptText: string;
  afterSans: string[];
  lineSans: string[];
}

export interface SeedLesson {
  id: string;
  order: number;
  name: string;
  description: string;
  isPriority: boolean;
  estimatedDuration: number;
  presentationMode: string;
  initialPositionType: string;
  initialFen: string | null;
  orientation: string;
  pgn: string;
  topics: string[];
  exercises: SeedExercise[];
}

export interface SeedChapter {
  id: string;
  order: number;
  name: string;
  description: string;
  estimatedDuration: number;
  lessons: SeedLesson[];
}

export interface SeedCourse {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  status: string;
  levels: string[];
  chapters: SeedChapter[];
}

export const COURSES: SeedCourse[] = [
  {
    id: IDS.courseSicilian,
    name: "Fundamentos de la Defensa Siciliana",
    slug: "fundamentos-defensa-siciliana",
    description:
      "La respuesta más combativa contra 1.e4: ideas, estructuras y la Variante Najdorf explicadas desde cero.",
    type: COURSE_TYPE.OPENING,
    status: COURSE_STATUS.PUBLISHED,
    levels: [LEVEL.BEGINNER, LEVEL.INTERMEDIATE],
    chapters: [
      {
        id: IDS.chSicilianBasics,
        order: 1,
        name: "Ideas básicas",
        description: "Qué busca el negro con 1...c5 y cómo se forman las estructuras sicilianas.",
        estimatedDuration: 45,
        lessons: [
          {
            id: IDS.lsWhatIsSicilian,
            order: 1,
            name: "¿Qué es la Siciliana?",
            description: "La jugada 1...c5 y el desequilibrio central que define la apertura.",
            isPriority: true,
            estimatedDuration: 15,
            presentationMode: PRESENTATION_MODE.MOVE_SEQUENCE,
            initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
            initialFen: null,
            orientation: BOARD_ORIENTATION.BLACK,
            topics: [TOPIC.OPENING_LINE],
            exercises: [],
            pgn: `1. e4 c5 {La Defensa Siciliana: el negro evita la simetría y lucha por la casilla d4 desde la primera jugada. [%csl Gc5,Gd4][%cal Gc5d4]} 2. Nf3 ( 2. Nc3 Nc6 3. g3 g6 {La Siciliana Cerrada: un plan completamente distinto, sin apertura del centro.} ) 2... d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 {La posición base de la Siciliana Abierta. El negro cambió un peón de flanco por un peón central. [%cal Gf6e4,Gc3e4]} *`,
          },
          {
            id: IDS.lsPawnStructure,
            order: 2,
            name: "La estructura de peones siciliana",
            description: "Columna c semiabierta, mayoría central blanca y los planes de cada bando.",
            isPriority: false,
            estimatedDuration: 15,
            presentationMode: PRESENTATION_MODE.MOVE_SEQUENCE,
            initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
            initialFen: null,
            orientation: BOARD_ORIENTATION.BLACK,
            topics: [TOPIC.OPENING_LINE, TOPIC.PAWN_STRUCTURE],
            exercises: [],
            pgn: `1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 {El negro cambió su peón c por el peón d blanco: obtiene la columna c semiabierta y el blanco una mayoría central. [%csl Rc2,Gc8][%cal Ga8c8]} 4... Nf6 ( 4... g6 {El Dragón Acelerado: el alfil irá a g7 apuntando al centro. [%cal Gf8g7]} 5. Nc3 Bg7 ) 5. Nc3 e5 {La Sveshnikov, una de las respuestas más ambiciosas: el negro toma el centro a costa del agujero en d5. [%csl Rd5]} 6. Ndb5 d6 *`,
          },
          {
            id: IDS.lsBreakD5,
            order: 3,
            name: "La ruptura ...d5",
            description: "El plan liberador del negro en las estructuras Scheveningen.",
            isPriority: true,
            estimatedDuration: 15,
            presentationMode: PRESENTATION_MODE.MOVE_SEQUENCE,
            initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
            initialFen: null,
            orientation: BOARD_ORIENTATION.BLACK,
            topics: [TOPIC.OPENING_LINE, TOPIC.STRATEGY],
            exercises: [],
            pgn: `1. e4 c5 2. Nf3 e6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 d6 {La estructura Scheveningen: el pequeño centro negro d6-e6 es elástico y sólido.} 6. Be2 ( 6. g4 {El Ataque Keres, la prueba más crítica: el blanco lanza los peones antes de enrocar.} 6... h6 ) 6... Be7 7. O-O O-O {Ambos bandos completaron el desarrollo. El plan negro pasa por ...a6, ...Dc7 y, en el momento justo, la ruptura liberadora ...d5. [%cal Ga7a6,Gd6d5][%csl Gd5]} *`,
          },
        ],
      },
      {
        id: IDS.chSicilianNajdorf,
        order: 2,
        name: "La Variante Najdorf",
        description: "La línea favorita de Fischer y Kasparov: 5...a6 y sus planes.",
        estimatedDuration: 40,
        lessons: [
          {
            id: IDS.lsNajdorfStart,
            order: 1,
            name: "La posición de partida de la Najdorf",
            description: "Por qué 5...a6 es útil y cómo responde el negro a los montajes principales.",
            isPriority: true,
            estimatedDuration: 20,
            presentationMode: PRESENTATION_MODE.MOVE_SEQUENCE,
            initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
            initialFen: null,
            orientation: BOARD_ORIENTATION.BLACK,
            topics: [TOPIC.OPENING_LINE],
            pgn: `1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 {La jugada que define la Najdorf: controla b5 y prepara ...e5 y ...b5 sin sobresaltos. [%csl Gb5][%cal Ga6b5,Gb7b5,Ge7e5]} 6. Be3 ( 6. Bg5 e6 7. f4 {La línea principal clásica, agudísima: aquí nace el Peón Envenenado.} ) ( 6. Be2 e5 {Contra la tranquila 6.Ae2 el negro toma el centro de inmediato.} 7. Nb3 Be7 ) 6... e5 {La respuesta principal contra el Ataque Inglés.} 7. Nb3 Be6 8. f3 Be7 *`,
            exercises: [
              {
                id: IDS.exNajdorfLine,
                order: 1,
                mode: EXERCISE_MODE.REPRODUCE_LINE,
                promptText: "Reproduce la línea principal de la Najdorf jugando con negras.",
                afterSans: ["e4"],
                lineSans: ["c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"],
              },
            ],
          },
          {
            id: IDS.lsPoisonedPawn,
            order: 2,
            name: "El Peón Envenenado",
            description: "La variante 7...Db6: el negro toma b2 y sobrevive para contarlo.",
            isPriority: false,
            estimatedDuration: 20,
            presentationMode: PRESENTATION_MODE.MOVE_SEQUENCE,
            initialPositionType: INITIAL_POSITION_TYPE.STARTING_POSITION,
            initialFen: null,
            orientation: BOARD_ORIENTATION.BLACK,
            topics: [TOPIC.OPENING_LINE, TOPIC.TACTICS],
            pgn: `1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Qb6 {La Variante del Peón Envenenado: la dama ataca b2 y desafía al blanco a demostrar la compensación. [%csl Rb2][%cal Gb6b2]} 8. Qd2 ( 8. Nb3 {Demasiado pasiva: el negro iguala con comodidad.} 8... Be7 ) 8... Qxb2 9. Rb1 Qa3 {La posición crítica, analizada hasta la jugada 30 en la teoría moderna. El negro tiene un peón; el blanco, iniciativa. [%csl Ra3]} *`,
            exercises: [
              {
                id: IDS.exPoisonedPawn,
                order: 1,
                mode: EXERCISE_MODE.FIND_MOVE,
                promptText: "El blanco acaba de jugar 8.Dd2 defendiendo indirectamente. ¿Cómo gana un peón el negro de todas formas?",
                afterSans: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Bg5", "e6", "f4", "Qb6", "Qd2"],
                lineSans: ["Qxb2"],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: IDS.courseRookEndings,
    name: "Finales de torre esenciales",
    slug: "finales-de-torre-esenciales",
    description: "Lucena y Philidor: las dos posiciones que todo jugador debe dominar antes que cualquier otra.",
    type: COURSE_TYPE.ENDGAME,
    status: COURSE_STATUS.PUBLISHED,
    levels: [LEVEL.INTERMEDIATE],
    chapters: [
      {
        id: IDS.chRookFundamentals,
        order: 1,
        name: "Posiciones fundamentales",
        description: "Las dos posiciones teóricas imprescindibles del final de torre y peón.",
        estimatedDuration: 35,
        lessons: [
          {
            id: IDS.lsLucena,
            order: 1,
            name: "La posición de Lucena",
            description: "El puente: la técnica universal para ganar con torre y peón de más.",
            isPriority: true,
            estimatedDuration: 18,
            presentationMode: PRESENTATION_MODE.MOVE_SEQUENCE,
            initialPositionType: INITIAL_POSITION_TYPE.FEN,
            initialFen: "1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1",
            orientation: BOARD_ORIENTATION.WHITE,
            topics: [TOPIC.ENDGAME],
            pgn: `[FEN "1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1"]

1. Rd1+ {Primero se expulsa al rey enemigo de la zona de coronación.} 1... Ke7 2. Rd4 {La jugada clave de toda la técnica: la torre se prepara para construir el puente en la cuarta fila. [%csl Gd4]} 2... Ra1 3. Kc7 Rc1+ 4. Kb6 Rb1+ 5. Kc6 Rc1+ 6. Kb5 Rb1+ 7. Rb4 {El puente está construido: la torre corta los jaques y el peón corona sin remedio. [%cal Gb7b8][%csl Gb4]} *`,
            exercises: [
              {
                id: IDS.exLucenaBridge,
                order: 1,
                mode: EXERCISE_MODE.REPRODUCE_LINE,
                promptText: "Construye el puente de Lucena y lleva el peón a la coronación.",
                afterSans: [],
                lineSans: ["Rd1+", "Ke7", "Rd4", "Ra1", "Kc7", "Rc1+", "Kb6", "Rb1+", "Kc6", "Rc1+", "Kb5", "Rb1+", "Rb4"],
              },
            ],
          },
          {
            id: IDS.lsPhilidor,
            order: 2,
            name: "La defensa Philidor",
            description: "La torre en la tercera fila: el método de tablas que hay que saber de memoria.",
            isPriority: true,
            estimatedDuration: 17,
            presentationMode: PRESENTATION_MODE.MOVE_SEQUENCE,
            initialPositionType: INITIAL_POSITION_TYPE.FEN,
            initialFen: "4k3/8/8/4PK2/8/8/r7/4R3 b - - 0 1",
            orientation: BOARD_ORIENTATION.BLACK,
            topics: [TOPIC.ENDGAME],
            pgn: `[FEN "4k3/8/8/4PK2/8/8/r7/4R3 b - - 0 1"]

1... Ra6 {La defensa Philidor: la torre se instala en la tercera fila del defensor e impide que el rey blanco avance sin abandonar su peón. [%csl Ga6,Gb6,Gc6,Gd6][%cal Ra6h6]} 2. e6 Ra1 {En cuanto el peón avanza y le quita a su rey la casilla de refugio, la torre baja para dar jaques infinitos por detrás.} 3. Kf6 Rf1+ 4. Ke5 Re1+ 5. Kd6 Rd1+ {El rey no tiene dónde esconderse de los jaques: tablas. [%cal Gd1d5]} *`,
            exercises: [
              {
                id: IDS.exPhilidorDefense,
                order: 1,
                mode: EXERCISE_MODE.FIND_MOVE,
                promptText: "Juegan negras. ¿Cuál es la jugada que asegura las tablas según Philidor?",
                afterSans: [],
                lineSans: ["Ra6"],
              },
            ],
          },
        ],
      },
    ],
  },
  THINK_LIKE_A_GRANDMASTER,
];

// ---------------------------------------------------------------------------
// Estudios (GameDatabase) y partidas
// ---------------------------------------------------------------------------

export const GAME_DATABASES = [
  {
    id: IDS.dbMyGames,
    ownerType: OWNER_TYPE.USER,
    userId: IDS.demoUser as string | null,
    courseId: null as string | null,
    name: "Mis partidas",
    description: "La base creada automáticamente con tu cuenta.",
    kind: DATABASE_KIND.MY_GAMES,
    isDefault: true,
    order: 0,
  },
  {
    id: IDS.dbKingAttacks,
    ownerType: OWNER_TYPE.USER,
    userId: IDS.demoUser as string | null,
    courseId: null as string | null,
    name: "Estudio: ataques al rey",
    description: "Tres clásicos inmortales del ataque al rey para estudiar a fondo.",
    kind: DATABASE_KIND.STUDY,
    isDefault: false,
    order: 1,
  },
  {
    id: IDS.dbSicilianModels,
    ownerType: OWNER_TYPE.COURSE,
    userId: null as string | null,
    courseId: IDS.courseSicilian as string | null,
    name: "Partidas modelo del curso",
    description: "Estructuras típicas de la Siciliana en la práctica magistral.",
    kind: DATABASE_KIND.COLLECTION,
    isDefault: false,
    order: 0,
  },
  {
    // Cada cuenta tiene la suya, también la del profesor: la crea el alta y la
    // impone el índice único parcial `game_database_one_default_per_user`.
    id: IDS.dbTeacherMyGames,
    ownerType: OWNER_TYPE.USER,
    userId: IDS.teacherUser as string | null,
    courseId: null as string | null,
    name: "Mis partidas",
    description: "Tus partidas que no pertenecen a ningún torneo.",
    kind: DATABASE_KIND.MY_GAMES,
    isDefault: true,
    order: 0,
  },
  {
    // Un torneo: las partidas que el alumno jugó en una misma competición.
    id: IDS.dbNationalOpen,
    ownerType: OWNER_TYPE.USER,
    userId: IDS.demoUser as string | null,
    courseId: null as string | null,
    name: "Nacional Abierto 2026",
    description: "Mis partidas del Nacional Abierto.",
    kind: DATABASE_KIND.TOURNAMENT,
    isDefault: false,
    order: 2,
  },
  {
    // Una colección del PROFESOR, repartida al alumno demo (ver STUDY_SHARES).
    // Es suya, así que él la mantiene; el alumno sólo la lee.
    id: IDS.dbTeacherPack,
    ownerType: OWNER_TYPE.USER,
    userId: IDS.teacherUser as string | null,
    courseId: null as string | null,
    name: "Clavadas para esta semana",
    description: "Ejemplos de clavada que vamos a ver en clase.",
    kind: DATABASE_KIND.COLLECTION,
    isDefault: false,
    order: 0,
  },
  THINK_LIKE_A_GRANDMASTER_DATABASE,
];

/**
 * Reparto de colecciones. Es lo que hace que al alumno demo le APAREZCA la
 * colección del profesor en «Mis estudios», de sólo lectura.
 */
export const STUDY_SHARES = [
  { databaseId: IDS.dbTeacherPack, userId: IDS.demoUser, teacherId: IDS.teacher },
];

export const GAMES = [
  {
    id: IDS.gameNationalR1,
    databaseId: IDS.dbNationalOpen,
    white: "Alumno Demo",
    black: "Rival de la primera ronda",
    whiteElo: 1780 as number | null,
    blackElo: 1712 as number | null,
    result: GAME_RESULT.WHITE_WINS,
    playedAt: new Date("2026-02-14"),
    event: "Nacional Abierto 2026",
    site: "Ciudad de México",
    eco: "C50",
    source: GAME_SOURCE.MANUAL,
    pgn: `[Event "Nacional Abierto 2026"]
[Site "Ciudad de México"]
[Date "2026.02.14"]
[Round "1"]
[White "Alumno Demo"]
[Black "Rival de la primera ronda"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Nc3 Nxe4 8. O-O Bxc3 9. d5 {La entrega de la italiana clásica: se cierra la diagonal y se gana tiempo.} 9... Bf6 10. Re1 Ne7 11. Rxe4 d6 12. Bg5 Bxg5 13. Nxg5 O-O 14. Nxh7 1-0`,
  },
  {
    id: IDS.gameTeacherPin,
    databaseId: IDS.dbTeacherPack,
    white: "Wilhelm Steinitz",
    black: "Curt von Bardeleben",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.WHITE_WINS,
    playedAt: new Date("1895-08-17"),
    event: "Hastings",
    site: "Hastings",
    eco: "C54",
    source: GAME_SOURCE.PGN_IMPORT,
    pgn: `[Event "Hastings"]
[Site "Hastings"]
[Date "1895.08.17"]
[White "Wilhelm Steinitz"]
[Black "Curt von Bardeleben"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Nc3 d5 8. exd5 Nxd5 9. O-O Be6 10. Bg5 Be7 11. Bxd5 Bxd5 12. Nxd5 Qxd5 13. Bxe7 Nxe7 14. Re1 f6 15. Qe2 Qd7 16. Rac1 c6 17. d5 {La clavada de la columna e es el tema: el rey negro no puede salir. [%csl Re7,Re8]} 17... cxd5 18. Nd4 Kf7 19. Ne6 Rhc8 20. Qg4 g6 21. Ng5+ Ke8 22. Rxe7+ 1-0`,
  },
  {
    id: IDS.gameOpera,
    databaseId: IDS.dbKingAttacks,
    white: "Paul Morphy",
    black: "Duque de Brunswick y Conde Isouard",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.WHITE_WINS,
    playedAt: new Date("1858-11-02"),
    event: "Partida de la Ópera",
    site: "París",
    eco: "C41",
    source: GAME_SOURCE.PGN_IMPORT,
    pgn: `[Event "Partida de la Ópera"]
[Site "París"]
[Date "1858.11.02"]
[White "Paul Morphy"]
[Black "Duque de Brunswick y Conde Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 {Una clavada prematura: el desarrollo va primero.} 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 {Doble amenaza sobre b7 y f7. [%csl Rb7,Rf7]} 7... Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 {¡El sacrificio que abre las líneas!} 10... cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ {La entrega final.} 16... Nxb8 17. Rd8# 1-0`,
  },
  {
    id: IDS.gameImmortal,
    databaseId: IDS.dbKingAttacks,
    white: "Adolf Anderssen",
    black: "Lionel Kieseritzky",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.WHITE_WINS,
    playedAt: new Date("1851-06-21"),
    event: "La Inmortal",
    site: "Londres",
    eco: "C33",
    source: GAME_SOURCE.PGN_IMPORT,
    pgn: `[Event "La Inmortal"]
[Site "Londres"]
[Date "1851.06.21"]
[White "Adolf Anderssen"]
[Black "Lionel Kieseritzky"]
[Result "1-0"]

1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5 8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8 15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 {El negro toma todo el material que se le ofrece...} 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6 21. Nxg7+ Kd8 22. Qf6+ {¡Con dos torres y un alfil de menos!} 22... Nxf6 23. Be7# 1-0`,
  },
  {
    id: IDS.gameEvergreen,
    databaseId: IDS.dbKingAttacks,
    white: "Adolf Anderssen",
    black: "Jean Dufresne",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.WHITE_WINS,
    playedAt: new Date("1852-07-01"),
    event: "La Siempreviva",
    site: "Berlín",
    eco: "C52",
    source: GAME_SOURCE.PGN_IMPORT,
    pgn: `[Event "La Siempreviva"]
[Site "Berlín"]
[Date "1852.??.??"]
[White "Adolf Anderssen"]
[Black "Jean Dufresne"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 {El Gambito Evans.} 4... Bxb4 5. c3 Ba5 6. d4 exd4 7. O-O d3 8. Qb3 Qf6 9. e5 Qg6 10. Re1 Nge7 11. Ba3 b5 12. Qxb5 Rb8 13. Qa4 Bb6 14. Nbd2 Bb7 15. Ne4 Qf5 16. Bxd3 Qh5 17. Nf6+ {Comienza la combinación inmortal.} 17... gxf6 18. exf6 Rg8 19. Rad1 Qxf3 {Parece que el negro llega antes...} 20. Rxe7+ Nxe7 21. Qxd7+ {¡La entrega de dama más famosa de la historia!} 21... Kxd7 22. Bf5+ Ke8 23. Bd7+ Kf8 24. Bxe7# 1-0`,
  },
  {
    id: IDS.gameModelOpocensky,
    databaseId: IDS.dbSicilianModels,
    white: "Partida modelo",
    black: "Estructura Opocensky",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.DRAW,
    playedAt: null as Date | null,
    event: "Material del curso",
    site: null as string | null,
    eco: "B92",
    source: GAME_SOURCE.MANUAL,
    pgn: `[Event "Material del curso"]
[White "Partida modelo"]
[Black "Estructura Opocensky"]
[Result "1/2-1/2"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be2 e5 {El montaje Opocensky: el blanco elige la partida larga y posicional.} 7. Nb3 Be7 8. O-O O-O 9. Be3 Be6 10. Qd2 Nbd7 {Posición tabiya: ambos planes giran alrededor de la casilla d5. [%csl Gd5]} 1/2-1/2`,
  },
  {
    id: IDS.gameModelAlapin,
    databaseId: IDS.dbSicilianModels,
    white: "Partida modelo",
    black: "Contra la Alapin",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.DRAW,
    playedAt: null as Date | null,
    event: "Material del curso",
    site: null as string | null,
    eco: "B22",
    source: GAME_SOURCE.MANUAL,
    pgn: `[Event "Material del curso"]
[White "Partida modelo"]
[Black "Contra la Alapin"]
[Result "1/2-1/2"]

1. e4 c5 2. c3 {La Alapin: el blanco evita la Siciliana Abierta.} 2... Nf6 3. e5 Nd5 4. d4 cxd4 5. Nf3 Nc6 6. cxd4 d6 7. Bc4 Nb6 8. Bb5 dxe5 9. Nxe5 Bd7 10. Nxd7 Qxd7 {El negro iguala sin problemas: éste es el esquema que recomendamos.} 1/2-1/2`,
  },
  ...THINK_LIKE_A_GRANDMASTER_GAMES,
];

// ---------------------------------------------------------------------------
// Clases (fechas relativas a "ahora", recalculadas en cada seed)
// ---------------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;

export function buildClasses(now: Date) {
  const pastDate = new Date(now.getTime() - 7 * DAY_MS);
  const upcomingDate = new Date(now.getTime() + 3 * DAY_MS);

  return [
    {
      id: IDS.classPast,
      teacherId: IDS.teacher,
      title: "Ataques al rey en el centro",
      description: "Clase práctica sobre cómo castigar al rey sin enrocar, con la Partida de la Ópera como hilo conductor.",
      scheduledAt: pastDate,
      durationMin: 60,
      status: CLASS_STATUS.COMPLETED,
      meetingProvider: MEETING_PROVIDER.ZOOM,
      meetingUrl: "https://zoom.us/j/00000000000",
      meetingUrlVisibleFrom: new Date(pastDate.getTime() - 30 * 60 * 1000),
      recordingUrl: "https://zoom.us/rec/demo-ataques-al-rey",
      summary:
        "Vimos los tres errores típicos que dejan al rey en el centro y la técnica de Morphy para explotarlos: desarrollo con amenaza, apertura de columnas y sacrificio de calidad en d7.",
    },
    {
      id: IDS.classUpcoming,
      teacherId: IDS.teacher,
      title: "Repaso de la Najdorf: tus dudas",
      description: "Sesión de preguntas sobre el capítulo 2 del curso de la Siciliana.",
      scheduledAt: upcomingDate,
      durationMin: 60,
      status: CLASS_STATUS.SCHEDULED,
      meetingProvider: MEETING_PROVIDER.ZOOM,
      meetingUrl: "https://zoom.us/j/11111111111",
      meetingUrlVisibleFrom: new Date(upcomingDate.getTime() - 30 * 60 * 1000),
      recordingUrl: null as string | null,
      summary: null as string | null,
    },
  ];
}

export const CLASS_BLOCKS = [
  {
    id: IDS.blockPastIntro,
    classId: IDS.classPast,
    order: 1,
    kind: CLASS_BLOCK_KIND.TEXT,
    text: "## Qué vimos\n\nTres señales de que puedes atacar un rey en el centro:\n\n1. Columnas centrales abiertas o semiabiertas.\n2. Ventaja de desarrollo de dos o más piezas.\n3. El rey enemigo sin posibilidad inmediata de enroque.",
    caption: null as string | null,
    videoUrl: null as string | null,
    gameId: null as string | null,
    lessonId: null as string | null,
    positionId: null as string | null,
    movePath: null as string | null,
  },
  {
    id: IDS.blockPastGame,
    classId: IDS.classPast,
    order: 2,
    kind: CLASS_BLOCK_KIND.GAME_REF,
    gameId: IDS.gameOpera as string | null,
    movePath: mainlinePath(19),
    caption: "La Partida de la Ópera desde 10.Cxb5: la fase decisiva del ataque.",
    text: null as string | null,
    videoUrl: null as string | null,
    lessonId: null as string | null,
    positionId: null as string | null,
  },
  {
    id: IDS.blockPastLesson,
    classId: IDS.classPast,
    order: 3,
    kind: CLASS_BLOCK_KIND.LESSON_REF,
    lessonId: IDS.lsBreakD5 as string | null,
    movePath: null as string | null,
    caption: "Repasa la lección de la ruptura ...d5: el mismo principio de apertura del centro.",
    text: null as string | null,
    videoUrl: null as string | null,
    gameId: null as string | null,
    positionId: null as string | null,
  },
  {
    id: IDS.blockPastVideo,
    classId: IDS.classPast,
    order: 4,
    kind: CLASS_BLOCK_KIND.VIDEO,
    videoUrl: "https://www.youtube.com/watch?v=demo-morphy-opera",
    caption: "Video complementario: Morphy y el desarrollo con amenaza.",
    text: null as string | null,
    gameId: null as string | null,
    lessonId: null as string | null,
    positionId: null as string | null,
    movePath: null as string | null,
  },
];

export const CLASS_TRANSCRIPT = {
  classId: IDS.classPast,
  provider: "zoom",
  language: "es",
  status: TRANSCRIPT_STATUS.READY,
  text: "Bienvenidos. Hoy vamos a hablar de los ataques al rey en el centro... [transcripción de demostración]",
  segments: [
    { startMs: 0, speaker: "GM Profesor Demo", text: "Bienvenidos. Hoy vamos a hablar de los ataques al rey en el centro." },
    { startMs: 15000, speaker: "GM Profesor Demo", text: "La Partida de la Ópera es el mejor ejemplo de la historia." },
    { startMs: 42000, speaker: "Alumno Demo", text: "¿Por qué no funciona 3...Ag4 contra 3.d4?" },
  ],
  durationMs: 3600000,
};

// ---------------------------------------------------------------------------
// Progreso y actividad del alumno demo
// ---------------------------------------------------------------------------

export function buildProgress(now: Date) {
  const startedAt = new Date(now.getTime() - 14 * DAY_MS);

  return {
    courseProgress: [
      {
        userId: IDS.demoUser,
        courseId: IDS.courseSicilian,
        status: PROGRESS_STATUS.IN_PROGRESS,
        startedAt,
        completedAt: null as Date | null,
        lastLessonId: IDS.lsPawnStructure as string | null,
      },
      {
        userId: IDS.demoUser,
        courseId: IDS.courseRookEndings,
        status: PROGRESS_STATUS.NOT_STARTED,
        startedAt: null as Date | null,
        completedAt: null as Date | null,
        lastLessonId: null as string | null,
      },
    ],
    chapterProgress: [
      {
        userId: IDS.demoUser,
        chapterId: IDS.chSicilianBasics,
        status: PROGRESS_STATUS.IN_PROGRESS,
        startedAt,
        completedAt: null as Date | null,
      },
    ],
    lessonProgress: [
      {
        userId: IDS.demoUser,
        lessonId: IDS.lsWhatIsSicilian,
        status: PROGRESS_STATUS.COMPLETED,
        startedAt,
        completedAt: new Date(startedAt.getTime() + 30 * 60 * 1000),
      },
      {
        userId: IDS.demoUser,
        lessonId: IDS.lsPawnStructure,
        status: PROGRESS_STATUS.IN_PROGRESS,
        startedAt: new Date(now.getTime() - 2 * DAY_MS),
        completedAt: null as Date | null,
      },
    ],
    trainerChapters: [{ userId: IDS.demoUser, chapterId: IDS.chSicilianNajdorf }],
  };
}

export function buildAttempts(now: Date) {
  return [
    {
      id: IDS.attempt1,
      userId: IDS.demoUser,
      exerciseId: IDS.exNajdorfLine,
      result: ATTEMPT_RESULT.FAILED,
      mistakes: 2,
      durationMs: 95000,
      context: ATTEMPT_CONTEXT.TRAINER,
      createdAt: new Date(now.getTime() - 5 * DAY_MS),
    },
    {
      id: IDS.attempt2,
      userId: IDS.demoUser,
      exerciseId: IDS.exNajdorfLine,
      result: ATTEMPT_RESULT.PASSED,
      mistakes: 0,
      durationMs: 61000,
      context: ATTEMPT_CONTEXT.TRAINER,
      createdAt: new Date(now.getTime() - 4 * DAY_MS),
    },
    {
      id: IDS.attempt3,
      userId: IDS.demoUser,
      exerciseId: IDS.exPoisonedPawn,
      result: ATTEMPT_RESULT.PASSED,
      mistakes: 1,
      durationMs: 30000,
      context: ATTEMPT_CONTEXT.LESSON,
      createdAt: new Date(now.getTime() - 2 * DAY_MS),
    },
  ];
}

export interface SeedActivity {
  id: string;
  type: string;
  subjectType: string;
  subjectId: string;
  topic: string | null;
  daysAgo: number;
  meta?: Record<string, string>;
}

/** ~15 eventos repartidos para que semana/mes/año/histórico den cifras distintas. */
export const ACTIVITIES: SeedActivity[] = [
  // Esta semana
  { id: "ac000000-0000-4000-8000-000000000001", type: ACTIVITY_TYPE.EXERCISE_PASSED, subjectType: SUBJECT_TYPE.EXERCISE, subjectId: IDS.exPoisonedPawn, topic: TOPIC.TACTICS, daysAgo: 2 },
  { id: "ac000000-0000-4000-8000-000000000002", type: ACTIVITY_TYPE.GAME_ANALYZED, subjectType: SUBJECT_TYPE.GAME, subjectId: IDS.gameOpera, topic: TOPIC.TACTICS, daysAgo: 3 },
  { id: "ac000000-0000-4000-8000-000000000003", type: ACTIVITY_TYPE.EXERCISE_PASSED, subjectType: SUBJECT_TYPE.EXERCISE, subjectId: IDS.exNajdorfLine, topic: TOPIC.OPENING_LINE, daysAgo: 4 },
  // Este mes (fuera de esta semana)
  { id: "ac000000-0000-4000-8000-000000000004", type: ACTIVITY_TYPE.CLASS_ATTENDED, subjectType: SUBJECT_TYPE.CLASS, subjectId: IDS.classPast, topic: null, daysAgo: 7 },
  { id: "ac000000-0000-4000-8000-000000000005", type: ACTIVITY_TYPE.LESSON_COMPLETED, subjectType: SUBJECT_TYPE.LESSON, subjectId: IDS.lsWhatIsSicilian, topic: TOPIC.OPENING_LINE, daysAgo: 14 },
  { id: "ac000000-0000-4000-8000-000000000006", type: ACTIVITY_TYPE.GAME_ANALYZED, subjectType: SUBJECT_TYPE.GAME, subjectId: IDS.gameImmortal, topic: TOPIC.TACTICS, daysAgo: 16 },
  { id: "ac000000-0000-4000-8000-000000000007", type: ACTIVITY_TYPE.EXERCISE_PASSED, subjectType: SUBJECT_TYPE.EXERCISE, subjectId: IDS.exLucenaBridge, topic: TOPIC.ENDGAME, daysAgo: 20 },
  // Este año (fuera de este mes)
  { id: "ac000000-0000-4000-8000-000000000008", type: ACTIVITY_TYPE.GAME_ANALYZED, subjectType: SUBJECT_TYPE.GAME, subjectId: IDS.gameEvergreen, topic: TOPIC.TACTICS, daysAgo: 45 },
  { id: "ac000000-0000-4000-8000-000000000009", type: ACTIVITY_TYPE.CLASS_ATTENDED, subjectType: SUBJECT_TYPE.CLASS, subjectId: IDS.classPast, topic: null, daysAgo: 60, meta: { nota: "clase anterior del ciclo" } },
  { id: "ac000000-0000-4000-8000-00000000000a", type: ACTIVITY_TYPE.EXERCISE_PASSED, subjectType: SUBJECT_TYPE.EXERCISE, subjectId: IDS.exPhilidorDefense, topic: TOPIC.ENDGAME, daysAgo: 75 },
  { id: "ac000000-0000-4000-8000-00000000000b", type: ACTIVITY_TYPE.LESSON_COMPLETED, subjectType: SUBJECT_TYPE.LESSON, subjectId: IDS.lsLucena, topic: TOPIC.ENDGAME, daysAgo: 90 },
  { id: "ac000000-0000-4000-8000-00000000000c", type: ACTIVITY_TYPE.EXERCISE_PASSED, subjectType: SUBJECT_TYPE.EXERCISE, subjectId: IDS.exLucenaBridge, topic: TOPIC.ENDGAME, daysAgo: 120 },
  // Histórico (año pasado)
  { id: "ac000000-0000-4000-8000-00000000000d", type: ACTIVITY_TYPE.COURSE_COMPLETED, subjectType: SUBJECT_TYPE.COURSE, subjectId: IDS.courseRookEndings, topic: TOPIC.ENDGAME, daysAgo: 400, meta: { nota: "edición anterior del curso" } },
  { id: "ac000000-0000-4000-8000-00000000000e", type: ACTIVITY_TYPE.CLASS_ATTENDED, subjectType: SUBJECT_TYPE.CLASS, subjectId: IDS.classPast, topic: null, daysAgo: 420 },
  { id: "ac000000-0000-4000-8000-00000000000f", type: ACTIVITY_TYPE.GAME_ANALYZED, subjectType: SUBJECT_TYPE.GAME, subjectId: IDS.gameModelOpocensky, topic: TOPIC.PAWN_STRUCTURE, daysAgo: 450 },
];

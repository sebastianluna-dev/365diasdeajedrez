import type { ExerciseSolverExercise } from "@/components/platform/shared/exercise-solver/exercise-solver.types";

// The sample exercises of the front-only phases (EXERCISES_PERSISTENCE_ENABLED
// off): the twenty of prisma/fixtures/exercise-library.pgn, read once through
// the import (`readExerciseImport`) and written here as data, so the
// contrarreloj has a deck and the history has titles while the database holds
// nothing of theirs. Regenerated from the fixture by hand (2026-10-17); the
// fixture's own test keeps the file importable.

export interface SampleExercise extends ExerciseSolverExercise {
  topicCodes: string[];
}

export const SAMPLE_EXERCISES: SampleExercise[] = [
  {
    id: "muestra-01",
    title: "La dama apoyada por el rey",
    prompt: null,
    kind: "MATE_IN",
    mateIn: 1,
    solutionPgn: '[SetUp "1"]\n[FEN "7k/8/6QK/8/8/8/8/8 w - - 0 1"]\n\n1. Qg7# *\n',
    hints: [],
    explanation:
      "La dama da mate en g7 porque el rey blanco la protege desde h6: el rey negro no puede capturarla ni escapar a h7 o g8.",
    difficulty: 800,
    topicCodes: ["MATING_ATTACK"],
  },
  {
    id: "muestra-02",
    title: "El pasillo con torre",
    prompt: null,
    kind: "MATE_IN",
    mateIn: 1,
    solutionPgn: '[SetUp "1"]\n[FEN "r5k1/8/8/8/8/8/5PPP/6K1 b - - 0 1"]\n\n1... Ra1# *\n',
    hints: [],
    explanation:
      "El rey negro está encerrado por sus propios peones: la torre llega a la octava fila y no hay escape ni defensor.",
    difficulty: 850,
    topicCodes: ["BACK_RANK_MATE"],
  },
  {
    id: "muestra-03",
    title: "La torre que corta la octava",
    prompt: null,
    kind: "MATE_IN",
    mateIn: 1,
    solutionPgn: '[SetUp "1"]\n[FEN "7k/8/6K1/8/8/8/8/R7 w - - 0 1"]\n\n1. Ra8# *\n',
    hints: [],
    explanation:
      "Con el rey blanco en g6 cubriendo g7 y h7, la torre en la octava fila da mate: el rey negro no puede salir de la esquina.",
    difficulty: 900,
    topicCodes: ["MATING_ATTACK", "ENDGAME"],
  },
  {
    id: "muestra-04",
    title: "Mate del pastor",
    prompt: null,
    kind: "MATE_IN",
    mateIn: 1,
    solutionPgn:
      '[SetUp "1"]\n[FEN "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4"]\n\n4. Qxf7# *\n',
    hints: [],
    explanation:
      "La dama captura en f7 protegida por el alfil de c4. El rey negro no puede capturarla ni huir: e7 está atacado por la dama.",
    difficulty: 950,
    topicCodes: ["MATING_ATTACK"],
  },
  {
    id: "muestra-05",
    title: "La dama remata en la esquina",
    prompt: null,
    kind: "MATE_IN",
    mateIn: 1,
    solutionPgn: '[SetUp "1"]\n[FEN "8/8/8/8/8/5kq1/8/7K b - - 0 1"]\n\n1... Qg2# *\n',
    hints: [],
    explanation: "El rey negro, apoyado desde f3, protege a la dama en g2: el rey blanco no tiene ninguna casilla.",
    difficulty: 1000,
    topicCodes: ["MATING_ATTACK"],
  },
  {
    id: "muestra-06",
    title: "El mate ahogado",
    prompt: null,
    kind: "MATE_IN",
    mateIn: 1,
    solutionPgn: '[SetUp "1"]\n[FEN "6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1"]\n\n1. Nf7# *\n',
    hints: [],
    explanation:
      "El caballo da mate en f7: el rey negro está ahogado por su propia torre y sus peones, y nadie puede capturar al caballo.",
    difficulty: 1050,
    topicCodes: ["MATING_ATTACK"],
  },
  {
    id: "muestra-07",
    title: "El pasillo con captura",
    prompt: null,
    kind: "MATE_IN",
    mateIn: 1,
    solutionPgn: '[SetUp "1"]\n[FEN "2r3k1/5ppp/8/8/8/8/5PPP/2Q3K1 w - - 0 1"]\n\n1. Qxc8# *\n',
    hints: [],
    explanation:
      "La dama captura la torre en c8 y da mate en la octava fila: el rey no puede salir porque sus peones le cierran el paso.",
    difficulty: 1100,
    topicCodes: ["BACK_RANK_MATE"],
  },
  {
    id: "muestra-08",
    title: "El mate árabe",
    prompt: null,
    kind: "MATE_IN",
    mateIn: 1,
    solutionPgn: '[SetUp "1"]\n[FEN "7k/R7/5N2/8/8/8/6K1/8 w - - 0 1"]\n\n1. Rh7# *\n',
    hints: [],
    explanation:
      "La torre llega a h7 protegida por el caballo de f6, que además cubre g8: es el mate árabe, torre y caballo contra el rey en la esquina.",
    difficulty: 1150,
    topicCodes: ["MATING_ATTACK"],
  },
  {
    id: "muestra-09",
    title: "El mate de las charreteras",
    prompt: null,
    kind: "MATE_IN",
    mateIn: 1,
    solutionPgn: '[SetUp "1"]\n[FEN "3rkr2/8/2N5/8/7Q/8/8/4K3 w - - 0 1"]\n\n1. Qe7# *\n',
    hints: [],
    explanation:
      "Las dos torres negras, a los lados del rey, le quitan sus propias casillas: la dama llega a e7 protegida por el caballo y es mate.",
    difficulty: 1200,
    topicCodes: ["MATING_ATTACK"],
  },
  {
    id: "muestra-10",
    title: "La dama y el rey",
    prompt: null,
    kind: "MATE_IN",
    mateIn: 1,
    solutionPgn: '[SetUp "1"]\n[FEN "6k1/8/5K1Q/8/8/8/8/8 w - - 0 1"]\n\n1. Qg7# *\n',
    hints: [],
    explanation: "La dama llega a g7 protegida por el rey de f6 y cubre f8, h8 y h7: el rey negro no tiene adónde ir.",
    difficulty: 1250,
    topicCodes: ["MATING_ATTACK", "ENDGAME"],
  },
  {
    id: "muestra-11",
    title: "La coronación decide",
    prompt: null,
    kind: "SEQUENCE",
    mateIn: null,
    solutionPgn: '[SetUp "1"]\n[FEN "8/P5k1/8/8/8/8/8/K7 w - - 0 1"]\n\n1. a8=Q *\n',
    hints: [],
    explanation:
      "El peón corona antes de que el rey negro pueda alcanzarlo: con dama contra rey, el final está decidido.",
    difficulty: 1300,
    topicCodes: ["PROMOTION", "ENDGAME"],
  },
  {
    id: "muestra-12",
    title: "La horquilla de caballo",
    prompt: null,
    kind: "SEQUENCE",
    mateIn: null,
    solutionPgn:
      '[SetUp "1"]\n[FEN "r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1"]\n\n1. Nc7+ Kd8 ( 1... Kd7 2. Nxa8 ) ( 1... Ke7 2. Nxa8 ) 2. Nxa8 *\n',
    hints: [],
    explanation:
      "El caballo da jaque en c7 y al mismo tiempo ataca la torre de a8: el rey tiene que moverse y la torre se pierde.",
    difficulty: 1350,
    topicCodes: ["FORK"],
  },
  {
    id: "muestra-13",
    title: "La enfilada en la columna",
    prompt: null,
    kind: "SEQUENCE",
    mateIn: null,
    solutionPgn:
      '[SetUp "1"]\n[FEN "4q3/8/8/8/4k3/8/8/3R2K1 w - - 0 1"]\n\n1. Re1+ Kd5 ( 1... Kf5 2. Rxe8 ) ( 1... Kd4 2. Rxe8 ) 2. Rxe8 *\n',
    hints: [],
    explanation:
      "La torre da jaque en la columna e; cuando el rey se aparta, la dama que estaba detrás queda a su merced.",
    difficulty: 1450,
    topicCodes: ["SKEWER"],
  },
  {
    id: "muestra-14",
    title: "La clavada que gana la pieza",
    prompt: null,
    kind: "SEQUENCE",
    mateIn: null,
    solutionPgn:
      '[SetUp "1"]\n[FEN "3k4/8/8/3n4/8/4P3/8/3RK3 w - - 0 1"]\n\n1. e4 Ke7 ( 1... Kc7 2. exd5 ) 2. exd5 *\n',
    hints: [],
    explanation:
      "El caballo está clavado por la torre: no puede moverse mientras el rey siga en d8. El peón lo ataca y, haga lo que haga el rey, se captura en la jugada siguiente.",
    difficulty: 1550,
    topicCodes: ["PIN"],
  },
  {
    id: "muestra-15",
    title: "El ataque a la descubierta",
    prompt: null,
    kind: "SEQUENCE",
    mateIn: null,
    solutionPgn:
      '[SetUp "1"]\n[FEN "4k3/8/8/1q6/8/8/4N3/4R1K1 w - - 0 1"]\n\n1. Nd4+ Kd7 ( 1... Qe5 2. Rxe5+ ) ( 1... Qe2 2. Nxe2 ) 2. Nxb5 *\n',
    hints: [],
    explanation:
      "Al moverse el caballo, la torre de e1 da jaque; el caballo, además, ataca la dama de b5. Las negras tienen que responder al jaque y pierden la dama.",
    difficulty: 1650,
    topicCodes: ["DISCOVERED_ATTACK"],
  },
  {
    id: "muestra-16",
    title: "Eliminar al defensor",
    prompt: null,
    kind: "SEQUENCE",
    mateIn: null,
    solutionPgn: '[SetUp "1"]\n[FEN "3r2k1/5ppp/3n4/8/8/8/5PPP/3RR1K1 w - - 0 1"]\n\n1. Rxd6 Rxd6 2. Re8# *\n',
    hints: [],
    explanation:
      "El caballo de d6 era el único defensor de e8. Al capturarlo, la torre entra en la octava fila y da mate del pasillo.",
    difficulty: 1750,
    topicCodes: ["REMOVING_THE_DEFENDER", "BACK_RANK_MATE"],
  },
  {
    id: "muestra-17",
    title: "La desviación en la octava",
    prompt: null,
    kind: "MATE_IN",
    mateIn: 2,
    solutionPgn: '[SetUp "1"]\n[FEN "2r3k1/5ppp/8/8/8/8/3R1PPP/3R2K1 w - - 0 1"]\n\n1. Rd8+ Rxd8 2. Rxd8# *\n',
    hints: [],
    explanation:
      "La primera torre se sacrifica en d8 para desviar a la torre negra; la segunda la recaptura y da mate en la octava fila.",
    difficulty: 1850,
    topicCodes: ["DEFLECTION", "BACK_RANK_MATE"],
  },
  {
    id: "muestra-18",
    title: "La escalera de torres",
    prompt: null,
    kind: "MATE_IN",
    mateIn: 2,
    solutionPgn: '[SetUp "1"]\n[FEN "7k/8/8/8/8/8/R7/1R4K1 w - - 0 1"]\n\n1. Ra7 Kg8 2. Rb8# *\n',
    hints: [],
    explanation:
      "Una torre corta la séptima fila y la otra remata en la octava: el rey, empujado contra el borde, no tiene escape.",
    difficulty: 2000,
    topicCodes: ["MATING_ATTACK", "ENDGAME"],
  },
  {
    id: "muestra-19",
    title: "El rey acompaña a la torre",
    prompt: null,
    kind: "MATE_IN",
    mateIn: 2,
    solutionPgn: '[SetUp "1"]\n[FEN "7k/8/5K2/8/8/8/8/R7 w - - 0 1"]\n\n1. Kg6 Kg8 2. Ra8# *\n',
    hints: [],
    explanation:
      "Primero el rey quita las casillas de escape; después la torre da mate en la octava fila. Es la técnica del final de torre contra rey.",
    difficulty: 2300,
    topicCodes: ["MATING_ATTACK", "ENDGAME"],
  },
  {
    id: "muestra-20",
    title: "El puente de Lucena",
    prompt: null,
    kind: "SEQUENCE",
    mateIn: null,
    solutionPgn:
      '[SetUp "1"]\n[FEN "1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1"]\n\n1. Rd1+ Ke7 2. Rd4 Ra1 3. Kc7 Rc1+ 4. Kb6 Rb1+ 5. Kc6 Rc1+ 6. Kb5 Rb1+ 7. Rb4 *\n',
    hints: [],
    explanation:
      "La torre se coloca en la cuarta fila para construir el puente: el rey sale de la columna del peón y la torre lo cubre de los jaques, hasta que el peón corona.",
    difficulty: 2700,
    topicCodes: ["ENDGAME"],
  },
];

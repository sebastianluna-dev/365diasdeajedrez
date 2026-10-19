import type { ClassPageEditorOptions, EditorBlock } from "./class-page-editor.model";

// A class written in the editor and what its pickers offer, for its stories
// and its tile on the overview sheet while nothing stores the blocks: the
// class of the notebook's sample (`class-notebook.sample.ts`), Lucena's.

const LUCENA = "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1";
const BRIDGE = "1K1k4/1P6/8/8/2R5/8/r7/8 w - - 0 1";
const CLUB = "8/5pk1/6p1/8/1R6/6P1/r4PK1/8 w - - 0 1";
const STUDY = "8/8/3k4/8/3K4/3P4/8/8 w - - 0 1";

export const EDITOR_SAMPLE_OPTIONS: ClassPageEditorOptions = {
  games: [
    {
      id: "g1",
      white: "Luis M.",
      black: "Sofía R.",
      event: "Torneo del club · ronda 3",
      result: "1-0",
      fen: CLUB,
    },
    {
      id: "g2",
      white: "Ana P.",
      black: "Diego T.",
      event: "Estudio «Finales de la semana»",
      result: "½-½",
      fen: STUDY,
    },
  ],
  lessons: [
    { id: "l2", title: "Torre contra peón", course: "Finales de torres · 2" },
    { id: "l4", title: "La defensa de Philidor", course: "Finales de torres · 4" },
  ],
  series: [
    {
      id: "s1",
      title: "Practica el puente",
      exercises: ["Lucena con el rey en a8", "El puente por la quinta fila", "Lucena con las negras"],
    },
    {
      id: "s2",
      title: "Finales de torres: repaso",
      exercises: ["Philidor con las negras", "Corta al rey por la columna", "La torre detrás del peón"],
    },
  ],
};

export const EDITOR_SAMPLE_BLOCKS: EditorBlock[] = [
  {
    id: "b1",
    kind: "text",
    visibility: "BEFORE",
    lead: true,
    text: "El final de torre y peón contra torre es el que más aparece en tus partidas, y casi todo se decide por dos posiciones: la de Lucena, que se gana, y la de Philidor, que se hace tablas. Hoy nos quedamos con la primera.",
  },
  {
    id: "b2",
    kind: "callout",
    visibility: "TEACHER",
    text: "Antes del diagrama, pregunta quién ha llegado a esta posición en una partida suya.",
  },
  { id: "b3", kind: "heading", visibility: "BEFORE", text: "Qué es la posición de Lucena" },
  {
    id: "b4",
    kind: "text",
    visibility: "BEFORE",
    text: "El peón está en séptima, su rey delante y el rey rival cortado por una columna. Parece sencillo, pero si el rey sale sin preparar nada, los jaques de la torre no se acaban.",
  },
  {
    id: "b5",
    kind: "question",
    visibility: "BEFORE",
    fen: LUCENA,
    orientation: "white",
    prompt: "Juegan las blancas. ¿Cuál es la primera jugada del plan?",
    options: [
      {
        id: "o1",
        label: "Rc7: el rey sale ya",
        why: "Todavía no: si el rey sale ahora, los jaques no se acaban.",
        correct: false,
      },
      {
        id: "o2",
        label: "Tc4: la torre a la cuarta fila",
        why: "Exacto: sin la torre en la cuarta, el rey no tiene dónde esconderse.",
        correct: true,
      },
      {
        id: "o3",
        label: "Td1+: jaque primero",
        why: "No estorba, pero no resuelve nada: el plan sigue siendo la cuarta fila.",
        correct: false,
      },
    ],
  },
  { id: "b6", kind: "heading", visibility: "BEFORE", text: "El puente" },
  {
    id: "b7",
    kind: "text",
    visibility: "BEFORE",
    text: "La técnica tiene nombre: construir el puente. Lleva tu torre a la cuarta fila, saca al rey y, cuando lleguen los jaques laterales, interpón la torre.",
  },
  {
    id: "b8",
    kind: "diagram",
    visibility: "BEFORE",
    pgn: `[SetUp "1"]
[FEN "${BRIDGE}"]

{El rey sale por c7 y la torre espera en c4 para interponerse en b4. [%csl Rd8] [%cal Gb8c7,Gc4b4]} *`,
  },
  { id: "b9", kind: "game", visibility: "BEFORE", game: EDITOR_SAMPLE_OPTIONS.games[0] ?? null },
  { id: "b10", kind: "lesson", visibility: "BEFORE", lesson: EDITOR_SAMPLE_OPTIONS.lessons[0] ?? null },
  { id: "b11", kind: "subheading", visibility: "AFTER", text: "Lo que te llevas" },
  { id: "b12", kind: "list", visibility: "AFTER", text: "Primero la torre a la cuarta fila; después el rey." },
  { id: "b13", kind: "list", visibility: "AFTER", text: "Los jaques laterales se cortan interponiendo la torre." },
  { id: "b14", kind: "exercises", visibility: "AFTER", series: EDITOR_SAMPLE_OPTIONS.series[0] ?? null },
];

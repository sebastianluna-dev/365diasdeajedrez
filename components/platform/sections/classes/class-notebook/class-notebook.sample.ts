// Sample content for the class notebook (2026-10-19, front-only): the new
// block kinds — a static diagram with arrows and an «Ahora tú» question —
// and the class's place in a course, its takeaways and the next class. None
// of it is stored yet: every class draws this same sample until the teacher's
// editor and the database learn these kinds. Take it out with them.

import type { StaticDiagramArrow } from "@/components/chess/static-diagram-arrows";

/** A static board with arrows, written by the teacher inside the article. */
export interface NotebookDiagramBlock {
  kind: "DIAGRAM";
  id: string;
  fen: string;
  orientation: "white" | "black";
  arrows: StaticDiagramArrow[];
  /** «Diagrama 1.» and what it shows. */
  label: string;
  caption: string;
}

/** A question inside the article: a position, a prompt and options, each with why. */
export interface NotebookQuestionBlock {
  kind: "QUESTION";
  id: string;
  fen: string;
  orientation: "white" | "black";
  prompt: string;
  options: { id: string; label: string; correct: boolean; explanation: string }[];
}

/** An article's own text: a heading and paragraphs, the first one larger when it opens the article. */
export interface NotebookTextBlock {
  kind: "ARTICLE_TEXT";
  id: string;
  heading?: string;
  paragraphs: string[];
  lead?: boolean;
}

export type NotebookSampleBlock = NotebookDiagramBlock | NotebookQuestionBlock | NotebookTextBlock;

export interface NotebookSample {
  /** The course the class belongs to, and where in it. */
  course: { name: string; index: number; total: number; previous: string | null; next: string | null };
  blocks: NotebookSampleBlock[];
  takeaways: string[];
  nextClass: { title: string; when: string };
}

const LUCENA = "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1";
const BRIDGE = "1K1k4/1P6/8/8/2R5/8/r7/8 w - - 0 1";

export const NOTEBOOK_SAMPLE: NotebookSample = {
  course: {
    name: "Finales de torres",
    index: 3,
    total: 6,
    previous: "Torre contra peón",
    next: "La defensa de Philidor",
  },
  blocks: [
    {
      kind: "ARTICLE_TEXT",
      id: "sample-lead",
      lead: true,
      paragraphs: [
        "El final de torre y peón contra torre es el que más aparece en tus partidas, y casi todo se decide por dos posiciones: la de Lucena, que se gana, y la de Philidor, que se hace tablas. Hoy nos quedamos con la primera.",
      ],
    },
    {
      kind: "ARTICLE_TEXT",
      id: "sample-lucena",
      heading: "Qué es la posición de Lucena",
      paragraphs: [
        "El peón está en séptima, su rey delante y el rey rival cortado por una columna. Parece sencillo, pero si el rey sale sin preparar nada, los jaques de la torre no se acaban.",
      ],
    },
    {
      kind: "QUESTION",
      id: "sample-question",
      fen: LUCENA,
      orientation: "white",
      prompt: "Juegan las blancas. ¿Cuál es la primera jugada del plan?",
      options: [
        {
          id: "king",
          label: "Rc7: el rey sale ya",
          correct: false,
          explanation: "Todavía no: si el rey sale ahora, los jaques no se acaban. Prueba otra.",
        },
        {
          id: "rook",
          label: "Tc4: la torre a la cuarta fila",
          correct: true,
          explanation: "Exacto: sin la torre en la cuarta fila, el rey no tiene dónde esconderse de los jaques.",
        },
        {
          id: "check",
          label: "Td1+: jaque primero",
          correct: false,
          explanation: "El jaque no estorba, pero no resuelve nada: el plan sigue siendo llevar la torre a la cuarta.",
        },
      ],
    },
    {
      kind: "ARTICLE_TEXT",
      id: "sample-bridge",
      heading: "El puente",
      paragraphs: [
        "La técnica tiene nombre: construir el puente. Lleva tu torre a la cuarta fila, saca al rey y, cuando lleguen los jaques laterales, interpón la torre.",
      ],
    },
    {
      kind: "DIAGRAM",
      id: "sample-diagram",
      fen: BRIDGE,
      orientation: "white",
      arrows: [
        { from: "b8", to: "c7", tone: "success" },
        { from: "c4", to: "b4", tone: "success" },
      ],
      label: "Diagrama.",
      caption: "El rey sale por c7 y la torre espera en c4 para interponerse en b4.",
    },
  ],
  takeaways: [
    "Primero la torre a la cuarta fila; después el rey.",
    "Los jaques laterales se cortan interponiendo la torre.",
    "Si el rey rival no está cortado, no es Lucena: es otro final.",
  ],
  nextClass: { title: "La defensa de Philidor", when: "Jue 29 oct · 18:00" },
};

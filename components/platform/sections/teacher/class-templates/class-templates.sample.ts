import { writeDiagramPgn } from "@/lib/chess/diagram-notation";
import type { EditorBlock } from "@/components/platform/sections/teacher/classes/class-page-editor/class-page-editor.model";
import {
  EDITOR_SAMPLE_BLOCKS,
  EDITOR_SAMPLE_OPTIONS,
} from "@/components/platform/sections/teacher/classes/class-page-editor/class-page-editor.sample";

// The academy's ready-made classes (2026-10-19, front-only): what «Clases
// prediseñadas» lists and opens in the class editor while nothing stores
// them. Every teacher sees these same three. Take it out when the library is
// stored.

export interface ClassTemplate {
  slug: string;
  title: string;
  /** «Finales de torres». */
  course: string;
  level: string;
  durationMin: number;
  /** One sentence: what the class teaches. */
  summary: string;
  /** The board its card shows. */
  preview: { fen: string; orientation: "white" | "black" };
  blocks: EditorBlock[];
}

const PHILIDOR = "4k3/7R/8/4PK2/8/8/8/1r6 b - - 0 1";
const PHILIDOR_HELD = "4k3/7R/1r6/4PK2/8/8/8/8 w - - 0 1";
const BACK_RANK = "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1";

export const CLASS_TEMPLATES: ClassTemplate[] = [
  {
    slug: "la-posicion-de-lucena",
    title: "La posición de Lucena",
    course: "Finales de torres",
    level: "Intermedio",
    durationMin: 60,
    summary: "Cómo se gana el final de torre y peón contra torre: construir el puente.",
    preview: { fen: "1K1k4/1P6/8/8/2R5/8/r7/8 w - - 0 1", orientation: "white" },
    blocks: EDITOR_SAMPLE_BLOCKS,
  },
  {
    slug: "la-defensa-de-philidor",
    title: "La defensa de Philidor",
    course: "Finales de torres",
    level: "Intermedio",
    durationMin: 60,
    summary: "Cómo se hacen tablas con la torre en la tercera fila, y cuándo pasar a los jaques por detrás.",
    preview: { fen: PHILIDOR_HELD, orientation: "black" },
    blocks: [
      {
        id: "p1",
        kind: "text",
        lead: true,
        text: "Si en la clase de Lucena aprendiste a ganar, hoy toca lo contrario: defender. Con el rey delante del peón y la torre en su sitio, el final es tablas.",
      },
      { id: "p2", kind: "heading", text: "La torre en la tercera fila" },
      {
        id: "p3",
        kind: "text",
        text: "Mientras el peón no llega a la sexta, la torre del defensor se queda en su tercera fila y no deja pasar al rey rival.",
      },
      {
        id: "p4",
        kind: "question",
        fen: PHILIDOR,
        orientation: "black",
        prompt: "Juegan las negras. ¿Dónde va la torre?",
        options: [
          {
            id: "q1",
            label: "Tf1+: jaque ya",
            why: "Pronto: el rey blanco se esconde y tu torre deja de cortarlo.",
            correct: false,
          },
          {
            id: "q2",
            label: "Tb6: a la tercera fila",
            why: "Eso es: desde ahí el rey blanco no puede avanzar.",
            correct: true,
          },
          {
            id: "q3",
            label: "Rd8: el rey se acerca",
            why: "El rey ya está bien; lo que falta es poner la torre en su fila.",
            correct: false,
          },
        ],
      },
      {
        id: "p5",
        kind: "diagram",
        pgn: writeDiagramPgn({
          fen: PHILIDOR_HELD,
          orientation: "black",
          caption: "La torre en b6 no deja pasar al rey: si el peón avanza a e6, los jaques llegan por detrás.",
          circles: [{ square: "b6", color: "green" }],
          arrows: [{ from: "b6", to: "h6", color: "green" }],
        }),
      },
      { id: "p6", kind: "subheading", text: "Lo que te llevas" },
      { id: "p7", kind: "list", text: "La torre en la tercera fila hasta que el peón avance." },
      { id: "p8", kind: "list", text: "Cuando el peón llega a la sexta, la torre se va atrás a dar jaques." },
      { id: "p9", kind: "lesson", lesson: EDITOR_SAMPLE_OPTIONS.lessons[1] ?? null },
    ],
  },
  {
    slug: "el-mate-del-pasillo",
    title: "El mate del pasillo",
    course: "Táctica para empezar",
    level: "Principiante",
    durationMin: 45,
    summary: "El mate que más se ve en las primeras partidas, y cómo no caer en él.",
    preview: { fen: BACK_RANK, orientation: "white" },
    blocks: [
      {
        id: "m1",
        kind: "text",
        lead: true,
        text: "Un rey encerrado por sus propios peones no tiene a dónde ir. Si una torre llega a su fila, es mate.",
      },
      {
        id: "m2",
        kind: "diagram",
        pgn: writeDiagramPgn({
          fen: BACK_RANK,
          orientation: "white",
          caption: "Los peones de f7, g7 y h7 encierran al rey: la torre entra por d8.",
          circles: [{ square: "g8", color: "red" }],
          arrows: [{ from: "d1", to: "d8", color: "green" }],
        }),
      },
      {
        id: "m3",
        kind: "question",
        fen: BACK_RANK,
        orientation: "white",
        prompt: "Juegan las blancas. ¿Cómo dan mate?",
        options: [
          { id: "q1", label: "Td8+", why: "Mate: el rey no tiene casillas y nada tapa la fila.", correct: true },
          { id: "q2", label: "h3: dar aire primero", why: "Eso es defender: aquí puedes atacar ya.", correct: false },
        ],
      },
      {
        id: "m4",
        kind: "callout",
        text: "Para no caer en él: cuando puedas, mueve un peón delante de tu rey y dale una salida.",
      },
      { id: "m5", kind: "exercises", series: EDITOR_SAMPLE_OPTIONS.series[1] ?? null },
    ],
  },
];

export function classTemplateBySlug(slug: string): ClassTemplate | undefined {
  return CLASS_TEMPLATES.find((template) => template.slug === slug);
}

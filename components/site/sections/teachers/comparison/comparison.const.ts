// The comparison table of the teachers' landing (the owner's «Comparación A»),
// with the owner's corrections of 2026-10-26: keeping a student's balance of
// classes is «Próximamente» for the teacher (payments are only kept track of,
// never charged), and classes inside the platform are «Próximamente» too.

export type ComparisonMark = "yes" | "no" | "part" | "soon";

export type ComparisonIcon = "calendar" | "list" | "tag" | "board" | "file" | "play" | "eye" | "cap";

export interface ComparisonCell {
  mark: ComparisonMark;
  text: string;
}

export interface ComparisonRow {
  icon: ComparisonIcon;
  feature: string;
  chat: ComparisonCell;
  sites: ComparisonCell;
  ours: ComparisonCell;
}

export const COMPARISON_MARK_LABEL: Record<ComparisonMark, string> = {
  yes: "Sí",
  no: "No",
  part: "En parte",
  soon: "Próximamente",
};

export const COMPARISON_COLUMNS = {
  chat: { title: "WhatsApp + hojas de cálculo", note: "Lo que casi todos usamos hoy" },
  sites: { title: "Lichess / Chess.com", note: "Muy buenas para jugar y entrenar" },
  ours: { title: "Plataforma Ajedrez 365", note: "Hecha para dar clases" },
} as const;

export const COMPARISON_ROWS: readonly ComparisonRow[] = [
  {
    icon: "calendar",
    feature: "Agenda y enlace de cada clase",
    chat: { mark: "part", text: "A mano: un mensaje por alumno y una hoja" },
    sites: { mark: "no", text: "No llevan la agenda de tus clases" },
    ours: { mark: "yes", text: "Cada clase con su fecha, su hora y su enlace; programarlas tú, próximamente" },
  },
  {
    icon: "list",
    feature: "Asistencia",
    chat: { mark: "part", text: "Una hoja que llenas tú" },
    sites: { mark: "no", text: "No llevan tu lista de asistencia" },
    ours: { mark: "yes", text: "Pasas lista; la falta gasta la clase" },
  },
  {
    icon: "tag",
    feature: "Saldo de clases de cada alumno",
    chat: { mark: "part", text: "Fórmulas en la hoja, a mano" },
    sites: { mark: "no", text: "No llevan lo que te pagan" },
    ours: { mark: "soon", text: "Anotas quién pagó y cuántas le quedan; el cobro, fuera de la plataforma" },
  },
  {
    icon: "board",
    feature: "Ejercicios propios con seguimiento",
    chat: { mark: "no", text: "Mandas una foto; no sabes quién la resolvió" },
    sites: { mark: "part", text: "Estudios y problemas; poco seguimiento por alumno" },
    ours: { mark: "yes", text: "Los escribes en el tablero y ves quién los resolvió" },
  },
  {
    icon: "file",
    feature: "Material por clase",
    chat: { mark: "part", text: "Archivos sueltos en el chat" },
    sites: { mark: "part", text: "Un estudio compartido por enlace" },
    ours: { mark: "yes", text: "Para preparar, para después o tu guion" },
  },
  {
    icon: "play",
    feature: "Clases dentro de la plataforma",
    chat: { mark: "part", text: "Videollamada, sin tablero compartido" },
    sites: { mark: "no", text: "El tablero sí; la videollamada, aparte" },
    ours: { mark: "soon", text: "Con el tablero al centro; hoy, tu enlace" },
  },
  {
    icon: "eye",
    feature: "Privacidad de menores",
    chat: { mark: "no", text: "En un grupo, todos ven el teléfono de todos" },
    sites: { mark: "part", text: "Cuentas para niños, dentro de una red pública" },
    ours: { mark: "yes", text: "Sin registro público ni chat entre usuarios" },
  },
  {
    icon: "cap",
    feature: "Cursos estructurados",
    chat: { mark: "no", text: "No es para eso" },
    sites: { mark: "yes", text: "Lecciones generales, no las de tu academia" },
    ours: { mark: "yes", text: "Los cursos de la academia, para todos" },
  },
];

// The teachers' questions (the owner's «Preguntas A»). They are not the
// academy's FAQ (the `home-faq` Global, which speaks to students and their
// families), so they live here as typed data; whatever does not exist yet
// says «próximamente».

export type TeachersFaqIcon = "house" | "play" | "tag" | "clock" | "users" | "board" | "cap" | "eye" | "calendar";

export interface TeachersFaqItem {
  icon: TeachersFaqIcon;
  question: string;
  answer: string;
}

export const TEACHERS_FAQ: readonly TeachersFaqItem[] = [
  {
    icon: "house",
    question: "¿Hay que instalar algo?",
    answer:
      "No. Es una página web: se abre en el navegador de la computadora, de la tableta o del teléfono, y funciona en los tres. Tus alumnos tampoco instalan nada.",
  },
  {
    icon: "play",
    question: "¿Las clases son dentro de la plataforma?",
    answer:
      "Próximamente: un salón de video dentro de la plataforma, con el tablero compartido al centro. Hoy pones el enlace de tu videollamada en cada clase y tus alumnos entran desde ahí.",
  },
  {
    icon: "tag",
    question: "¿Cobro a mis alumnos por aquí?",
    answer:
      "No. La plataforma no cobra ni recibe pagos: cobras como ya lo haces. Llevar aquí el control de quién pagó y cuántas clases le quedan a cada alumno, registrándolo tú desde tu cuenta, llega próximamente.",
  },
  {
    icon: "clock",
    question: "¿Caducan las clases?",
    answer:
      "No. Una clase pagada no caduca. Si el alumno falta, la clase cuenta como tomada, salvo que se le dé otra fecha.",
  },
  {
    icon: "users",
    question: "¿Un alumno puede tener dos profesores?",
    answer: "Sí, próximamente: ocupa un asiento de cada profesor, y cada uno lo tiene en su lista de alumnos.",
  },
  {
    icon: "board",
    question: "¿Puedo usar mis propios ejercicios y mis PGN?",
    answer:
      "Sí. Escribes tus ejercicios jugando la solución en el tablero, con variantes y comentarios, los juntas en series, se los dejas a tus alumnos y ves quién los resolvió. Tus partidas en PGN las importas a tus estudios; importar ejercicios desde un PGN llega próximamente.",
  },
  {
    icon: "cap",
    question: "¿Mis alumnos ven los cursos de la academia?",
    answer:
      "Sí. Todo el que tiene acceso a la plataforma ve los cursos, la biblioteca de ejercicios y las series de la academia, también tus alumnos.",
  },
  {
    icon: "eye",
    question: "¿Hay chat con desconocidos?",
    answer:
      "No. No hay chat entre usuarios ni registro público: cada alumno existe porque alguien lo inscribe, y en una clase grupal sus compañeros sólo ven su nombre.",
  },
  {
    icon: "calendar",
    question: "¿Cuándo está disponible?",
    answer:
      "La academia 365 días de ajedrez ya la usa con sus alumnos. Para profesores, clubes y escuelas abrimos poco a poco: agenda una demo o únete a la lista de espera y te avisamos.",
  },
];

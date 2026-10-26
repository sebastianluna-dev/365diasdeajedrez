// The WhatsApp messages the teachers' landing composes. There is no lead
// backend (the owner's decision of 2026-10-26): a form gathers its fields,
// writes them into a message and opens WhatsApp with it, ready to send.

export type DemoRole = "profesor" | "club" | "escuela";

export type DemoIntent = "demo" | "lista";

export const DEMO_ROLES: readonly { value: DemoRole; label: string; phrase: string }[] = [
  { value: "profesor", label: "Profesor", phrase: "profesor de ajedrez" },
  { value: "club", label: "Club", phrase: "de un club de ajedrez" },
  { value: "escuela", label: "Escuela", phrase: "de una escuela de ajedrez" },
];

export const DEMO_STUDENT_RANGES = ["1 a 10", "11 a 30", "31 a 100", "Más de 100"] as const;

export type DemoStudentRange = (typeof DEMO_STUDENT_RANGES)[number];

export interface DemoRequest {
  intent: DemoIntent;
  name: string;
  role: DemoRole;
  students: DemoStudentRange;
}

/** «Agenda una demo» and «Únete a la lista de espera»: who writes, what they are and how many students they have. */
export function demoRequestMessage({ intent, name, role, students }: DemoRequest): string {
  const phrase = DEMO_ROLES.find((entry) => entry.value === role)?.phrase ?? "profesor de ajedrez";
  return [
    `Hola, soy ${name.trim()}, ${phrase}.`,
    intent === "demo"
      ? "Quiero agendar una demo de Plataforma Ajedrez 365."
      : "Quiero unirme a la lista de espera de Plataforma Ajedrez 365.",
    `Alumnos: ${students.toLowerCase()}.`,
  ].join("\n");
}

const seatsWord = (count: number) => (count === 1 ? "asiento" : "asientos");

/** «Pide tu precio» of the seats calculator, with the numbers of its bars. */
export function seatPriceMessage(individual: number, group: number): string {
  const total = individual + group;
  return [
    "Hola, soy profesor de ajedrez y me interesa Plataforma Ajedrez 365.",
    `Tengo ${total} ${total === 1 ? "alumno activo" : "alumnos activos"}: ${individual} en clases individuales y ${group} en grupales.`,
    `¿Cuánto costarían ${total} ${seatsWord(total)}?`,
  ].join("\n");
}

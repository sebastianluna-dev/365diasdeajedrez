// The sample week of a school (the owner's «Escuelas C»): three teachers, six
// days, and the classes each one sees in their own agenda.

export type SchoolTeacherId = "laura" | "diego" | "monica";

export interface SchoolTeacher {
  id: SchoolTeacherId;
  name: string;
  initials: string;
}

export interface SchoolClass {
  teacher: SchoolTeacherId;
  /** 0 is Monday. */
  day: number;
  /** 0 is the first hour of `SCHOOL_WEEK_HOURS`. */
  hour: number;
  span: number;
  title: string;
  people: string;
}

export const SCHOOL_TEACHERS: readonly SchoolTeacher[] = [
  { id: "laura", name: "Laura", initials: "LM" },
  { id: "diego", name: "Diego", initials: "DS" },
  { id: "monica", name: "Mónica", initials: "MR" },
];

export const SCHOOL_WEEK_DAYS = ["Lun 2", "Mar 3", "Mié 4", "Jue 5", "Vie 6", "Sáb 7"] as const;

export const SCHOOL_WEEK_HOURS = ["16:00", "17:00", "18:00", "19:00", "20:00"] as const;

export const SCHOOL_CLASSES: readonly SchoolClass[] = [
  { teacher: "laura", day: 0, hour: 0, span: 1, title: "Finales de torres", people: "Individual · Sofía" },
  { teacher: "diego", day: 0, hour: 2, span: 1, title: "Ataque al rey", people: "Individual · Valentina" },
  { teacher: "monica", day: 1, hour: 1, span: 2, title: "Taller de táctica", people: "Grupal · 5 alumnos" },
  { teacher: "laura", day: 1, hour: 3, span: 1, title: "La Najdorf", people: "Individual · Mateo" },
  { teacher: "diego", day: 2, hour: 0, span: 1, title: "Peones pasados", people: "Individual · Luis" },
  { teacher: "laura", day: 2, hour: 2, span: 2, title: "Club de los miércoles", people: "Grupal · Ana, Pablo, Mateo" },
  { teacher: "monica", day: 3, hour: 0, span: 1, title: "Mates básicos", people: "Individual · Iker" },
  { teacher: "laura", day: 3, hour: 3, span: 1, title: "Repaso de aperturas", people: "Individual · Ana" },
  { teacher: "diego", day: 4, hour: 1, span: 1, title: "Estructuras de peones", people: "Individual · Emilia" },
  { teacher: "monica", day: 4, hour: 3, span: 1, title: "Finales de alfil", people: "Individual · Renata" },
  { teacher: "laura", day: 5, hour: 0, span: 1, title: "Partidas comentadas", people: "Individual · Pablo" },
  { teacher: "diego", day: 5, hour: 2, span: 2, title: "Torneo interno", people: "Grupal · 6 alumnos" },
];

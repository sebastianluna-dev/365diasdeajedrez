import type { ClassAgendaDay } from "@/components/platform/shared/class-agenda/class-agenda.comp";
import type { ClassRowData } from "@/components/platform/shared/class-row/class-row.types";
import type { MeetingJoinData } from "@/components/platform/shared/meeting-join-card/meeting-join-card.types";
import type { TeacherClassRow } from "@/services/teacher-classes/teacher-classes.types";

/** «Tu próxima clase»: the row's data, how to join it, and its description. */
export interface TeacherNextClass {
  row: TeacherClassRow;
  join: MeetingJoinData;
  description: string | null;
}

export interface TeacherDashboard {
  displayName: string;
  /** The zone the teacher reads in, and whether it fell back to the academy's (the line with the «i»). */
  timeZone: string;
  timeZoneMissing: boolean;
  nowIso: string;
  todayCount: number;
  next: TeacherNextClass | null;
  /** Classes that ended and wait for the teacher, each with «Finalizar». */
  awaitingClose: ClassRowData[];
  /** This week, by day. */
  week: ClassAgendaDay[];
}

export interface TeacherProfile {
  displayName: string;
  title?: string;
  bio?: string;
  photo?: string;
  timezone?: string;
  email: string;
}

import type { ClassPhaseCode } from "@/constants/platform/class-codes.const";
import type {
  FinalizeClassAction,
  FinalizeClassData,
} from "@/components/platform/shared/finalize-class-popup/finalize-class-popup.types";
import type {
  MeetingLinkCurrent,
  SetMeetingAction,
} from "@/components/platform/shared/meeting-link-popup/meeting-link-popup.types";

// What a row of classes draws, as data: the services map a class to it and
// the sections hand it to `ClassRow` and `ClassAgenda`. No component travels
// in it; the action is a datum too (§2.4 of the plan).

/** What a chip of the row says, by its icon. */
export type ClassRowChipIcon =
  | "no-link"
  | "unpaid"
  | "free"
  | "group"
  | "prepare"
  | "after"
  | "script"
  | "no-content"
  | "no-topic"
  | "teacher-inactive";

export interface ClassRowChip {
  label: string;
  icon: ClassRowChipIcon;
  tone?: "warning" | "success" | "neutral";
}

/**
 * The action at the end of a row, as data: a link the row draws itself, or
 * one that opens a popup through `ClassRowAction` with the server action
 * the section hands down in `serverActions`: the meeting link (the staff's
 * agenda) or finalizing the class (the teacher's panel).
 */
export type ClassRowActionData =
  | { kind: "link"; label: string; href: string }
  | { kind: "meeting"; label: string; classId: string; current: MeetingLinkCurrent }
  | { kind: "finalize"; label: string; finalize: FinalizeClassData };

/** The server actions a row's action may need, passed as functions from the section; stubs in Storybook. */
export interface ClassRowServerActions {
  setMeeting?: SetMeetingAction;
  finalize?: FinalizeClassAction;
}

export interface ClassRowData {
  id: string;
  /** Where the row leads: the class's page for the reader. */
  href: string;
  /** The display title (`classDisplayTitle`): never null. */
  title: string;
  phase: ClassPhaseCode;
  startIso: string;
  durationMin: number;
  /** The zone the reader reads in. */
  timeZone: string;
  /** The instant the page was read: today's tile, and «Hoy» in the words. */
  nowIso: string;
  /** Who: «GM Profesor Demo · Andrea López · Individual» for the staff, «Andrea López · Individual» for the teacher. */
  people: string;
  chips: ClassRowChip[];
  action?: ClassRowActionData;
}

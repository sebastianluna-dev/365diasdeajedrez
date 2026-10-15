import type { ClassPhaseCode } from "@/constants/platform/class-codes.const";

// What a row of classes draws, as data: the services map a class to it and
// the sections hand it to `ClassRow` and `ClassAgenda`. No component travels
// in it; the action is a datum too (§2.4 of the plan).

/** What a chip of the row says, by its icon. */
export type ClassRowChipIcon =
  "no-link" | "unpaid" | "free" | "group" | "prepare" | "after" | "script" | "no-content" | "no-topic";

export interface ClassRowChip {
  label: string;
  icon: ClassRowChipIcon;
  tone?: "warning" | "success" | "neutral";
}

/**
 * The action at the end of a row, as data. This phase knows the link; the
 * ones that open a popup (the meeting link, finalizing) come with phases 5
 * and 6 through `ClassRowAction`.
 */
export type ClassRowActionData = { kind: "link"; label: string; href: string };

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

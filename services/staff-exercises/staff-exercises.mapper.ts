import type {
  ExerciseAuthoringPermissions,
  ExerciseSaveButton,
} from "@/components/platform/shared/exercise-authoring/exercise-authoring.types";
import type { ExerciseCardData } from "@/components/platform/shared/exercise-card/exercise-card.types";
import type { Prisma } from "@/lib/platform-db/generated/client";
import {
  EXERCISE_STATUS,
  type ExerciseKindCode,
  type ExerciseStatusCode,
} from "@/constants/platform/exercise-codes.const";
import { exerciseKindLabel, playerOfStart } from "@/lib/chess/exercise-labels";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { staffRoutes } from "@/lib/platform-routes";
import { levelOfDifficulty, type DifficultyLevel } from "@/services/shared/exercise-level";
import { exerciseFacts } from "@/services/shared/exercise-facts";
import { exerciseTransition, type ExerciseOwnerKind } from "@/services/shared/exercise-status-transitions";
import { seriesItemAvailability } from "@/services/shared/exercise-visibility-rules";
import { exerciseAuthorLabel } from "@/services/teacher-exercises/teacher-exercises.mapper";
import type { SeriesItemData, SeriesItemRow } from "@/services/teacher-exercises/teacher-exercises.types";
import type { StaffExerciseReview, StaffExerciseRow, StaffReviewItem, StaffSeriesCard } from "./staff-exercises.types";

// From the rows of the staff's exercise bank to what its screens draw. Pure:
// what the staff may decide is read from the shared transitions table
// (`exercise-status-transitions.ts`, the staff's rows), so the review bar
// never offers what `reviewLibraryExercise` would refuse.

/** Who owns a bank's row: a teacher, or the academy. A lesson's never reaches these screens. */
export function staffExerciseOwner(row: Pick<StaffExerciseRow, "teacherId">): ExerciseOwnerKind {
  return row.teacherId === null ? "academy" : "teacher";
}

/** A bank's exercise: not a lesson's, whose panel is the course's. */
export const ofABank = { lessonId: null } satisfies Prisma.ExerciseWhereInput;

/**
 * The exercises of a bank the staff may open and decide on: the academy's,
 * and a teacher's once proposed or ever reviewed. The page reads with it
 * (404 otherwise) and every decision checks it again inside its
 * transaction: a lesson's draft is not approved from here, nor a lesson's
 * archived one restored.
 */
export function staffReadableExerciseWhere(exerciseId: string): Prisma.ExerciseWhereInput {
  return {
    AND: [
      { id: exerciseId },
      ofABank,
      {
        OR: [
          { teacherId: null },
          { status: { code: { in: [EXERCISE_STATUS.IN_REVIEW, EXERCISE_STATUS.PUBLISHED] } } },
          { reviewedAt: { not: null } },
        ],
      },
    ],
  };
}

/** The topics of a row in the catalog's order. */
function topicsOf(row: Pick<StaffExerciseRow, "topics">) {
  return [...row.topics].map(({ topic }) => topic).sort((left, right) => left.order - right.order);
}

/** A card of the staff's bank: the title opens the staff editor, and the author is named. */
export function mapStaffExerciseCard(
  row: Pick<
    StaffExerciseRow,
    | "id"
    | "title"
    | "startFen"
    | "status"
    | "kind"
    | "mateIn"
    | "difficulty"
    | "playerMoves"
    | "topics"
    | "teacherId"
    | "teacher"
  >,
  levels: readonly DifficultyLevel[],
): ExerciseCardData {
  return {
    id: row.id,
    href: staffRoutes.exerciseDetail(row.id),
    title: row.title,
    startFen: row.startFen,
    orientation: playerOfStart(row.startFen),
    statusCode: row.status.code as ExerciseStatusCode,
    statusLabel: row.status.label,
    kindLabel: exerciseKindLabel(row.kind.code as ExerciseKindCode, row.mateIn),
    difficulty: row.difficulty,
    levelName: levelOfDifficulty(row.difficulty, levels)?.name ?? null,
    playerMoves: row.playerMoves,
    topicLabels: topicsOf(row).map((topic) => topic.label),
    authorLabel: exerciseAuthorLabel(row),
    allowed: { duplicate: false, archive: false, restore: false, delete: false },
  };
}

/** «Propuesto el 14 de octubre, 2026 por Profesor Demo»; without a date, only who. */
export function submittedLabelOf(row: Pick<StaffExerciseRow, "submittedAt" | "teacherId" | "teacher">): string {
  const who = exerciseAuthorLabel(row);
  return row.submittedAt ? `Propuesto el ${formatSpanishDate(row.submittedAt)} por ${who}` : `Propuesto por ${who}`;
}

/** A proposal in the queue. */
export function mapStaffReviewItem(row: StaffExerciseRow, levels: readonly DifficultyLevel[]): StaffReviewItem {
  return { card: mapStaffExerciseCard(row, levels), submittedLabel: submittedLabelOf(row) };
}

/** The staff's moves, as the stamp names them. */
export type StaffDecision = "approved" | "returned" | "removed" | "published" | "archived" | "restored";

const DECISION_WORDS: Record<StaffDecision, string> = {
  approved: "Aprobado",
  returned: "Devuelto",
  removed: "Quitado de la biblioteca",
  published: "Publicado",
  archived: "Archivado",
  restored: "Restaurado",
};

/**
 * The move the last staff stamp (`reviewedAt`, `reviewedById`, `reviewNote`)
 * belongs to — not the current status, which the teacher may have moved
 * since: an archived exercise that was returned says «Devuelto», and one
 * taken out of the library «Quitado de la biblioteca», not «Devuelto». The
 * academy's only move through the staff, so its status is the move. A
 * teacher's in the library was approved; out of it, the stamp is a return
 * or a removal, told apart by the dates: a removal follows a publication
 * that followed the proposal (`submittedAt` < `publishedAt` < `reviewedAt`),
 * a return does not. Only an exercise approved twice and then taken out
 * again reads «Devuelto» instead (`publishedAt` keeps the FIRST
 * publication); storing the move would settle it (IMPROVEMENTS).
 */
export function lastStaffDecision(
  row: Pick<StaffExerciseRow, "teacherId" | "status" | "submittedAt" | "reviewedAt" | "publishedAt">,
): StaffDecision | null {
  if (row.reviewedAt === null) return null;
  const status = row.status.code as ExerciseStatusCode;
  if (staffExerciseOwner(row) === "academy") {
    if (status === EXERCISE_STATUS.PUBLISHED) return "published";
    if (status === EXERCISE_STATUS.ARCHIVED) return "archived";
    if (status === EXERCISE_STATUS.DRAFT) return "restored";
    return null;
  }
  if (status === EXERCISE_STATUS.PUBLISHED) return "approved";
  const removed =
    row.publishedAt !== null &&
    row.reviewedAt > row.publishedAt &&
    (row.submittedAt === null || row.submittedAt < row.publishedAt);
  return removed ? "removed" : "returned";
}

/**
 * The review bar of a bank's exercise: what the staff may decide now, from
 * the staff's rows of the transitions table — «Aprobar» and «Devolver» on a
 * proposal, «Quitar de la biblioteca» on one in the library (a teacher's goes
 * back to READY, the academy's to ARCHIVED) — and the last decision in words.
 */
export function staffExerciseReview(row: StaffExerciseRow): StaffExerciseReview {
  const status = row.status.code as ExerciseStatusCode;
  const owner = staffExerciseOwner(row);
  const may = (to: ExerciseStatusCode) => exerciseTransition(status, to, "staff", owner) !== null;
  const removal = owner === "teacher" ? EXERCISE_STATUS.READY : EXERCISE_STATUS.ARCHIVED;
  const decision = lastStaffDecision(row);
  return {
    statusCode: status,
    statusLabel: row.status.label,
    owner,
    authorLabel: exerciseAuthorLabel(row),
    submittedLabel: row.submittedAt ? `Propuesto el ${formatSpanishDate(row.submittedAt)}` : null,
    reviewedLabel:
      row.reviewedAt && decision
        ? `${DECISION_WORDS[decision]} el ${formatSpanishDate(row.reviewedAt)}${row.reviewedBy ? ` por ${row.reviewedBy.displayName}` : ""}`
        : null,
    reviewNote: row.reviewNote,
    canApprove: status === EXERCISE_STATUS.IN_REVIEW && may(EXERCISE_STATUS.PUBLISHED),
    canReturn: status === EXERCISE_STATUS.IN_REVIEW && may(EXERCISE_STATUS.READY),
    canRemove: status === EXERCISE_STATUS.PUBLISHED && may(removal),
    canRestore: owner === "academy" && status === EXERCISE_STATUS.ARCHIVED && may(EXERCISE_STATUS.DRAFT),
  };
}

/**
 * What the staff may do in the editor, by owner and status: the academy's
 * exercises are theirs to write; a teacher's in the library is edited by the
 * staff too (D48: its teacher duplicates it to change it); a teacher's
 * proposal, or one returned, is read-only — decided from the review bar, its
 * content the author's (D07). Never «Duplicar»: a copy is the teacher's way.
 */
export function staffExercisePermissions(
  owner: ExerciseOwnerKind,
  status: ExerciseStatusCode | null,
): ExerciseAuthoringPermissions {
  const editable = owner === "academy" || status === EXERCISE_STATUS.PUBLISHED;
  return { contentLocked: editable ? null : "staffReview", canDuplicate: false };
}

const SAVING = "Guardando…";

/**
 * The save bar of the staff editor: an academy exercise new or draft is kept
 * as a draft or published (the accent: the staff is the reviewer, no review);
 * one in the library — the academy's or a teacher's (D48) — is only saved,
 * and stays complete; an archived academy exercise is saved as it is. A
 * teacher's proposal or returned exercise has none. What enters or stays in
 * the library needs its explanation (`needsExplanation`), as a proposal does.
 */
export function staffSaveButtons(owner: ExerciseOwnerKind, status: ExerciseStatusCode | null): ExerciseSaveButton[] {
  const library = { needsReadiness: true, needsExplanation: true };
  if (owner === "academy" && (status === null || status === EXERCISE_STATUS.DRAFT)) {
    return [
      { intent: "draft", label: "Guardar borrador", pendingLabel: SAVING, accent: false, needsReadiness: false },
      { intent: "publish", label: "Guardar y publicar", pendingLabel: SAVING, accent: true, ...library },
    ];
  }
  if (status === EXERCISE_STATUS.PUBLISHED) {
    return [{ intent: "save", label: "Guardar", pendingLabel: SAVING, accent: true, ...library }];
  }
  if (owner === "academy" && status === EXERCISE_STATUS.ARCHIVED) {
    return [{ intent: "save", label: "Guardar", pendingLabel: SAVING, accent: true, needsReadiness: false }];
  }
  return [];
}

/**
 * What «Publicada» writes (PLAN.md §8, D32): on, `publishedAt` — kept when
 * the series is already published, so a repeated press never moves the date
 * the students see it under —; off, cleared. An empty series is refused:
 * there would be nothing to see, and the switch is disabled for it on the
 * page, but the action is reachable by itself.
 */
export function academySeriesPublication(
  series: { publishedAt: Date | null; itemCount: number },
  published: boolean,
  now: Date,
): { ok: true; data: { publishedAt: Date | null } } | { ok: false; code: "seriesNotPublishable" } {
  if (!published) return { ok: true, data: { publishedAt: null } };
  if (series.itemCount === 0) return { ok: false, code: "seriesNotPublishable" };
  return { ok: true, data: { publishedAt: series.publishedAt ?? now } };
}

/** An academy series on the bank's «Series» view. */
export function mapStaffSeriesCard(row: {
  id: string;
  title: string;
  description: string | null;
  publishedAt: Date | null;
  items: { exercise: { teacherId: string | null; status: { code: string } } }[];
}): StaffSeriesCard {
  return {
    id: row.id,
    href: staffRoutes.exerciseSeries(row.id),
    title: row.title,
    description: row.description,
    itemCount: row.items.length,
    isPublished: row.publishedAt !== null,
    unavailableCount: row.items.filter(
      ({ exercise }) =>
        seriesItemAvailability(
          { teacherId: exercise.teacherId, statusCode: exercise.status.code as ExerciseStatusCode },
          null,
        ) !== "available",
    ).length,
  };
}

/**
 * An item of an academy series: a library exercise, its page the staff's;
 * one taken out of the library since says so (`seriesItemAvailability` with
 * no owner: only the library's are available).
 */
export function mapStaffSeriesItem(row: SeriesItemRow, levels: readonly DifficultyLevel[]): SeriesItemData {
  return {
    exerciseId: row.exercise.id,
    title: row.exercise.title,
    href: staffRoutes.exerciseDetail(row.exercise.id),
    facts: exerciseFacts(row.exercise, levels),
    availability: seriesItemAvailability(
      { teacherId: row.exercise.teacherId, statusCode: row.exercise.status.code as ExerciseStatusCode },
      null,
    ),
  };
}

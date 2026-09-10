import { DATABASE_KIND, type DatabaseKindCode } from "@/constants/platform/study-codes.const";

// What can be done with a study according to its KIND and who is asking.
//
// Pure module — no DAL, no `server-only` — for the same reason as
// services/shared/game-visibility-rules: it is the border that decides whether a
// collection is read-only, and checking it should not require setting up a
// request with a session. It is consulted by the server actions (which also
// check ownership against the database again) and by the interface, so as not to
// offer buttons the action is going to reject.
//
// Ownership is NOT decided here: it arrives resolved in `isOwner`.

export interface StudyPermissions {
  /** Renaming the study and changing its description. */
  canEdit: boolean;
  /** Deleting the whole study. */
  canDelete: boolean;
  /** Creating, importing, editing and deleting its games, and annotating their PGNs. */
  canEditGames: boolean;
  /** Changing the kind for another. */
  canChangeKind: boolean;
}

const READ_ONLY: StudyPermissions = {
  canEdit: false,
  canDelete: false,
  canEditGames: false,
  canChangeKind: false,
};

/**
 * Kinds a student creates from "Mis estudios".
 *
 * Left out are the two that are not created by hand: `MY_GAMES` is born with the
 * account and `COLLECTION` reaches them ready-made. This same pair is what an
 * existing study can be CHANGED to, which is why there is a single list.
 */
export const STUDENT_KINDS: readonly DatabaseKindCode[] = [DATABASE_KIND.STUDY, DATABASE_KIND.TOURNAMENT];

/**
 * Kinds a teacher can create: the student's plus the collection, which is the
 * one they share with their students.
 */
export const TEACHER_KINDS: readonly DatabaseKindCode[] = [...STUDENT_KINDS, DATABASE_KIND.COLLECTION];

export function creatableKinds(isTeacher: boolean): readonly DatabaseKindCode[] {
  return isTeacher ? TEACHER_KINDS : STUDENT_KINDS;
}

export function canCreateKind(kindCode: string, isTeacher: boolean): boolean {
  return (creatableKinds(isTeacher) as readonly string[]).includes(kindCode);
}

export interface StudyRuleInput {
  kindCode: string;
  /**
   * Whether whoever is asking owns the database. It is the only thing that
   * separates a student who RECEIVES a collection from the teacher who MADE it:
   * both see the same row and only one writes it.
   */
  isOwner: boolean;
}

/**
 * The spec's table, in a function.
 *
 * Whoever is not the owner can do nothing: that is where course databases, the
 * collections shared by a teacher and the teacher's look at their student's
 * study fall. That the collection is read-only is NOT a separate rule, it is
 * this same one: the student receives it shared, it is never theirs.
 */
export function studyPermissionsOf({ kindCode, isOwner }: StudyRuleInput): StudyPermissions {
  if (!isOwner) return READ_ONLY;

  // "Mis partidas" is the student's only outstanding account with themselves:
  // they do what they like with the games inside, but the database is neither
  // deleted nor stops being "Mis partidas" — it is unique per student and
  // something has to occupy that place.
  if (kindCode === DATABASE_KIND.MY_GAMES) {
    return { canEdit: true, canDelete: false, canEditGames: true, canChangeKind: false };
  }

  // A collection is owned only by whoever shares it. Changing its kind would
  // leave their students looking at something that is no longer a collection, so
  // it stays put; deleting it they can, it is theirs.
  if (kindCode === DATABASE_KIND.COLLECTION) {
    return { canEdit: true, canDelete: true, canEditGames: true, canChangeKind: false };
  }

  // Tournament and Study: the student's from beginning to end, and one can be
  // turned into the other — what began as loose material ends up a tournament.
  return { canEdit: true, canDelete: true, canEditGames: true, canChangeKind: true };
}

/**
 * Whether a study can move to `nextKind`. Both the STARTING kind and the
 * DESTINATION one are checked: a tournament can become a study, but neither of
 * the two can become a collection — that is shared by a teacher — nor
 * "Mis partidas".
 */
export function canChangeKindTo(current: StudyRuleInput, nextKind: string): boolean {
  return studyPermissionsOf(current).canChangeKind && (STUDENT_KINDS as readonly string[]).includes(nextKind);
}

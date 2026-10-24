import { dayKeyIn } from "@/lib/timezone";
import type { ClassCardData, ClassExercisesToDo } from "@/services/classes/classes.types";
import type { ContinueStudyingCard } from "@/services/dashboard/dashboard.types";

/** What the home page reads to decide what comes first. */
export interface HomePlanInput {
  /** The first class ahead that is not cancelled (`getNextClass`). */
  nextClass: ClassCardData | null;
  /** The course in progress and where the student left it. */
  continueStudying?: ContinueStudyingCard;
  /** A class's exercises still undone (`getClassExercisesToDo`). */
  classExercises: ClassExercisesToDo | null;
}

/** «Lo siguiente»: the one thing the page puts first. */
export type HomeFocus =
  | { kind: "class"; card: ClassCardData; isToday: boolean }
  | { kind: "course"; course: ContinueStudyingCard }
  | { kind: "start" };

/** A tile of «Después»: what else there is, under the focus. */
export type HomeLater =
  | { kind: "course"; course: ContinueStudyingCard }
  | { kind: "class"; card: ClassCardData }
  | { kind: "exercises"; exercises: ClassExercisesToDo };

export interface HomePlan {
  focus: HomeFocus;
  later: HomeLater[];
}

/** The class falls on the day it is read, in its own time zone. */
export function isClassToday(card: ClassCardData): boolean {
  return dayKeyIn(new Date(card.startIso), card.timeZone) === dayKeyIn(new Date(card.nowIso), card.timeZone);
}

/**
 * One focus, the rest after it (the owner's «Inicio: un solo foco»): on the
 * day of a class, the class — entering it is what there is to do —; any other
 * day the course in progress; without one, the next class on whatever day it
 * is; and with nothing at all, choosing what to study. Whatever is not the
 * focus goes to «Después», with the exercises of a class still to do.
 */
export function homePlanOf({ nextClass, continueStudying, classExercises }: HomePlanInput): HomePlan {
  const classToday = nextClass !== null && isClassToday(nextClass);
  const focus: HomeFocus =
    nextClass && classToday
      ? { kind: "class", card: nextClass, isToday: true }
      : continueStudying
        ? { kind: "course", course: continueStudying }
        : nextClass
          ? { kind: "class", card: nextClass, isToday: false }
          : { kind: "start" };

  const later: HomeLater[] = [];
  if (continueStudying && focus.kind !== "course") later.push({ kind: "course", course: continueStudying });
  if (nextClass && focus.kind !== "class") later.push({ kind: "class", card: nextClass });
  if (classExercises) later.push({ kind: "exercises", exercises: classExercises });
  return { focus, later };
}

// Rule of the student↔teacher assignment, isolated from data access so it can
// be tested: reassigning CLOSES the active row and creates another, it never
// deletes. The history is the record of who took whom and when.
//
// This is NOT the final truth: two simultaneous requests both pass through
// here. What really prevents two active assignments is the partial unique index
// `teacher_student_one_active`, and the action catches its P2002.

export interface ActiveAssignment {
  id: string;
  teacherId: string;
}

export interface AssignmentPlan {
  /** Active rows that have to be closed (`endedAt = now`). */
  closeIds: string[];
  /** Whether the new row has to be created. */
  create: boolean;
  /** The student was already with that same teacher: nothing is touched. */
  alreadyAssigned: boolean;
}

export function planAssignment(active: ActiveAssignment[], teacherId: string): AssignmentPlan {
  // Reassigning to the same teacher would be closing and reopening the same
  // relationship: it would dirty the history without changing anything.
  if (active.some((assignment) => assignment.teacherId === teacherId)) {
    return { closeIds: [], create: false, alreadyAssigned: true };
  }

  return { closeIds: active.map((assignment) => assignment.id), create: true, alreadyAssigned: false };
}

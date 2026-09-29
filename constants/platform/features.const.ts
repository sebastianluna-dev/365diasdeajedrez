// Parts of the platform that are built and switched off. A switch hides a
// feature from the student — its buttons, its links, its page — and leaves
// its code, its tables and its data as they are: switching it back on is
// changing the value here, not writing anything again.

/**
 * The Move Trainer, and with it a course's «Repasar», which is the trainer
 * over the lessons already learned.
 *
 * Off: `/entrenador` answers 404, no page links to it, and what feeds its
 * buttons is not even counted. The staff's side is not switched: exercises
 * are still written, and a lesson is still marked as trainable, so the
 * content is there the day this goes back on.
 *
 * `as boolean`, so the branches that read it are not narrowed to the one
 * value it has today.
 */
export const MOVE_TRAINER_ENABLED = false as boolean;

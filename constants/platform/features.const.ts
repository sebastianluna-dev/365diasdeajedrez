// Parts of the platform that are built and switched off. A switch hides a
// feature from the student — its buttons, its links, its page — and leaves
// its code, its tables and its data as they are: switching it back on is
// changing the value here, not writing anything again.

/**
 * The Move Trainer, and with it a course's «Repasar», which is the trainer
 * over the lessons already learned whose review is due.
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

/**
 * «Jugar»: games against the bots, `/jugar`, the profile at `/perfil` with the
 * games played, and every link to them.
 *
 * Off until the bots are calibrated (`npm run bots:calibrate`) and the owner
 * has checked the screens: the pages answer 404 — also one opened by a game's
 * id — and the actions of `services/play` answer `disabled`.
 */
export const PLAY_ENABLED = false as boolean;

/**
 * «Herramientas»: the analysis board at `/herramientas/tablero-de-analisis`,
 * «Importar partida», and the menu that gathers them with the explorer and the
 * trainer. It persists nothing and needs no calibration nor migration, so it
 * can be switched on before `PLAY_ENABLED`.
 */
export const ANALYSIS_BOARD_ENABLED = false as boolean;

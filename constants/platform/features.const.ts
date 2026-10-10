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
 * «Modo aventura»: the first adventure, «El cuaderno del viajero», a map of
 * twelve rivals at `/jugar/aventura`, the new cover of `/jugar` and the paper
 * frame around its games. It lives inside «Jugar», so it needs `PLAY_ENABLED`
 * too.
 *
 * Off: `/jugar` stays the gallery of bots, `/jugar/aventura*` answers 404 and
 * `startAdventureEncounter` answers `notFound`. It does NOT switch off the
 * rules of the data — the hidden bot group and the refusal of its bots by
 * `startPlayedGame` and `rematchPlayedGame` —, which hold whatever this says.
 */
export const ADVENTURE_ENABLED = false as boolean;

/**
 * «Herramientas»: the analysis board at `/herramientas/tablero-de-analisis` and
 * the menu that gathers it with the explorer and the trainer. It persists
 * nothing and needs no calibration nor migration, so it can be switched on
 * before `PLAY_ENABLED`.
 */
export const ANALYSIS_BOARD_ENABLED = false as boolean;

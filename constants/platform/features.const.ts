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

/**
 * «Ejercicios»: the exercise bank, its editor and the series a teacher gives
 * to their students (planning/ejercicios, D40). It hides `/ejercicios*`,
 * `/profesor/ejercicios*` and `/administracion/ejercicios*`, the menu items,
 * «Crear ejercicio desde aquí», a lesson's exercises card and practice pages,
 * «Agregar desde la biblioteca», the class block «Ejercicio» and its routes:
 * the pages answer 404 and the actions answer `disabled`.
 *
 * It does NOT hide the staff lesson panel «Ejercicios» nor its routes (from
 * phase 2): they replace a panel that is live today, over data that phase's
 * migration moves, so they show whatever this says.
 */
export const EXERCISES_ENABLED = false as boolean;

/**
 * The persistence of the exercises' phases 5–7 — the PGN import's write, the
 * student's «Historial» over their stored attempts, and the contrarreloj's
 * runs and best score. Off (2026-10-17, on the owner's ask): those screens
 * run on the client over sample data, so the front can be tried before the
 * database holds anything of theirs — the import reviews the file in the
 * browser and only says what it would write, the history lists sample
 * attempts, and the contrarreloj keeps its best score in the browser. It
 * lives inside «Ejercicios», so it needs `EXERCISES_ENABLED` too.
 */
export const EXERCISES_PERSISTENCE_ENABLED = false as boolean;

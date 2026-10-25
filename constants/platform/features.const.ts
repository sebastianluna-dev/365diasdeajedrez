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
export const MOVE_TRAINER_ENABLED = true as boolean;

/**
 * «Jugar»: games against the bots, the profile at `/perfil` with the games
 * played, and every link to them.
 *
 * Off until the bots are calibrated (`npm run bots:calibrate`) and the owner
 * has checked the screens: the pages answer 404 — also one opened by a game's
 * id — and the actions of `services/play` answer `disabled`.
 */
export const PLAY_ENABLED = true as boolean;

/**
 * «Modo aventura»: the first adventure, «El cuaderno del viajero», a map of
 * twelve rivals at `/jugar/aventura/<slug>`, drawn big on `/jugar`. It lives
 * inside «Jugar», so it needs `PLAY_ENABLED` too.
 *
 * Since 2026-10-25 every game against a bot is an encounter of an adventure
 * (there is no free game), so with this off there is nothing to play: see
 * `PLAY_PAGE_ENABLED`. Off, `/jugar*` answers 404 — but a game already
 * played still opens at `/jugar/partidas/<id>` from the profile, which only
 * `PLAY_ENABLED` gates — and `startAdventureEncounter` answers `notFound`.
 * It does NOT switch off the rules of the data — the hidden bot group —,
 * which hold whatever this says.
 */
export const ADVENTURE_ENABLED = true as boolean;

/**
 * «Jugar» as a place to play: the page `/jugar`, its tile in the tools menu
 * and the links that lead there to play («Jugar» on the profile). Both
 * switches, because the adventure is the only way to start a game.
 */
export const PLAY_PAGE_ENABLED = PLAY_ENABLED && ADVENTURE_ENABLED;

/**
 * «Herramientas»: the analysis board at `/herramientas/tablero-de-analisis` and
 * the menu that gathers it with the explorer and the trainer. It persists
 * nothing and needs no calibration nor migration, so it can be switched on
 * before `PLAY_ENABLED`.
 */
export const ANALYSIS_BOARD_ENABLED = true as boolean;

/**
 * «Ejercicios»: the exercise bank, its editor and the series a teacher gives
 * to their students (planning/ejercicios, D40). It hides `/ejercicios*`, `/puzzle-rush`,
 * `/profesor/ejercicios*` and `/administracion/ejercicios*`, the menu items,
 * «Crear ejercicio desde aquí», a lesson's exercises card and practice pages,
 * «Agregar desde la biblioteca», the class block «Ejercicio» and its routes:
 * the pages answer 404 and the actions answer `disabled`.
 *
 * It does NOT hide the staff lesson panel «Ejercicios» nor its routes (from
 * phase 2): they replace a panel that is live today, over data that phase's
 * migration moves, so they show whatever this says.
 */
export const EXERCISES_ENABLED = true as boolean;

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

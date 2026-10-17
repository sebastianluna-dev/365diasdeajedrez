# Exercises — handoff state (2026-10-17, evening)

Where the work stands, for the next session (cloud). Read `DECISIONES.md` (D01–D51, binding) and `PLAN.md`
(the reviewed build plan; §9 has the phases) first. The product documentation of what is built is in
`docs/content/platform/exercises.mdx`, with a «Verification in the app» paragraph per phase.

## Branch

`dev` (pushed to origin on 2026-10-17; the same history as the local `feat/ejercicios`, built on top of
`feat/clases`, which is NOT in `main` yet). Release order: classes first (TODOS T49), then exercises.
`constants/platform/features.const.ts` is committed with every flag OFF; the owner keeps local flips
(`EXERCISES_ENABLED`, `PLAY_ENABLED`, `ADVENTURE_ENABLED`, `ANALYSIS_BOARD_ENABLED` = true) uncommitted.
To try exercises, set `EXERCISES_ENABLED = true` locally and never commit it.

## Done (built, reviewed, fixed, checked in the app with the demo accounts)

- Phase 1 — bank, solver, writers, piece editor, editor, series, «Ejercicios» for the student.
- Phase 1b — «Crear ejercicio desde aquí», the teacher's attempts tab and series progress (D45).
- Phase 2 — courses: lesson exercises in `Exercise`, the staff lesson panel (not behind the flag), the
  student's lesson card and practice-only lessons.
- Phase 3 — classes: the EXERCISE block, the student solves from the class, «2 de 3 lo resolvieron».
- Phase 4 — library and review (propose/return/approve/remove, D48 lock), the academy's bank and series,
  «Agregar desde la biblioteca», «Práctica libre», «Ejercicios» for every student; D49 (a class solve is
  stored for the block even after a scored attempt that day).

## Done in the evening session (2026-10-17, cloud)

The owner's asks during the session, which change the plan from here on: **no stories and no docs for what is
new** (postponed; the pieces that moved to `components/platform/shared/` are listed in `WITHOUT_STORY` of
`components/stories.test.ts`); **the library fixture holds 20 exercises, not 60** (he fills the database with
his own); **he runs the app checks himself**; and **phases 5–7 run on the client over sample data**, behind
`EXERCISES_PERSISTENCE_ENABLED = false` (`constants/platform/features.const.ts`): off, the import reviews the
file in the browser and only says what it would write, «Historial» lists sample attempts, and the contrarreloj
deals the sample deck and keeps its best score in the browser. Nothing of theirs touches the database yet; the
six CI steps are run once per phase, not per commit.

- **A.** The six steps on `5e34761`: one test read the owner's local flag (`classes.mapper.test.ts` now mocks
  it, with the «off» case). `test:storybook` needed Playwright's Chromium: the cloud image has revision 1194
  and Playwright 1.63 asks for 1243, so the run points the 1243 folders at the 1194 binaries (outside the repo).
- **B.** Findings 7–13 closed: the four series pieces moved to `components/platform/shared/` (imports, the
  two stories' titles, the overview's tile ids and the docs pages followed; 9 had been closed by `cf167e2`);
  `requireStaff()` on the three staff pages; the accent wraps under 640px; the placement board's frame clips
  the file coordinates; the docs say «n de m» counts the attempts made in that series; the phase-4
  verification paragraph is in `exercises.mdx`.
- **Phase 5 (D12).** `services/shared/exercise-import.ts` (pure reader + report rules, tested),
  `exercise-import-form.ts` (the form's zod schema, tested), `exercise-import.service.ts` (the write: every
  row through `createExerciseRecord`, the status move per role, the series at its end), the two actions
  (`importTeacherExercises`, `importStaffExercises`: two steps through `useActionState`, `exercise-import`
  10 per 10 min), `ExerciseImportForm` (shared, no story), the pages `/profesor/ejercicios/importar` and
  `/administracion/ejercicios/importar` with «Importar PGN» in both bank heads, the notice
  `exercisesImported.<ready>.<drafts>`, and `prisma/fixtures/exercise-library.pgn` (20, pinned by its test).
  With the flag off the form gets no action and reviews in the browser.
- **Phase 6 (D51).** `/ejercicios/historial`: `ExerciseHistory` (client filters: result, source, period;
  «Ver más» by 25) over `ExerciseAttemptRow`, fed by `sampleExerciseHistory` while nothing persists; the
  service over `TrainingAttempt` comes with the flag. **The ladder's removal (`applyExerciseReview`,
  `isExerciseDue`, the `UserExerciseState` columns, the migration) is postponed**: it is database work.
- **Phase 7 (D21, D34).** `/ejercicios/contrarreloj`: `buildStormDeck` (pure, tested; 800 + 35·i, closest
  unused), `StormRunner` (3:00 countdown, score, three mistake slots, the board over `useExerciseSolver` in
  `preview`, the end screen with the failed ones and «Jugar otra vez»), the deck dealt from
  `SAMPLE_EXERCISES` (`constants/platform/exercise-samples.const.ts`, the fixture as data). **`StormRun`, its
  migration and `finishStormRun` are postponed**: database work.
- The home «Ejercicios» gained the cards «Contrarreloj» and «Historial».

## Still to do when the owner says so

- Switch `EXERCISES_PERSISTENCE_ENABLED` on: wire the history's service (the student's scored attempts through
  `teacherVisibleAttemptsWhere`'s student twin), the storm's table and service (PLAN §5.6, §9 phase 7), and
  check the import's write against the local database.
- D51's ladder removal (migration `…_drop_review_ladder`), to be applied with his go.
- The stories, the Overview tiles and the docs pages of `ExerciseImportForm`, `SeriesItems`, `DeleteSeries`,
  `ExerciseHistory` and `StormRunner`; the «Import» section of `exercises.mdx` with the header conventions
  (they are in the form's hint and in `EXERCISE_PGN_HEADERS`); the exceptions lists of `conventions.mdx` and
  `teacher-and-staff.mdx` (the import's `useActionState`); README's routes.
- Low, to IMPROVEMENTS: staff library filters by topic/level/author.

## Database

Local only, all applied with the owner's go: `20261016120000_exercises`, `20261016130000_lesson_exercises`
(moved the 4 seeded hand-made lesson exercises into `Exercise`, keeping ids), `20261016140000_lesson_exercises_published_at`,
`20261016150000_class_exercise_blocks`. Production gets them with the release (backups first,
`npm run db:deploy` there, with the owner's go). The seed was rewritten for exercises but NEVER run
(`npm run db:seed` needs the owner's go; the local database holds the app checks' data instead, and
valentina.demo's teacher assignment was ended by a check).

## Rules learned this round (also in AGENTS.md «Ejercicios»)

Every `Exercise` insert through `createExerciseRecord`; status moves only through the transition writers;
one `where` builder for visibility; first wrong move decides; one scored attempt per exercise per study day,
with the class-block exception (D49); the staff's exercise services in `services/staff-exercises/`, which the
teacher and student sides never reach. Never two `test:storybook` runs at once on this machine (timeouts).

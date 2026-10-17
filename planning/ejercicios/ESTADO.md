# Exercises — handoff state (2026-10-17)

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

## In progress — the phase-4 review's fixes

Commit `cf167e2f` fixed findings 1, 2 and 10 (lesson copy = its original in writer/action/series page;
the attempt's instant taken under the lock). Commit «findings 3–6, in progress» holds 3–6 (explanation
required to stay in the library; academy series notices/hint and the empty-series refusal, first
`publishedAt` kept; the review bar's word from the stamp's own move; the bank guard in `decide()`) with
typecheck, lint and unit tests green but WITHOUT Storybook and the docs build run: **run the six CI steps
first** (`npm run format:check && npm run lint && npm run typecheck && npm test && npm run storybook:build &&
npm run test:storybook`, then `cd docs && npm run build`) and fix what they say.

Still open from that review (the brief is in the session's fix prompt; summarised):
7. Move the series pieces reused by staff (`AddSeriesExercisesButton`, `DeleteSeries`, `EditSeriesButton`,
   `SeriesItems`, `NewSeriesButton`) from `components/platform/sections/teacher/exercises/` to
   `components/platform/shared/` with stories, Overview tiles and docs pages (Story row, line counts).
8. `await requireStaff()` at the top of `app/(platform)/administracion/ejercicios/{[exerciseId],nuevo,series/[seriesId]}/page.tsx`
   and the series page's `generateMetadata`.
9. `services/exercises/practice.service.ts`: pick by ids (+ `copiedFromId`, `lessonId`), then fetch the one
   chosen; keep `pickPracticeExercise` pure.
11. Student home at 390px: the accent «Continuar con «<título largo>»» overflows (nowrap); let it wrap under
    640px in `exercises-home.section.css`.
12. 2px overflow at 390px on `/profesor/ejercicios/nuevo` and `/administracion/ejercicios/nuevo` from the
    piece-placement board's file coordinates.
13. Docs: the series' «n de m» counts attempts made in that series (PLAN interpretation 4); say so on the
    student series docs; optional «Resuelto hoy en otro lado» mark only if cheap.
Also: replace «Checks to run in the app» of the phase-4 section in `docs/content/platform/exercises.mdx`
with the verification paragraph (the 2026-10-17 run passed every check; what it left in the local seed is
listed in the session: C `FK38f9eb` PUBLISHED, D with an explanation, the draft copy `42zmFDyW`, G
`EWvpMBuD`, the academy exercise `D7YG5KBe`, the academy series `QvuSEm1J`, «Prueba» items 5–6, the lesson
copy `2K_jEcxd`, the Taller's BEFORE block [F, A, G], alumno.demo's PRACTICE/SERIES/CLASS attempts).
Low, to IMPROVEMENTS: staff library filters by topic/level/author.

## Next phases (PLAN §9)

- Phase 5 — PGN bulk import (D12), plus a committed library fixture of ≥60 exercises.
- Phase 6 — **the student's «Historial» with filters (D51)**; the spaced-review ladder is OUT: remove
  `applyExerciseReview`/`isExerciseDue`, the ladder columns of `UserExerciseState` (new migration) and
  every mention in docs.
- Phase 7 — contrarreloj (D21, D34): 3 min, ends at the third mistake, best score; after phase 5's fixture.

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

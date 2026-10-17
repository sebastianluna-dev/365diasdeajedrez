# Exercises — the owner's decisions (2026-10-16)

The owner's request: «necesito que implementemos una forma de que se puedan hacer ejercicios en la
plataforma, y también pensar de qué forma va a registrar un profesor un problema, también se podrán
agregar ejercicios en los cursos, y se registrarán de la misma forma».

Asked in ten rounds after mapping the existing system (TrainingExercise hangs from a Lesson, only staff
authors, the student trainer is off since 2026-10-03, no teacher authoring, no standalone exercise).
The map is in the workflow run wf_c04374df-e97 of session 10cc1ea9.

## What an exercise is
- D01 **Always a sequence with replies**: the student plays their moves, the platform answers the
  opponent's, until the end of the solution (today's REPRODUCE_LINE). A one-move exercise is a sequence
  of one.
- D02 **Alternatives as variants of the solution's PGN**: the author adds variants on the same board;
  any of them is accepted. NOT «any mate counts».
- D03 Types in v1: the sequence AND **«Mate en N»** (presented as «Mate en 2/3», checked by chess
  rules, no engine). No engine-best-move, no multiple choice.
- D04 **Course exercises stay attached to their lesson (separate from the platform bank) but are
  authored with the same editor and the same format.**
- D05 (owner's own words) «una cosa es una partida en una lección y otra un ejercicio en una
  lección; algunas lecciones que ya existen tienen asociadas partidas pero quiero que se les pueda
  agregar un problema». → A lesson = its game + optional exercises. Existing hand-made lesson
  exercises become exercises in the new format; the line training derived from the lesson's game
  («Se puede entrenar de memoria») stays separate (D32).

## Authoring
- D06 **Teachers and staff** author, same editor.
- D07 A teacher's exercise **is the teacher's**; their assigned students and their classes see it; the
  teacher can **propose it to the general library**, and staff approves it.
- D08 A teacher sees **their own + the approved library**, not other teachers' exercises.
- D09 **Piece-placement board editor from v1** (palette, side to move, castling), besides FEN/PGN paste
  and picking a position from a game.
- D10 The solution is **played on the board** (moves, replies, variants, comments); never typed.
- D11 Shortcut in v1: **«Crear ejercicio desde aquí» on any move of a game in the teacher's studies**
  (position = that move, solution = what follows).
- D12 **Bulk PGN import from the start** (one exercise per game: [FEN] + moves + comments).

## Metadata
- D13 **Complete**: title, prompt («Juegan blancas y ganan»), difficulty, topic(s), level, source
  (game, players, year), hints, explanation shown after solving.
- D14 Difficulty set by the author now; an automatic rating later.
- D38 The author's difficulty is **an Elo-like number** (800, 1200, 1600…), not 3 or 5 steps.
- D15 Topics = **the courses' existing Topic catalog** (add tactical motifs that are missing).
- D16 States: **draft → in review → published**. The teacher's students see a «ready» exercise of
  their teacher without review; the general library only after staff approves.

## Student
- D17 A new section **«Ejercicios»** in the main menu (library, series, what the teacher gave).
  Naming: **«Ejercicios»** everywhere (D35).
- D18 **Series** (ordered, built by an author) **and free practice** (topic + difficulty, random).
- D19 **First wrong move = failed** (Lichess-like); the student may finish it to learn.
- D20 **Hint and «Ver la solución»**. «Ver la solución» plays the answer with the explanation and
  counts as failed. Hint: **the author's text if there is one, otherwise the piece to move is
  highlighted** (D37).
- D33 **Hint then solved without a mistake = passed, not «perfect»**; it returns to review sooner than
  a clean one.
- D21 Time: **clock visible and a «contrarreloj» mode**. D34: **3 minutes, ends at the third mistake,
  increasingly hard exercises from the library, best score kept** (Puzzle Storm/Rush-like).
- D22 **Counts for the streak and «Ejercicios superados», each exercise once** (distinct exercises,
  not repetitions).
- D23 **Spaced review per exercise** (failed ones come back at 1/3/7/21/60 days, «Para repasar hoy»),
  reusing lib/training/review-schedule.ts.
- D24 The teacher sees **every attempt and its mistake** (which wrong move), per student and series.
- D39 Solving is designed for the phone; the editor works on a phone but is designed for a big screen.

## Courses
- D25 **Both**: exercises at the end of a lesson with a game («Ahora practica: 3 ejercicios») and
  **practice-only lessons** (no game, only exercises).
- D26 **Optional** for completing a lesson («2 de 3 resueltos»).
- D27 No chapter exam for now (CHAPTER_QUIZ/quizPassedAt stay unused).
- D28 A library exercise can be added to a lesson **as a copy** owned by the course.

## Classes and sharing
- D29 **Class block «Ejercicio»** (one or more exercises, «Para preparar» or «Después de la clase»);
  the student solves it there; the teacher sees «2 de 3 lo resolvieron».
- D30 **No dated homework**; the «Después de la clase» block is the task.
- D31 A teacher can **give a series to their assigned students** outside a class (like sharing a
  collection today).
- D32 Free practice shows **only the approved library**.
- D36 The current line trainer (/entrenador, «entrenar de memoria») **stays off and separate**.

## Order
- D40 **First delivery: the teacher creates, the student solves**: the exercise bank, the editor (piece
  editor, solution on the board, metadata), the teacher's series given to their students, and the
  «Ejercicios» section to solve. Then: courses, classes, library + review, import, spaced review,
  contrarreloj.

## Process constraints
- New tables need a hand-written migration applied with `npm run db:deploy` against the LOCAL
  database, which needs the owner's go (never `db:migrate`, which asks for a reset here).
- Everything behind a feature flag until the owner checks it.

## Before building (2026-10-16)
- D41 Lesson exercises live in the same `Exercise` table with the lesson as owner (never in the bank,
  a series or the library), as PLAN.md §2.1 proposes. Approved.
- D42 Branch `feat/ejercicios` from `feat/clases`; released after classes.
- D43 The phase 1 migration may be applied to the LOCAL database with `npm run db:deploy` after
  `npm run db:target` confirms localhost. Production only with the release and his go.
- D44 Go for Phase 1.
- D45 (2026-10-16) When a teacher deletes a series, the attempts made in it stay visible in the student's
  exercises tab for the teacher, noted «de una serie eliminada»; no table changes (the attempts' seriesId
  goes null as today, and `teacherVisibleAttemptsWhere` counts a null-series attempt at an own exercise).
- D46 (2026-10-16) Go for Phase 2 (courses), with its data-moving migration applied to the LOCAL
  database only (`npm run db:target` first); production only in a release made after he checks the
  phase locally.
- D47 (2026-10-16) `20261016140000_lesson_exercises_published_at` applied locally with his go. Go for
  Phase 3 (classes), its migration applied locally after `npm run db:target` confirms localhost.
- D48 (2026-10-16) An approved (library) exercise is locked for its teacher: staff edits it; the teacher
  duplicates to change it (PLAN §10 option B's default).
- D49 (2026-10-16) A class block's mark counts even when the student already made a scored attempt at the
  same exercise/family that study day elsewhere: the class attempt is STORED (classBlockId, context CLASS)
  but unscored — no streak, no «Ejercicios superados», no UserExerciseState/review change; only the
  teacher's count and the block's mark read it. Replaces PLAN interpretation 8 for classes.
- D50 (2026-10-16) Go for Phase 4 (library and review) right after the Phase 3 fixes land. No migration.
- D51 (2026-10-16) **Spaced review is OUT** (replaces D23): no 1/3/7/21/60-day ladder, no «Para repasar
  hoy». Instead, **the student has a history of their exercises** («Historial» in «Ejercicios»): every
  scored attempt, solved and failed (and with hint / solution shown), with filters (result, and where it
  came from: series, course, class, practice; by date). Phase 6 becomes that history; the ladder's
  computation and columns are removed with it.

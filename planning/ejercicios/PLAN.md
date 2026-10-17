# Exercises — build plan

Written 2026-10-16 from the owner's 40 decisions (`planning/ejercicios/DECISIONES.md`, cited as D01–D40) and
a read of the code on `feat/clases` at `26305fe7`. Everything here is binding unless a phase says otherwise.
UI copy is quoted in Spanish, as the product says it. AGENTS.md rules apply everywhere and are not repeated
unless a step needs one.

Contents: 1 Goal · 2 Data model · 3 Solving engine · 4 Authoring · 5 Student · 6 Teacher views and sharing ·
7 Courses and classes · 8 Library review · 9 Phases · 10 Risks, open points, IMPROVEMENTS.

---

## 1. Goal and the decisions it implements

A teacher (and the staff) records a chess exercise once, in one format: a starting position and a solution
**played on the board**, with variants and comments. The student solves it on any screen: they play their
moves, the platform answers the opponent's, until the line ends. The same exercise can sit in a series a
teacher gives their students, in a lesson, in a class block or in the academy's library, and every attempt is
kept with its first wrong move.

| Area | Decisions | Where in this plan |
| --- | --- | --- |
| What an exercise is | D01, D02, D03 | §2.2, §3 |
| Lesson exercises are the same format, still attached to the lesson | D04, D05, D25–D28 | §2.5, §7.1, phase 2 |
| Who authors and who sees | D06, D07, D08, D16, D32 | §2.2, §6.3, §8 |
| The editor | D09, D10, D11, D12, D39 | §4 (D11 in phase 1b) |
| Metadata | D13, D14, D15, D38 | §2.2, §4.4 |
| The student's section | D17, D18, D35 | §5 |
| Solving rules | D19, D20, D33, D37 | §3 |
| Time and «Contrarreloj» | D21, D34 | §5.6, phase 7 |
| Streak and «Ejercicios superados» | D22 | §2.7, §5.5 |
| Spaced review | D23 | §2.7, §5.4, phase 6 |
| Teacher sees attempts and mistakes | D24 | §6.1, phase 1b |
| Classes and sharing | D29, D30, D31 | §6.2, §7.2, phase 3 |
| The line trainer stays separate | D36 | §2.6 |
| Delivery order | D40 | §9 |

What does **not** change: `/entrenador` and `MOVE_TRAINER_ENABLED` stay off (D36); `Lesson.isTrainable` and
the exercise `syncLessonTrainingExercise` derives stay as they are, in `TrainingExercise`; `CHAPTER_QUIZ` and
`ChapterProgress.quizPassedAt` stay unused (D27); there is no dated homework (D30) and no engine anywhere in
the exercise path (D03).

---

## 2. Data model

### 2.1 The two decisions the model hangs from

**One table, `Exercise`, holds every authored exercise: the teacher's, the academy's library and the
lessons'.** A lesson exercise is an `Exercise` row whose owner is the lesson (`lessonId`, phase 2), not a
row of a sibling table. Why:

- D04 asks for the same editor and the same format. With one table there is one solution writer, one
  solver input, one mapper, one attempt foreign key and one visibility rule with one more `OR` branch. With a
  sibling table every one of those is written twice and the two drift (the precedent: `deriveExerciseData`
  had to be shared by the seed and the editor precisely to stop that).
- «Separate from the platform bank» (D04) is ownership, not storage: a lesson exercise is never listed in a
  bank, never proposed to the library and never shared in a series. Those are `where` clauses
  (`lessonId: null`), checked by one CHECK (`exercise_single_owner`) and by the visibility rule's test.
- D28's «copy owned by the course» is then one more `createExerciseRecord` call with the original's content
  plus `lessonId` and `copiedFromId`, not a translation between two shapes (§2.3: every insert, whatever its
  path, goes through that writer).

**`TrainingExercise` stays, and only for the derived line exercise.** Its shape (a frozen `line` of SANs
over a lesson's main line, `path`, `startPly`, `isDerived`) is the line trainer's (D36) and does not fit an
exercise with variants. Phase 2 moves the hand-made rows (`isDerived = false`) into `Exercise` **keeping their
ids**, so `UserActivity.subjectId` (polymorphic, append-only, never rewritten) and the seeded attempts keep
pointing at the right thing. After phase 2 `TrainingExercise` holds only `isDerived = true` rows; the column
stays (no destructive migration) and the old hand-made editor goes.

**Attempts reuse `TrainingAttempt`, mistakes reuse `TrainingMistake`.** `TrainingAttempt.exerciseId` is
renamed `trainingExerciseId` and made nullable, a new nullable `exerciseId` points at `Exercise`, and a CHECK
says exactly one is set. Why reuse and not a new table:

- `TrainingMistake` already is D24's row (position hash, FEN, expected SAN, played SAN, ply, hint used) and
  today has **no writer at all** (docs → Student → Move Trainer: «no `TrainingMistake` rows»). Giving it its
  one writer now costs nothing.
- `TrainingAttempt` already carries what an exercise attempt needs (`resultId`, `mistakes`, `durationMs`,
  `contextId`, `requiredMoves`, `correctMoves`, `reachedPly`, `hintsUsed`, `isPerfect`); only
  `solutionShown` and the context references are new. One append-only log keeps the dashboard and any later
  statistic on one table.
- The rename is deliberate: after this work «exercise» means `Exercise` everywhere, and a column called
  `exerciseId` pointing at the line drill would invite the wrong join. The dormant trainer is the only code
  that writes the old column (`services/trainer/trainer.actions.ts`, plus the seed).

### 2.2 Phase 1 models (migration `20261016120000_exercises`)

Catalog codes go in a new `constants/platform/exercise-codes.const.ts` (and the training ones stay in
`training-codes.const.ts`); labels in `prisma/seed-data.ts` `CATALOG_VALUES` and in the migration, because
production never runs the seed. «Ejercicio» is masculine, so every status label and every message about one
is too («Listo», «Archivado», «Devuelto»), in the catalog, the migration's INSERT, the buttons and the checks.

| Catalog | Code → label | Order |
| --- | --- | --- |
| `ExerciseKind` (new) | `SEQUENCE` «Secuencia» · `MATE_IN` «Mate en N» | 0, 1 |
| `ExerciseStatus` (new) | `DRAFT` «Borrador» · `READY` «Listo» · `IN_REVIEW` «En revisión» · `PUBLISHED` «En la biblioteca» · `ARCHIVED` «Archivado» | 0–4 |
| `AttemptContext` (rows added) | `SERIES` «Serie» · `PRACTICE` «Práctica libre» · `REVIEW` «Repaso» · `CLASS` «Clase» · `STORM` «Contrarreloj» (existing `LESSON`, `CHAPTER_QUIZ`, `TRAINER` upserted too) | 3–7 |
| `Topic` (rows added, D15) | children of `TACTICS`: `FORK` «Ataque doble», `PIN` «Clavada», `SKEWER` «Enfilada», `DISCOVERED_ATTACK` «Ataque a la descubierta», `DOUBLE_CHECK` «Jaque doble», `DEFLECTION` «Desviación», `DECOY` «Atracción», `REMOVING_THE_DEFENDER` «Eliminación del defensor», `OVERLOADING` «Sobrecarga», `INTERFERENCE` «Interferencia», `X_RAY` «Rayos X», `ZWISCHENZUG` «Jugada intermedia», `CLEARANCE` «Despeje», `TRAPPED_PIECE` «Pieza atrapada», `SACRIFICE` «Sacrificio», `PROMOTION` «Coronación», `MATING_ATTACK` «Ataque al rey», `BACK_RANK_MATE` «Mate del pasillo», `ZUGZWANG` «Zugzwang» | 10–28 |

`Topic` codes go into `TOPIC` (`constants/platform/shared-codes.const.ts`) and `TOPIC_VALUES` gains a parent
column (seed and migration set `parentId` from `TACTICS`). `ZUGZWANG` is tactical enough to sit there; the
endgame topics stay as they are.

The schema (comments abbreviated here; in the file each derived column names its one writer, as AGENTS.md
asks):

```prisma
/// What an exercise asks for (EXERCISE_KIND). SEQUENCE: play the solution, the platform answers (D01).
/// MATE_IN: solved exactly like SEQUENCE (only the author's lines are accepted, D02); what differs is the
/// title «Mate en N» and that every line of the solution must end in checkmate within N moves (D03, §3.3).
model ExerciseKind {
  id    Int    @id @default(autoincrement())
  code  String @unique
  label String
  order Int    @default(0)
  exercises Exercise[]
}

/// Where an exercise is in its life (D16): DRAFT → READY (its teacher's students may get it) →
/// IN_REVIEW → PUBLISHED (the library), and ARCHIVED (kept for history, offered nowhere).
model ExerciseStatus {
  id    Int    @id @default(autoincrement())
  code  String @unique
  label String
  order Int    @default(0)
  exercises Exercise[]
}

model Exercise {
  /// Short, it goes in the URL. Prisma generates it (nanoid(8), like GameDatabase); the rows phase 2 brings
  /// from TrainingExercise keep their uuid.
  id                String    @id @default(nanoid(8))
  /// Owner (D07). Set: the teacher's. Null (and null lessonId, phase 2): the academy's — what the staff
  /// writes and what the library holds. Restrict: a teacher is never deleted (see Teacher).
  teacherId         String?
  /// Who wrote it, for «Creado por» and the audit. Not the owner.
  authorUserId      String?
  /// An input of the solution's validity (MATE_IN lines must mate within mateIn), so it has the solution's
  /// writers: createExerciseRecord / syncExerciseSolution, through exerciseSolutionColumns.
  kindId            Int
  /// Only writer: services/shared/exercise-status.service.ts. An insert starts DRAFT through a spread of
  /// initialExerciseStatusData() (exported by that file, the initialClassStatusData pattern); any other
  /// status is reached with the transition writer in the same transaction.
  statusId          Int
  title             String    @db.VarChar(120)
  /// «Juegan blancas y ganan». Null: the screen says «Juegan blancas»/«Juegan negras» (and «y dan mate en N»).
  prompt            String?   @db.VarChar(200)
  /// The author's Elo-like difficulty (D14, D38). CHECK exercise_difficulty_range (400–3000). The Level is
  /// derived from it on reading (levelOfDifficulty), never stored.
  difficulty        Int
  /// The author's text hints, in order, at most three (CHECK exercise_hints_max). Empty: the hint
  /// highlights the piece to move (D37).
  hints             String[]  @default([])
  /// Shown after solving (D13).
  explanation       String?   @db.Text
  /// N of «Mate en N»; null for SEQUENCE (CHECK exercise_mate_in_range 1–5). The kind↔mateIn rule (MATE_IN
  /// needs it, SEQUENCE has none) is enforced by exerciseSolutionColumns; same writers as kindId.
  mateIn            Int?
  /// THE SOURCE (D02, D10): [SetUp]/[FEN] + the solution with variants and comments, no other header.
  /// Written only by createExerciseRecord / syncExerciseSolution (services/shared/exercise-record.service.ts),
  /// always together with kindId, mateIn and the four frozen columns below.
  solutionPgn       String    @db.Text
  /// Frozen from solutionPgn by exerciseSolutionColumns (same writers): lists draw it without parsing. A draft
  /// has them too (readSolutionStart, §3.1), so they are NOT NULL for every status.
  startFen          String
  /// createPositionHash(startFen): the import's «Ya está en tus ejercicios».
  startPositionHash String
  /// Plies of the main line, and the student's moves in it («3 jugadas»).
  solutionPlies     Int
  playerMoves       Int
  /// Source (D13). CHECK exercise_source_year (1400–2100).
  sourceWhite       String?   @db.VarChar(120)
  sourceBlack       String?   @db.VarChar(120)
  sourceEvent       String?   @db.VarChar(160)
  sourceYear        Int?
  /// The study game it came from («Crear ejercicio desde aquí», D11). SetNull: the exercise is self-sufficient.
  sourceGameId      String?
  /// The exercise it was copied from («Duplicar»; a library exercise copied to a lesson, D28).
  copiedFromId      String?
  /// Review (D16). Only writer: exercise-status.service.ts. publishedAt is the FIRST publication and is kept
  /// when the exercise leaves the library: «was ever in the library» is what lets a teacher keep seeing the
  /// attempts at it (§6.1). Never copied by «Duplicar» or a lesson copy.
  submittedAt       DateTime?
  reviewedAt        DateTime?
  reviewedById      String?
  reviewNote        String?   @db.VarChar(500)
  publishedAt       DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  teacher    Teacher?       @relation(fields: [teacherId], references: [id], onDelete: Restrict)
  authorUser User?          @relation("ExerciseAuthor", fields: [authorUserId], references: [id], onDelete: SetNull)
  reviewedBy User?          @relation("ExerciseReviewer", fields: [reviewedById], references: [id], onDelete: SetNull)
  kind       ExerciseKind   @relation(fields: [kindId], references: [id])
  status     ExerciseStatus @relation(fields: [statusId], references: [id])
  sourceGame Game?          @relation(fields: [sourceGameId], references: [id], onDelete: SetNull)
  copiedFrom Exercise?      @relation("ExerciseCopies", fields: [copiedFromId], references: [id], onDelete: SetNull)
  copies     Exercise[]     @relation("ExerciseCopies")

  topics      ExerciseTopic[]
  seriesItems ExerciseSeriesItem[]
  attempts    TrainingAttempt[]
  states      UserExerciseState[]

  @@index([teacherId, statusId])
  @@index([statusId, difficulty])
  @@index([startPositionHash])
  @@index([sourceGameId])
}

/// Written only with syncCatalogJoin, inside the exercise's write.
model ExerciseTopic {
  exerciseId String
  topicId    Int
  exercise Exercise @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
  topic    Topic    @relation(fields: [topicId], references: [id], onDelete: Cascade)
  @@id([exerciseId, topicId])
  @@index([topicId])
}

/// An ordered set of exercises built by an author (D18). A teacher's (teacherId) reaches students only
/// through ExerciseSeriesShare (D31); the academy's (teacherId null) is the library's, listed once
/// publishedAt is set (CHECK exercise_series_library_published: teacherId IS NULL OR publishedAt IS NULL).
model ExerciseSeries {
  id          String    @id @default(nanoid(8))
  teacherId   String?
  title       String    @db.VarChar(120)
  description String?   @db.VarChar(1000)
  publishedAt DateTime?
  createdById String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  teacher   Teacher? @relation(fields: [teacherId], references: [id], onDelete: Restrict)
  createdBy User?    @relation("ExerciseSeriesCreator", fields: [createdById], references: [id], onDelete: SetNull)
  items     ExerciseSeriesItem[]
  shares    ExerciseSeriesShare[]
  attempts  TrainingAttempt[]

  @@index([teacherId])
}

/// Order through services/shared/reorder.ts (composite unique: a direct swap throws P2002).
model ExerciseSeriesItem {
  seriesId   String
  exerciseId String
  order      Int
  series   ExerciseSeries @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  exercise Exercise       @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
  @@id([seriesId, exerciseId])
  @@unique([seriesId, order])
  @@index([exerciseId])
}

/// A teacher's series given to one student (D31), the twin of StudyShare: one row per (series, student),
/// removing the share deletes the row, the material stays the teacher's.
model ExerciseSeriesShare {
  id        String   @id @default(uuid())
  seriesId  String
  userId    String
  teacherId String?
  createdAt DateTime @default(now())
  series  ExerciseSeries @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  user    User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  teacher Teacher?       @relation(fields: [teacherId], references: [id], onDelete: SetNull)
  @@unique([seriesId, userId])
  @@index([userId])
}

/// The student's standing with one exercise: whether they ever solved it (D22) and when it comes back
/// (D23). Derived from TrainingAttempt; its only writer is recordExerciseAttempt (and
/// rebuildUserExerciseState, which folds the same rule over the history), both in
/// services/shared/exercise-attempt.service.ts.
model UserExerciseState {
  userId         String
  exerciseId     String
  attemptCount   Int       @default(0)
  firstAttemptAt DateTime?
  /// The first PASSED attempt. It is what makes the streak and «Ejercicios superados» count an exercise once.
  firstSolvedAt  DateTime?
  lastAttemptAt  DateTime?
  lastResultId   Int?
  /// Rung of EXERCISE_REVIEW_INTERVALS_DAYS; null = not in review (never failed, or graduated).
  reviewStep     Int?
  nextReviewAt   DateTime?
  lastReviewedAt DateTime?
  updatedAt      DateTime  @updatedAt

  user       User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  exercise   Exercise       @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
  lastResult AttemptResult? @relation(fields: [lastResultId], references: [id])

  @@id([userId, exerciseId])
  @@index([userId, nextReviewAt])
  @@index([userId, firstSolvedAt])
  @@index([exerciseId])
}
```

`TrainingAttempt` after phase 1:

```prisma
model TrainingAttempt {
  id                 String   @id @default(uuid())
  userId             String
  /// The derived line exercise (the dormant trainer). Exactly one of trainingExerciseId / exerciseId is set:
  /// CHECK training_attempt_one_exercise.
  trainingExerciseId String?
  /// An Exercise. Only writer of these rows: recordExerciseAttempt.
  exerciseId         String?
  /// Where it was solved: the series (D24 per series), later the class block and the contrarreloj run.
  seriesId           String?
  resultId           Int
  mistakes           Int      @default(0)
  durationMs         Int?
  contextId          Int
  requiredMoves      Int      @default(0)
  correctMoves       Int      @default(0)
  reachedPly         Int      @default(0)
  hintsUsed          Int      @default(0)
  /// «Ver la solución» was pressed (D20): the attempt is FAILED whatever the moves were.
  solutionShown      Boolean  @default(false)
  isPerfect          Boolean  @default(false)
  createdAt          DateTime @default(now())

  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  trainingExercise TrainingExercise? @relation(fields: [trainingExerciseId], references: [id], onDelete: Cascade)
  /// Restrict: an exercise someone tried is archived, never deleted (its history and D24 depend on it).
  exercise         Exercise?         @relation(fields: [exerciseId], references: [id], onDelete: Restrict)
  series           ExerciseSeries?   @relation(fields: [seriesId], references: [id], onDelete: SetNull)
  result           AttemptResult     @relation(fields: [resultId], references: [id])
  context          AttemptContext    @relation(fields: [contextId], references: [id])
  mistakeDetails   TrainingMistake[]

  @@index([userId, createdAt])
  @@index([trainingExerciseId])
  @@index([exerciseId, userId])
  @@index([seriesId, userId])
}
```

`TrainingMistake` keeps its shape; its comment gains: «Only writer: recordExerciseAttempt. For an
`Exercise` attempt there is at most one row, the first wrong move: D19 decides the attempt there, and what the
student plays afterwards to learn is not stored.» Back-relations are added on `User` (`exercisesAuthored`,
`exercisesReviewed`, `seriesCreated`, `exerciseSeriesShares`, `exerciseStates`), `Teacher` (`exercises`,
`exerciseSeries`, `exerciseSeriesShares`), `Game` (`exercises`), `Topic` (`exerciseTopics`) and
`AttemptResult` (`exerciseStates`). The header comment of `schema.prisma` (the list of hand-written
constraints) gains the six CHECKs.

### 2.3 Values that are derived, and their single writers

| Column(s) | Rule (pure) | Single writer (services/shared/) |
| --- | --- | --- |
| `Exercise.solutionPgn` + `kindId`, `mateIn` + `startFen`, `startPositionHash`, `solutionPlies`, `playerMoves` | `readSolutionStart` and `analyzeSolution` (`lib/chess/exercise-format.ts`) + `createPositionHash`; the kind↔mateIn rule | `createExerciseRecord(db, input)` and `syncExerciseSolution(db, exerciseId, input)` in `exercise-record.service.ts`; both spread `exerciseSolutionColumns(input)` from the same file (the `classScheduleColumns` pattern), which returns the seven columns together |
| `Exercise.statusId`, `submittedAt`, `reviewedAt`, `reviewedById`, `reviewNote`, `publishedAt` | `exercise-status-transitions.ts` (pure table, tested) | `transitionOwnExercise` and `reviewLibraryExercise` in `exercise-status.service.ts`; the initial `DRAFT` through a spread of `initialExerciseStatusData(ids)` from the same file, which `createExerciseRecord` spreads |
| `TrainingAttempt` rows with `exerciseId`, `TrainingMistake`, `UserExerciseState` | `replayAttempt` (`lib/chess/exercise-solver.ts`), `applyExerciseReview` (`lib/training/review-schedule.ts`), the study-day gate over the solve key's family (§2.7) | `recordExerciseAttempt(db, input)` in `exercise-attempt.service.ts`, after `lockExerciseFamily` (same file); `rebuildUserExerciseState(db, userId)` folds the same rule (seed, drift), legacy rows as the phase 2 migration did (§2.5) |
| `UserActivity` / `UserStatDaily` for exercises | `exerciseActivityTopic` (pure, §2.7) | `recordUserActivity`, called only from `recordExerciseAttempt`, once per (user, solve key) |
| `ExerciseTopic` | — | `syncCatalogJoin`, inside the exercise's transaction |
| `StormRun.score`, `mistakes`, `finishedAt`, `endId` (phase 7) | counted from the run's attempts | `finishStormRun(db, runId, now)` in `storm-run.service.ts` |
| Series progress «4 de 10», class «2 de 3 lo resolvieron», lesson «2 de 3 resueltos», best contrarreloj score | counted on reading | none: never stored |
| An exercise's Level | `levelOfDifficulty(difficulty, levels)` (`services/shared/exercise-level.ts`): the easiest active `Level` whose `eloMin ≤ d ≤ eloMax` | none: derived on reading, so it can never disagree with the difficulty |

A new guard, `services/shared/exercise-writers.test.ts`, copies `class-writers.test.ts`: it parses every
source of `app`, `components`, `lib`, `services`, `scripts` as TypeScript, finds each write to `exercise`,
`trainingAttempt`, `trainingMistake`, `userExerciseState` (and `stormRun` from phase 7) and fails on a column
written outside the table above. Like its precedent, it refuses outside the writers any `data` it cannot read
(a variable, a spread), and inside a writer it requires the pure function's spread beside its columns:
`exercise.statusId` only in `exercise-status.service.ts`, plus the `...initialExerciseStatusData(` spread in
`createExerciseRecord`; `solutionPgn`, `kindId`, `mateIn` and the four frozen columns only in
`exercise-record.service.ts`, beside `...exerciseSolutionColumns(`; the review stamps only in
`exercise-status.service.ts`; the attempt tables only in `exercise-attempt.service.ts`; `trainingAttempt`
with `trainingExerciseId` stays allowed in `services/trainer/trainer.actions.ts`. **Every insert of an
`Exercise` goes through `createExerciseRecord(db, …)`**: the editor's save, «Duplicar»
(`duplicateTeacherExercise`), the lesson copy (`copyLibraryExerciseToLesson`, D28) and the import. The seed
is outside the guard's scan (`prisma/` is not in it, as for the classes) and is the documented exception: rows
by fixed id, spreading `exerciseSolutionColumns`, its status written as seeded data. A copy passes an explicit whitelist —
content (`solutionPgn`, `kind`, `mateIn`, title, prompt, difficulty, hints, explanation, the source fields,
topics) and `copiedFromId` — and never the review stamps or `sourceGameId`; the frozen columns are re-derived
from `solutionPgn`, never copied. The guard names `copyLibraryExerciseToLesson` and
`duplicateTeacherExercise` as places that may not write any of those columns themselves.

### 2.4 Phase 1 migration SQL, outline

`prisma/migrations/20261016120000_exercises/migration.sql`, hand-written per docs → Data model →
Migrations: the structure from `npx prisma migrate diff --from-config-datasource --to-schema
prisma/schema.prisma --script` (it reads the local database, so it goes with the owner's go), then the rest by
hand, in this order:

```sql
-- 1. Catalogs (production never runs the seed): upsert by code.
CREATE TABLE "ExerciseKind" (... "code" TEXT NOT NULL, ...); CREATE UNIQUE INDEX "ExerciseKind_code_key" ...;
INSERT INTO "ExerciseKind" ("code","label","order") VALUES ('SEQUENCE','Secuencia',0),('MATE_IN','Mate en N',1)
  ON CONFLICT ("code") DO UPDATE SET "label" = EXCLUDED."label", "order" = EXCLUDED."order";
CREATE TABLE "ExerciseStatus" (...);  INSERT ... DRAFT/READY/IN_REVIEW/PUBLISHED/ARCHIVED ... ON CONFLICT ...;
INSERT INTO "AttemptContext" ("code","label","order") VALUES ('LESSON','Lección',0),('CHAPTER_QUIZ','Quiz de capítulo',1),
  ('TRAINER','Entrenador',2),('SERIES','Serie',3),('PRACTICE','Práctica libre',4),('REVIEW','Repaso',5),
  ('CLASS','Clase',6),('STORM','Contrarreloj',7) ON CONFLICT ("code") DO UPDATE SET ...;
INSERT INTO "Topic" ("code","label","order") VALUES ('TACTICS','Táctica',0) ON CONFLICT ("code") DO NOTHING;
INSERT INTO "Topic" ("code","label","parentId","order")
  SELECT v.code, v.label, (SELECT "id" FROM "Topic" WHERE "code" = 'TACTICS'), v.ord
  FROM (VALUES ('FORK','Ataque doble',10), ... ) AS v(code, label, ord)
  ON CONFLICT ("code") DO UPDATE SET "label" = EXCLUDED."label", "parentId" = EXCLUDED."parentId", "order" = EXCLUDED."order";

-- 2. Exercise, ExerciseTopic, ExerciseSeries, ExerciseSeriesItem, ExerciseSeriesShare, UserExerciseState:
--    CREATE TABLE + indexes + FKs exactly as `migrate diff` prints them (names Prisma expects:
--    "Exercise_teacherId_fkey", "ExerciseSeriesItem_seriesId_order_key", ...), then:
ALTER TABLE "Exercise" ADD CONSTRAINT "exercise_difficulty_range" CHECK ("difficulty" BETWEEN 400 AND 3000);
ALTER TABLE "Exercise" ADD CONSTRAINT "exercise_mate_in_range" CHECK ("mateIn" IS NULL OR "mateIn" BETWEEN 1 AND 5);
ALTER TABLE "Exercise" ADD CONSTRAINT "exercise_hints_max" CHECK (cardinality("hints") <= 3);
ALTER TABLE "Exercise" ADD CONSTRAINT "exercise_source_year" CHECK ("sourceYear" IS NULL OR "sourceYear" BETWEEN 1400 AND 2100);
ALTER TABLE "ExerciseSeries" ADD CONSTRAINT "exercise_series_library_published"
  CHECK ("teacherId" IS NULL OR "publishedAt" IS NULL);

-- 3. TrainingAttempt: the rename keeps every row; names follow so `migrate diff` reports no difference.
ALTER TABLE "TrainingAttempt" RENAME COLUMN "exerciseId" TO "trainingExerciseId";
ALTER TABLE "TrainingAttempt" ALTER COLUMN "trainingExerciseId" DROP NOT NULL;
ALTER TABLE "TrainingAttempt" RENAME CONSTRAINT "TrainingAttempt_exerciseId_fkey" TO "TrainingAttempt_trainingExerciseId_fkey";
ALTER INDEX "TrainingAttempt_exerciseId_idx" RENAME TO "TrainingAttempt_trainingExerciseId_idx";
ALTER TABLE "TrainingAttempt" ADD COLUMN "exerciseId" TEXT, ADD COLUMN "seriesId" TEXT,
  ADD COLUMN "solutionShown" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TrainingAttempt" ADD CONSTRAINT "TrainingAttempt_exerciseId_fkey" FOREIGN KEY ("exerciseId")
  REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TrainingAttempt" ADD CONSTRAINT "TrainingAttempt_seriesId_fkey" FOREIGN KEY ("seriesId")
  REFERENCES "ExerciseSeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "TrainingAttempt_exerciseId_userId_idx" ON "TrainingAttempt"("exerciseId", "userId");
CREATE INDEX "TrainingAttempt_seriesId_userId_idx" ON "TrainingAttempt"("seriesId", "userId");
ALTER TABLE "TrainingAttempt" ADD CONSTRAINT "training_attempt_one_exercise"
  CHECK (("trainingExerciseId" IS NULL) <> ("exerciseId" IS NULL));
```

The constraint and index names in step 3 are read from the local database before writing
(`\d "TrainingAttempt"` through `npm run db:studio` or the migration that created them, `20260830190612_init`);
if they differ, the migration uses the real ones. `prisma/exercise-migration.test.ts` (a pure test, like
`class-migration.test.ts`) reads the SQL and checks: every code of the new catalogs and of `AttemptContext`
and the new topics in `CATALOG_VALUES`/`TOPIC_VALUES` is inserted with the same label; every CHECK named in
the schema's header comment is in the SQL; the rename precedes the new `exerciseId`.

### 2.5 Phase 2 model change: lesson exercises (migration `…_lesson_exercises`)

```prisma
model Exercise {
  // ...
  /// Owner when set: the lesson's exercise (D04, D05), authored by the staff, never in a bank, a series or
  /// the library. CHECK exercise_single_owner: not both teacherId and lessonId.
  lessonId    String?
  /// Its place in the lesson; null for an archived one (CHECK exercise_lesson_order_needs_lesson).
  lessonOrder Int?
  lesson Lesson? @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  @@unique([lessonId, lessonOrder])
}
model Lesson {
  // the TrainingExercise relation is renamed, and the new one takes a name no current code uses, so every
  // surviving `exercises` reader fails tsc instead of silently counting Exercise rows
  trainingExercises TrainingExercise[]
  lessonExercises   Exercise[]
}
model TrainingAttempt {
  // ...
  /// Set only by the phase 2 migration, on the attempts it moves from TrainingExercise: they were recorded
  /// under the trainer's rules (PASSED allowed mistakes, no study-day rule), so rebuildUserExerciseState
  /// folds them as the migration did (counts, dates, firstSolvedAt; no review, no day gate).
  isLegacy Boolean @default(false)
}
```

The name `exercises` is never reused on `Lesson` in this step: today's readers
(`staff-courses.service.ts` `_count: { select: { exercises: true … } }`, `courses.service.ts`
`exercises: { select: { id: true } }` feeding `trainerHref`, `trainer.service.ts`
`lessons: { some: { exercises: { some: {} } } }`) would otherwise typecheck against the new relation and
change meaning.

Lesson exercises use the same statuses, restricted by `exercise-status-transitions.ts` to `DRAFT`,
`PUBLISHED` and `ARCHIVED`; a student sees a `PUBLISHED` one when its lesson is published
(`publishedLessonWhere`). Data move, in SQL, inside the same migration (same rule as
`chapter_duration_derived`: the SQL computes what the writer would, and says so):

```sql
ALTER TABLE "Exercise" ADD COLUMN "lessonId" TEXT, ADD COLUMN "lessonOrder" INTEGER;  -- + FK, unique index
ALTER TABLE "Exercise" ADD CONSTRAINT "exercise_single_owner" CHECK (NOT ("teacherId" IS NOT NULL AND "lessonId" IS NOT NULL));
ALTER TABLE "Exercise" ADD CONSTRAINT "exercise_lesson_order_needs_lesson" CHECK ("lessonOrder" IS NULL OR "lessonId" IS NOT NULL);

-- Every hand-made TrainingExercise becomes an Exercise with the SAME id (D05).
INSERT INTO "Exercise" ("id","kindId","statusId","title","prompt","difficulty","hints","solutionPgn","startFen",
  "startPositionHash","solutionPlies","playerMoves","lessonId","lessonOrder","createdAt","updatedAt")
SELECT te."id",
  (SELECT "id" FROM "ExerciseKind" WHERE "code" = 'SEQUENCE'),
  (SELECT "id" FROM "ExerciseStatus" WHERE "code" = 'PUBLISHED'),
  left(CASE WHEN n.cnt > 1 THEN l."name" || ' · ' || te."order" ELSE l."name" END, 120),
  left(te."promptText", 200),
  -- the course's easiest level, else 1200, inside the CHECK
  LEAST(3000, GREATEST(400, COALESCE((SELECT min(lv."eloMin") FROM "CourseLevel" cl JOIN "Level" lv ON lv."id" = cl."levelId"
                                      WHERE cl."courseId" = ch."courseId"), 1200))),
  '{}',
  -- FIND_MOVE kept only its first SAN (the trainer stopped there); REPRODUCE_LINE keeps the whole line.
  '[SetUp "1"]' || E'\n' || '[FEN "' || te."startFen" || '"]' || E'\n\n' ||
    (CASE m."code" WHEN 'FIND_MOVE' THEN split_part(trim(te."line"), ' ', 1) ELSE trim(te."line") END) || ' *',
  te."startFen",
  -- = createPositionHash: sha256 of normalizePositionFen (the first four FEN fields)
  encode(sha256(convert_to(array_to_string((string_to_array(te."startFen", ' '))[1:4], ' '), 'UTF8')), 'hex'),
  p.plies, (p.plies + 1) / 2,
  te."lessonId", te."order", now(), now()
FROM "TrainingExercise" te
JOIN "ExerciseMode" m ON m."id" = te."modeId"
JOIN "Lesson" l ON l."id" = te."lessonId"
JOIN "Chapter" ch ON ch."id" = l."chapterId"
JOIN LATERAL (SELECT count(*) AS cnt FROM "TrainingExercise" x WHERE x."lessonId" = te."lessonId" AND NOT x."isDerived") n ON true
JOIN LATERAL (SELECT CASE m."code" WHEN 'FIND_MOVE' THEN 1
              ELSE array_length(string_to_array(trim(te."line"), ' '), 1) END AS plies) p ON true
WHERE NOT te."isDerived";

INSERT INTO "ExerciseTopic" ("exerciseId","topicId")
SELECT te."id", lt."topicId" FROM "TrainingExercise" te JOIN "LessonTopic" lt ON lt."lessonId" = te."lessonId"
WHERE NOT te."isDerived";

ALTER TABLE "TrainingAttempt" ADD COLUMN "isLegacy" BOOLEAN NOT NULL DEFAULT false;
UPDATE "TrainingAttempt" SET "exerciseId" = "trainingExerciseId", "trainingExerciseId" = NULL, "isLegacy" = true
WHERE "trainingExerciseId" IN (SELECT "id" FROM "TrainingExercise" WHERE NOT "isDerived");

-- The standing of each student with each moved exercise; the review columns stay null (old attempts were
-- recorded under the trainer's rules, where PASSED allowed mistakes, so they schedule nothing).
INSERT INTO "UserExerciseState" ("userId","exerciseId","attemptCount","firstAttemptAt","firstSolvedAt","lastAttemptAt","updatedAt")
SELECT a."userId", a."exerciseId", count(*), min(a."createdAt"),
       min(a."createdAt") FILTER (WHERE r."code" = 'PASSED'), max(a."createdAt"), now()
FROM "TrainingAttempt" a JOIN "AttemptResult" r ON r."id" = a."resultId"
WHERE a."exerciseId" IS NOT NULL GROUP BY a."userId", a."exerciseId";

DELETE FROM "TrainingExercise" WHERE NOT "isDerived";
```

`lastResultId` is set by a second `UPDATE … FROM (SELECT DISTINCT ON ("userId","exerciseId") …)`. Unnumbered
movetext (`e4 c5 Nf3`) is valid PGN for chessops' parser (checked on 2026-10-16:
`parsePgn('[FEN …]\n\nRd1+ Ke7 Rd4 *')` gives the three SANs); the first save in the editor re-serializes it
numbered. `prisma/exercise-migration.test.ts` gains a block for this file: the `isDerived` filter is on the
INSERT, the attempts' UPDATE and the DELETE; the hash expression is the one above; and a JS replica of the
SQL hash over the seed's four start FENs equals `createPositionHash`. `exercise-attempt.service.test.ts` gains
«the rebuild over migrated (`isLegacy`) rows reproduces the migration's state exactly» (no `reviewStep`, no
`nextReviewAt`, same counts and dates, several same-day legacy attempts all counted), and the seed writes its
moved-equivalent attempts with `isLegacy: true`.

### 2.6 What happens to the line trainer's code

- `services/trainer/trainer.actions.ts` writes `trainingExercise: { connect }` instead of `exercise`.
- `services/trainer/trainer.service.ts`, `services/courses/courses.mapper.ts` (`trainerHref`,
  `exerciseCount`), `services/courses/courses.service.ts`, `services/shared/course-review.service.ts`,
  `services/staff-courses/staff-courses.service.ts` read `lesson.trainingExercises` from phase 2 on; the new
  lesson exercises are read as `lesson.lessonExercises` (§2.5), so a reader this list misses fails tsc.
- `services/dashboard/dashboard.service.ts` resolves `SUBJECT_TYPE.EXERCISE` names from `exercise.title`
  first and from `trainingExercise.lesson.name` for the ids left (the dormant trainer's old activity).
- IMPROVEMENTS: before `MOVE_TRAINER_ENABLED` goes back on, the trainer must stop writing `EXERCISE_PASSED`
  on every pass (it would break D22's «once»); give it an activity type of its own.

### 2.7 Streak, «Ejercicios superados» and the review schedule (D22, D23, D33)

- The streak counts any `UserActivity` row (`services/study-goal/study-goal.service.ts`), and «Ejercicios
  superados» is the `EXERCISES_PASSED` metric fed by `EXERCISE_PASSED`. So D22 is one rule:
  `recordExerciseAttempt` writes `EXERCISE_PASSED` (subject `EXERCISE`, the exercise id) **only when it is
  the student's first PASSED attempt of that exercise**, decided by
  `updateMany({ where: { userId, exerciseId, firstSolvedAt: null }, data: { firstSolvedAt: now } })`
  returning `count === 1`, inside the attempt's transaction (two concurrent submits cannot both win). The
  activity's `topicId` is `exerciseActivityTopic(topics)` (pure, `services/shared/exercise-activity-topic.ts`,
  tested): the exercise's topics **rolled up to their roots** (`parentId ?? id`), and among those roots the
  one with the lowest `Topic.order`, ties by id. So the dashboard's breakdown keeps its five top-level topics
  and the same exercise always credits the same one, in the writer and in any rebuild.
- **A lesson copy is the same exercise (D22, D28).** A library exercise copied into a lesson gets a new id,
  but solving the original and then the copy is one exercise, not two. So the activity is keyed on the
  **solve key**, `exerciseSolveKey(exercise)` = `copiedFromId` when the row is a lesson copy (`lessonId` and
  `copiedFromId` set), else its own `id` (a teacher's «Duplicar» makes a new exercise and keeps its own
  key). The activity's `subjectId` is the solve key, and besides winning the `updateMany` above,
  `recordExerciseAttempt` writes it only when no other row of the family for this user (the key's own
  `UserExerciseState` or a lesson copy's of it) already has `firstSolvedAt`, read in the same transaction
  under the family lock below, so two concurrent first solves of an original and its copy are serialised and
  count once. The teacher's «Ejercicios superados» (§6.1) and the lesson's «2 de 3 resueltos» (§7.1) count by
  solve key too: a lesson copy counts as solved when any row of its family has `firstSolvedAt`.
- **Scored once per study day (D19, D20, D23).** A student who fails, or presses «Ver la solución», must not
  turn that into a pass seconds later: the failure would vanish from «Ejercicios superados» and the streak
  (D19, D20), the review would climb from step 0 to step 1 and skip the one-day return (D23), and the
  teacher's «Fallado» would become «Resuelto» (D24, D29). So **an exercise is scored at most once per study day per
  student**, and «the exercise» is the solve key's family (the original and its lesson copies, as for D22):
  `recordExerciseAttempt` stores nothing when any row of the family for this student has `lastAttemptAt` in
  the current study day (`lib/study-streak`'s day, `STUDY_DAY_TIMEZONE`) and answers `{ scored: false }`.
  The solver knows it before the first move (the page reads the same state) and runs as
  `mode="unscored"`: the same board, hints and solution, nothing submitted, and the head says «Ya lo
  intentaste hoy: este intento no cuenta.» The exercise is scored again when it comes back through review
  or on any later study day. The contrarreloj never deals an exercise attempted today (§5.6).
- **The gate is atomic.** A read followed by a write would let two concurrent submits (the wrong-move
  auto-submit and «Ver la solución» before the first answer, two tabs, a retry) both pass under READ
  COMMITTED, store two attempts and let a pass take `firstSolvedAt` after a fail: the loophole the rule
  closes. So the first statement of `recordExerciseAttempt` is `lockExerciseFamily(tx, userId, solveKey)`
  (same file, the `lockClasses` pattern of `services/shared/class-locks.ts`): `INSERT INTO
  "UserExerciseState" ("userId","exerciseId",…) VALUES (…, solveKey, …) ON CONFLICT DO NOTHING`, then
  `SELECT … FROM "UserExerciseState" WHERE "userId" = $1 AND "exerciseId" = $solveKey FOR UPDATE`. Every
  submit of the family takes that one row lock first, so they are serialised; the gate then reads the
  family's `lastAttemptAt` and the review state **after** the lock, and the state row of the exercise being
  solved is created with `ON CONFLICT DO NOTHING` too, so a first attempt never throws P2002. A key row created
  only as a lock holder has `attemptCount` 0 and no dates, which no reader takes for an attempt. Docs →
  Platform → Exercises names the statement that holds the lock.
- Review (D23, D33): `lib/training/review-schedule.ts` gains, beside `applyReview`,

  ```ts
  export const EXERCISE_REVIEW_INTERVALS_DAYS = [1, 3, 7, 21, 60] as const;
  export type ExerciseOutcome = "clean" | "hinted" | "failed";
  export interface ExerciseReviewState { reviewStep: number | null }
  export interface ExerciseReviewOutcome { reviewStep: number | null; nextReviewAt: Date | null }
  /** `dayStart(n)` = the start of the study day n days after `now` (STUDY_DAY_TIMEZONE, lib/study-streak). */
  export function applyExerciseReview(state: ExerciseReviewState, outcome: ExerciseOutcome, now: Date): ExerciseReviewOutcome;
  export function isExerciseDue(nextReviewAt: Date | null, now: Date): boolean; // null = not in review = not due
  ```

  | Before | clean | hinted | failed |
  | --- | --- | --- | --- |
  | not in review (`null`) | stays out | step 1 (3 days) | step 0 (1 day) |
  | step k < 4 | step k+1 | stays k (same interval again) | step 0 |
  | step 4 (60 days) | graduates (`null`) | stays 4 | step 0 |

  «Clean» is PASSED with no hint; «hinted» is PASSED with a hint (D33: passed, not perfect, back sooner than a
  clean one, which climbs or never returns); «failed» is FAILED, including «Ver la solución». A review date is
  the start of a study day, so an exercise due «today» is due all day. The schedule is computed from phase 1
  on (it is the same transaction and the same tested function); only the student's screens wait for phase 6.
  Contrarreloj attempts (phase 7) never move it: time pressure is not what the review measures.
- **The rebuild has a cutover.** `rebuildUserExerciseState` folds the non-legacy attempts with exactly the
  writer's rules (the family day gate, the ladder, the activity's once) and the `isLegacy` ones (§2.5) as the
  phase 2 migration did, so running it on a migrated database (seed, the drift fixer) never rewrites what the
  migration chose.

---

## 3. Solving engine

Two pure modules, no React and no Prisma, run in the browser and on the server, tested whole.

### 3.1 `lib/chess/exercise-format.ts` (authoring and storage)

```ts
export type ExerciseKindCode = "SEQUENCE" | "MATE_IN";
export interface SolutionInput { solutionPgn: string; kind: ExerciseKindCode; mateIn: number | null }
/** What every save needs, a draft included: a readable start and the frozen columns. */
export type SolutionStart =
  | { ok: true; normalizedPgn: string; startFen: string; solutionPlies: number; playerMoves: number }
  | { ok: false; problem: "unreadable" | "badPosition" | "unsupportedVariant" };
export function readSolutionStart(pgn: string): SolutionStart;
export type SolutionProblem =
  | { code: "unreadable" } | { code: "badPosition" } | { code: "unsupportedVariant" }
  | { code: "noMoves" } | { code: "illegalMove"; detail: string } // pgn-tree warnings
  | { code: "mateInMissing" } | { code: "mateInOnSequence" }
  | { code: "notMate"; path: string }          // a MATE_IN line that does not end with the PLAYER's move mating
  | { code: "mateTooLong"; path: string }      // a MATE_IN line with more than N player moves
  | { code: "mateLengthMismatch" }             // the main line mates in fewer than N player moves
  | { code: "notForced" }                      // N ≤ 2: a defence the tree does not hold escapes mate in N
  | { code: "mistakeVariant"; path: string };  // an accepted player variant whose move carries $2, $4 or $6 (?, ??, ?!)
export type SolutionWarning =
  | { code: "opponentVariant"; path: string }  // replies always follow the main line
  | { code: "playerAlternatives"; at: string; sans: string[] } // «Se aceptan: Ab8#, Da8#»
  | { code: "shortAlternative"; path: string }; // SEQUENCE: an accepted variant ends before the main line does
export type SolutionAnalysis =
  | { ok: true; normalizedPgn: string; startFen: string; solutionPlies: number; playerMoves: number; warnings: SolutionWarning[] }
  | { ok: false; problems: SolutionProblem[]; warnings: SolutionWarning[] };
/** The readiness gate (READY, PUBLISHED, import as ready): readSolutionStart + every rule of §3.3. */
export function analyzeSolution(input: SolutionInput): SolutionAnalysis;
/** «Eliminar las variantes marcadas como error» (editor, D11 seed and import): drops player variants with $2/$4/$6. */
export function dropMistakeVariants(pgn: string): string;
/** The editor's empty solution over a position: [SetUp]/[FEN] and no moves. */
export function emptySolutionPgn(startFen: string): string;
/** «Crear ejercicio desde aquí» and «Desde una partida» (D11): position after `path`, solution = the subtree after it. */
export function exerciseSeedFromGame(gamePgn: string, path: string): { startFen: string; solutionPgn: string } | null;
/** The seed's and the phase 2 migration's shape: a frozen line as a solution PGN. */
export function solutionPgnFromLine(startFen: string, sans: readonly string[]): string;
```

`normalizedPgn` is `makePgn` of the game with every header removed except `SetUp`/`FEN` (the source fields
live in columns), and its `[FEN]` header **rewritten to the normalized `startFen`** (chessops drops an
impossible castling right or en passant square), so the header, `startFen` and the hash never disagree.

`readSolutionStart` is the reading every save shares. It does not trust `parsePgnTree`'s fallback (an invalid
`[FEN]` silently becomes the standard start there): it calls chessops' `startingPosition(headers)` first and
answers `badPosition` on an error, and `unsupportedVariant` on a `[Variant]` other than absent, `Standard` or
`From Position` (chessops would otherwise validate under, say, atomic rules what the solver plays as
standard). It also runs `validateSetup`'s extra checks of §4.3 (impossible check, impossible material) on the
start. Then the frozen columns are deterministic for any readable PGN, a draft included: `startFen` is the
normalized start; `solutionPlies` counts the **legal** main line up to its first illegal move (0 with no
moves); `playerMoves` = the player's moves in those plies; the PGN is stored as `normalizedPgn` (a broken
branch is cut where `parsePgnTree` stops reading it, and the editor says so). «Guardar borrador» needs only
`readSolutionStart` ok; `analyzeSolution` is the readiness gate. `readPositionInput`
(`lib/chess/position-input.ts`) uses the same start check, so «Pegar FEN o PGN» refuses a bad `[FEN]` in the
editor, not only on save.

`exerciseSeedFromGame` copies the nodes under `path` (all children, their variants, comments and NAGs; the
copy-not-reuse rule of `variationPgn`) into a new game whose `FEN` is the node's FEN. Study games and imported
files often hold refuted tries as variants («14. Cxe5? Dxe5»), which D02 would accept as solutions, so the
editor and the import preview list them (`mistakeVariant` blocks readiness; `playerAlternatives` and
`shortAlternative` are shown) and offer «Eliminar las variantes marcadas como error» (`dropMistakeVariants`)
before saving or importing. `exerciseSolutionColumns` (server, `exercise-record.service.ts`) =
`readSolutionStart` + `createPositionHash` + `kindId` and `mateIn` after the kind↔mateIn rule (`mateIn` is
null for SEQUENCE, required 1–5 for MATE_IN); the status a button asks for then needs `analyzeSolution` ok.

### 3.2 `lib/chess/exercise-solver.ts` (solving)

```ts
export interface SolverExercise { solutionPgn: string; kind: ExerciseKindCode; mateIn: number | null; hints: readonly string[] }
export interface Solution { tree: PgnTree; player: "white" | "black"; kind: ExerciseKindCode; mateIn: number | null; hints: readonly string[] }
export function readSolution(exercise: SolverExercise): Solution | null;

export interface Mistake { ply: number; fen: string; playedSan: string; expectedSan: string; hintShownBefore: boolean }
export interface SolveState {
  /** Node the board stands on: "" at the start; always a node where the player moves, or the end. */
  path: string;
  fen: string;
  /** Decided as failed: a wrong move (D19) or «Ver la solución» (D20). Further moves teach, they do not score. */
  failed: boolean;
  firstMistake: Mistake | null;
  hintsUsed: number;
  textHintsShown: number;
  /** Square of the piece to move, while a piece hint is on (D37). */
  hintSquare: string | null;
  solutionShown: boolean;
  completed: boolean;
  /** For the attempt: player moves along the line taken, right first time, and plies reached. */
  requiredMoves: number;
  correctMoves: number;
  reachedPly: number;
  /** The decision point: the moves (SAN) up to it, and hintsUsed at each, for the server's replay. */
  decisive: { moves: { san: string; hintsBefore: number }[]; at: "wrongMove" | "solution" | "completed" } | null;
}
export function startSolving(solution: Solution): SolveState;

export type MoveResult =
  | { kind: "illegal" }
  | { kind: "correct"; state: SolveState; playerPath: string; reply: { san: string; path: string } | null; completed: boolean }
  | { kind: "wrong"; state: SolveState; mistake: Mistake; isFirst: boolean };
/** The player's move, as the board gives it (SAN from a FEN). */
export function playMove(solution: Solution, state: SolveState, san: string): MoveResult;

export type Hint = { kind: "text"; text: string; index: number } | { kind: "piece"; square: string };
export function takeHint(solution: Solution, state: SolveState): { state: SolveState; hint: Hint };

export interface SolutionStep { path: string; san: string; fen: string; comment?: string; byPlayer: boolean }
/** «Ver la solución»: the main line from where the board stands to the end, and the state marked failed. */
export function showSolution(solution: Solution, state: SolveState): { state: SolveState; steps: SolutionStep[] };

export interface AttemptOutcome {
  result: "PASSED" | "FAILED"; isPerfect: boolean; hintsUsed: number; solutionShown: boolean;
  mistake: Mistake | null; requiredMoves: number; correctMoves: number; reachedPly: number;
  review: ExerciseOutcome; // "clean" | "hinted" | "failed"
}
export function outcomeOf(state: SolveState): AttemptOutcome;

/** The server's check: the submitted moves replayed from the start must reach the decision they claim. */
export function replayAttempt(
  solution: Solution,
  input: { moves: { san: string; hintsBefore: number }[]; hintsUsed: number; solutionShown: boolean },
): { ok: true; outcome: AttemptOutcome } | { ok: false; reason: "unreadable" | "illegal" | "movesAfterDecision" | "undecided" };
```

### 3.3 The rules the solver implements

1. **Matching** (D02). At a player node, the move is compared with every child as a normalized move
   (`parseSan` on the node's position → `makeUci` of the normalized move, so an underpromotion is not a queen
   promotion). The board never sends `Kg1` for castling: `ChessBoard` turns a drag into SAN through
   `sanForMove` → `makeSanAndPlay`, which gives `O-O` for both e1→g1 and e1→h1. Any child is accepted: the
   main line and every variant (`analyzeSolution` lists them as `playerAlternatives` so the author sees what
   is accepted, and refuses one marked as a mistake, `mistakeVariant`). A matched variant is followed from
   then on. On the server, `expectedSan` and `playedSan` are stored as `makeSan` of the parsed moves, so the
   D24 views show canonical SAN whatever the PGN token was.
2. **The reply** (D01). After a matched player node with children, the platform plays `children[0]`, the
   main continuation, whatever variants the author wrote for the opponent (those are shown in the solution;
   `analyzeSolution` warns about them with `opponentVariant` so the author knows).
3. **Completion.** The exercise is completed when a matched player move has no children, or when the reply
   has none. A one-move exercise is a sequence of one (D01).
4. **«Mate en N»** (D02, D03). Solved by rules 1–3 like any sequence: **only moves in the tree (the main
   line and its variants) are accepted**; a legal move outside the tree is wrong even if it gives checkmate
   (D02: «NOT any mate counts»). An author who knows a second mate adds it as a variant. «Checked by chess
   rules, no engine» (D03) is the authoring check: `analyzeSolution` refuses a MATE_IN solution any of whose
   lines does not end with **the player's** move giving checkmate (`notMate`: `positionOutcome(fen) ===
   "checkmate"` and the line's last move is the player's, so a line where the opponent mates the player
   fails), takes more than N player moves (`mateTooLong`), or whose main line mates in fewer than N
   (`mateLengthMismatch`: a «Mate en 2» that mates in 1 is mislabelled). For N ≤ 2 it also checks, by an
   exhaustive legal-move search (no engine: about 35 × 30 × 35 positions), that the main line's key move mates
   in at most N against **every** defence, not only the author's (`notForced`); for N ≥ 3 the search is not
   run and the author's lines are trusted (written in docs). Accepting a mate outside the tree is offered to
   the owner as an option (§10), not built.
5. **First wrong move fails** (D19). The first unmatched move records `firstMistake` (expected = the main
   child's SAN, the move the platform would have accepted first), sets `failed` and fixes `decisive`. The
   board takes the move back; the student can keep trying from the same node until they find a matched move
   or press «Ver la solución». Later wrong moves are not mistakes of the attempt.
6. **Hints** (D20, D37). Each press increments `hintsUsed`. While `textHintsShown < hints.length` it shows
   the next author text; after that (or with no texts) it highlights the from-square of the main child's
   move at the current node, which works at any step of the sequence.
7. **«Ver la solución»** (D20). Sets `failed`, `solutionShown`, `completed` and returns the steps from the
   current node; the screen plays them with their comments. Counts as FAILED.
8. **Outcome** (D33). PASSED = completed and never `failed`; `isPerfect` = PASSED and `hintsUsed === 0`;
   `review` = `clean`, `hinted` or `failed` accordingly.
9. **Server replay.** `replayAttempt` re-plays `moves` from the start: all matched and completed → PASSED;
   all matched except the last, which is unmatched → FAILED with that mistake; all matched and
   `solutionShown` → FAILED. A move after the decision, an illegal move or an undecided sequence is refused.
   `hintsBefore` only lowers the outcome, so it is trusted as sent; the expected/played SANs and the FEN of
   the mistake are the server's.

### 3.4 Tests

`lib/chess/exercise-format.test.ts`:

- Reads a solution with `[FEN]`, variants and comments; `normalizedPgn` drops `Event`/`White`…, keeps
  `SetUp`/`FEN`, keeps comments and `[%cal]`.
- `startFen` is the node FEN with clocks (`makeFen`); `solutionPlies`/`playerMoves` for 1, 2, 3 and 4 plies
  (`playerMoves` = ⌈plies / 2⌉ when the line starts with the player).
- `noMoves` on `[FEN]` only; `illegalMove` on a PGN with a broken branch; `unreadable` on garbage.
- `readSolutionStart`: a draft with no moves gives `solutionPlies` 0, `playerMoves` 0 and the normalized start;
  a draft with a broken branch gives the plies of its legal main line; both are the same on a second read of
  the stored `normalizedPgn`. `badPosition` on a `[FEN]` with the side not to move in check and on pawns on the
  last rank (where `parsePgnTree` alone falls back to the start position); `unsupportedVariant` on
  `[Variant "Atomic"]`; a `[FEN]` with an impossible castling right is stored with the header rewritten to the
  normalized FEN, equal to `startFen`.
- MATE_IN: the Philidor smothered mate (below) passes as `mateIn: 2`; the same with `mateIn: 1` fails
  `mateTooLong`; the back-rank mate in 1 labelled `mateIn: 2` fails `mateLengthMismatch`; a line ending in
  check but not mate fails `notMate`, and so does a line ending with the opponent mating the player; a variant
  defence that is mated passes; a «mate in 2» whose key move lets an unwritten defence escape fails
  `notForced`.
- `opponentVariant` warning when the reply node has siblings; `playerAlternatives` lists `Rb8#, Qa8#` for the
  two-mates position; `shortAlternative` for a SEQUENCE variant that stops after one player move while the main
  line goes on; `mistakeVariant` for `14. Bxf7+! (14. Nxe5? Qxe5)` (the NAG read as chessops parses it), and
  `dropMistakeVariants` removes exactly that variant.
- `exerciseSeedFromGame` at a move in the middle of a seeded game: FEN = that node's, solution = its subtree
  with variants; at the last move: empty solution; at a broken path: null.
- `solutionPgnFromLine` over the Lucena line equals what `parsePgnTree` reads back.

`lib/chess/exercise-solver.test.ts` (positions checked with chessops on 2026-10-16):

- Back-rank mate in 1, `6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1`, solution `Rd8#`: `Rd8` (no `#`) is
  correct and completes; `Rd7` is wrong, `failed`, mistake `{ expectedSan: "Rd8#", playedSan: "Rd7" }`;
  after it, `Rd8` still completes with `result: "FAILED"`.
- Philidor's smothered mate in 2, `r6k/6pp/7N/8/8/1Q6/8/6K1 w - - 0 1`, `1. Qg8+ Rxg8 2. Nf7#`: the
  platform replies `Rxg8`; `Nf7` completes; `Nf7+` as a first move is wrong (it is not in the tree).
- Black to move, `3r2k1/8/8/8/8/8/5PPP/6K1 b - - 0 1`, `1... Rd1#`: the player is black; the first move
  is black's.
- Player alternatives (D02): `6k1/5ppp/8/8/8/8/Q4PPP/1R4K1 w - - 0 1` (both `Rb8#` and `Qa8#` mate,
  checked), solution `1. Rb8# (1. Qa8#)`: each is accepted, as a SEQUENCE and as a MATE_IN 1; with the tree
  holding only `Rb8#`, `Qa8` is wrong in both kinds, although it mates (D02); `Rb7` is wrong in both.
- Opponent variants (D01): the knight fork `r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1`, `1. Nc7+ Kd8 (1... Kd7)
  2. Nxa8`: the platform always replies `Kd8`; `analyzeSolution` warns `opponentVariant`; the student's
  `Nxa8` completes.
- Castling written `O-O`: the board's e1→g1 and e1→h1 both reach the solver as `O-O` (through `sanForMove`)
  and match. Underpromotion `=N` vs `=Q`: different. A mistake's `expectedSan` is canonical (`makeSan`) even
  when the PGN token omits the mate sign (`Rd8` stored as `Rd8#`).
- Hints: two author texts then piece hints (square of the main child's from-square), at the start and after
  a reply; `hintsUsed` counts every press; a PASSED attempt with a hint has `isPerfect: false`,
  `review: "hinted"`.
- `showSolution` from the start and from the middle: the steps, their comments, `result: "FAILED"`,
  `solutionShown: true`.
- A line that ends with the opponent's move completes after the reply.
- `replayAttempt`: accepts a clean pass, a first-wrong-move fail and a solution-shown fail; refuses a move
  after the decision, an illegal SAN, an incomplete clean sequence, an empty list without `solutionShown`.
- `outcomeOf` never says PASSED with `firstMistake` set (property over random move sequences on the
  smothered mate).

`lib/training/review-schedule.test.ts` gains the table of §2.7, row by row, and the study-day alignment
(a failure at 23:30 in Mexico City is due from 00:00 of the next study day, also across a DST change).

---

## 4. Authoring

### 4.1 Who reaches what

| Screen | Route | Gate | Phase |
| --- | --- | --- | --- |
| Teacher's bank («Mis ejercicios», «Series», «Biblioteca» from phase 4) | `/profesor/ejercicios` | `requireTeacher()` | 1 |
| New / edit exercise | `/profesor/ejercicios/nuevo`, `/profesor/ejercicios/[exerciseId]` | `requireTeacher()` + owner (`teacherId`), else `notFound()` | 1 |
| New from a study game | `/profesor/ejercicios/nuevo?estudio=<studyId>&partida=<gameId>&jugada=<path>` | `requireTeacher()` + the study is the teacher's (`userId` = teacher's user) | 1 |
| Series editor | `/profesor/ejercicios/series/[seriesId]` | `requireTeacher()` + owner | 1 |
| Import PGN | `/profesor/ejercicios/importar` | `requireTeacher()` | 5 |
| Lesson exercise new / edit | `/administracion/cursos/[courseId]/capitulos/[chapterId]/lecciones/[lessonId]/ejercicios/nuevo`, `…/ejercicios/[exerciseId]` | `requireStaff()` | 2 |
| Library, «En revisión», academy series | `/administracion/ejercicios` (`?vista=biblioteca|revision|series`) | `requireStaff()` | 4 |
| Staff new / edit / review | `/administracion/ejercicios/nuevo`, `/administracion/ejercicios/[exerciseId]` | `requireStaff()` | 4 |
| Staff import | `/administracion/ejercicios/importar` | `requireStaff()` | 5 |

Route builders go into `lib/platform-routes.ts` (`teacherRoutes.exercises`, `newExercise(from?)`,
`exerciseDetail(id)`, `exerciseSeries(id)`, `exerciseImport`, `studentExercises(studentId)`;
`staffRoutes.exercises(vista?)`, `newExercise`, `exerciseDetail(id)`, `exerciseImport`,
`lessonExerciseNew(…)`, `lessonExercise(…)`). Navigation: `TEACHER_NAV_ITEMS` gains «Ejercicios» after «Clases
que imparto»; `STAFF_NAV_ITEMS` gains «Ejercicios» after «Cursos» (phase 4); both through
`PlatformNavFeatures.exercises`, so `constants/platform/nav-items.test.ts` covers on and off.
Every page and action opens with the gate and checks `EXERCISES_ENABLED` (pages `notFound()`, actions return
`{ status: "error", formError: { code: "disabled" } }` or redirect with `withErrorParam(…, "disabled")`), except
the staff's lesson exercise routes and actions, which replace a live, unflagged panel (§7.1).

### 4.2 The editor

One component, `ExerciseAuthoring` (`components/platform/shared/exercise-authoring/`, BEM block
`.exercise-authoring`, client), mounted by the teacher's pages, the staff's and the lesson's. The name is not
`ExerciseEditor` on purpose: the staff lesson panel's `ExerciseEditor`, with its global `.exercise-editor`
block and its docs page, lives until phase 2 removes it, and two stylesheets on one block would leak rules
(`__list`…) into each other on a client-side navigation. It receives data, never components: the exercise (or the
prefill), the catalogs (kinds, topics with their parents, levels for the derived level line), the author's
games for «Desde una partida» (`{ id, label, studyName }[]`), what the author may do
(`permissions: { canMarkReady, canPublish, canPropose, canArchive, canDelete, contentLocked }`) and its
actions as props from the server section (`save`, `fetchGamePgn`, `transition`), so its story stubs them
and it imports no `.actions.ts`. Big-screen layout (≥1024 px): the board on the left, sticky; the steps on
the right. Phone (D39): the steps' tabs on top and the board under them, full width; everything works, the
palette wraps to two rows.

**One structure for state, tabs and the save** (Radix `Tabs.Content` unmounts an inactive panel, and
`PlatformForm` relies on the browser's validation, which would block a save over an invalid field hidden in
another tab with nothing said):

- The editor keeps every value in **lifted client state** (`useExerciseDraft`, a hook beside the
  component): the position, the solution PGN and each «Datos» field, all controlled. Switching tabs loses
  nothing, and «Probar» reads the same state (prompt, hints, explanation, kind, mateIn included).
- The save is **one `PlatformForm` outside the tabs**, holding only the save buttons and hidden inputs built
  from that state. It is submitted by hand (`onSubmit` → `startTransition(() => formAction(formData))`,
  `pending` on its `SubmitButton`), as AGENTS.md asks of a form with controlled Radix controls. The buttons sit
  in a footer bar under the tabs, visible on every tab (sticky at the bottom on a phone).
- Before submitting, a client check of the required fields (the same `EXERCISE_FORM_SCHEMA` rules) moves to
  the tab holding the first problem and focuses that field. A server error is mapped to its tab — position
  (`badPosition`…), solution (`notMate`, `mistakeVariant`…) or data (field errors) — shown there, and the tab
  carries an error mark (an icon and «con errores» in its accessible name) until it is fixed.
- The visible «Datos» fields are `PlatformFormField`s inside a `PlatformForm` of their own whose `onSubmit`
  only prevents the default (Enter in a field must not submit the save); the save reads the state, not that
  form. «Pegar FEN o PGN» is its own small form («Cargar posición», the analysis board's fields) whose result
  feeds the state; no form is ever nested in another.

Steps, as tabs (`PlatformTabs`, a new shared piece on Radix `Tabs`, with an `invalid` mark per tab):

1. **«Posición»** (D09), three ways in, one result (a FEN):
   - «Colocar piezas»: `PiecePlacementBoard` (§4.3) with its palette, plus the controls drawn with the
     platform's form pieces: «Juegan blancas» / «Juegan negras» (`PlatformChoiceCards`), the four castling
     rights (`PlatformCheckbox`, each disabled with its reason when the king or rook is not on its square),
     «Al paso» (`PlatformSelect` with `emptyOption` «Ninguna» and only the squares `enPassantOptions`
     allows), and three tool buttons, secondary `_size_sm` with a Classic Solid icon each: «Posición
     inicial», «Vaciar el tablero», «Girar el tablero». The problem of
     `validateSetup` shows under the board (`PlatformError`) and blocks the next step.
   - «Pegar FEN o PGN»: the two fields of the analysis board in their own small `PlatformForm` with
     «Cargar posición» (never inside the save form), read with `readPositionInput`
     (`lib/chess/position-input.ts`) — the same function, so the same messages, and from this work the same
     start check as `readSolutionStart` (a bad `[FEN]` is refused here); a PGN with moves gives its start
     position and, if wanted, its moves as the solution («Usar sus jugadas como solución»).
   - «Desde una partida»: a `PlatformSelect` of the author's games grouped by study, then `MovePathPicker`
     (lifted from the class block editor to `components/platform/shared/move-path-picker/`, its prop
     generalized to `fetchPgn(id)`) and «Usar esta posición» → `exerciseSeedFromGame` (solution = what
     follows, D11), source fields filled from the game's headers, `sourceGameId` set.
   Changing the position once a solution exists opens a `PlatformConfirmPopup` («Eliminar» the solution).
2. **«Solución»** (D10): `GameViewer` with `interaction="edit"` over the solution PGN (`emptySolutionPgn`
   at first), `tools` on (comments, NAGs, arrows: the existing `GameTools`), `engine` off (D03). Moves are
   played on the board; a move played from an earlier node becomes a variant, exactly as in a study. Under
   the board: `analyzeSolution`'s problems and warnings, live, in words («La línea 1… Dxg7+ no termina en
   mate.», «La respuesta del rival siempre es la línea principal; las otras se ven al mostrar la solución.»,
   «Se aceptan: Ab8#, Da8#.», «La variante 14. Cxe5? está marcada como error y se aceptaría como solución.»
   with the button «Eliminar las variantes marcadas como error»). Nothing is typed (D10).
3. **«Datos»** (D13, D38): controlled `PlatformFormField`s (see the structure above): «Título» (input, required), «Enunciado»
   (input, optional, placeholder from the side to move), «Tipo» (`PlatformChoiceCards`: «Secuencia», «Mate
   en N»), «Mate en» (`PlatformSelect` 1–5, only for «Mate en N»), «Dificultad» (`<input type="number"
   min=400 max=3000 step=50 required>`, hint under it: «Nivel: Intermedio (1400–1799)» from
   `levelOfDifficulty`), «Temas» (`PlatformFormGroup` over `PlatformCheckCards` with its new `groups` prop:
   a heading per parent topic with its cards under it, one `name`, one `role="group"` per heading — the
   `PlatformSelect` `groups` precedent —, so nineteen tactical topics stay readable on a phone; at least
   one, said by the save's error, not by the label), «Pistas» (three inputs, optional), «Explicación»
   (textarea, optional), and «Origen» (white, black, event, year — a group of all-optional fields, said once
   with `OptionalFields`).
4. **«Probar»**: `ExerciseSolver` (§5.3) in `mode="preview"` over the current, unsaved state (the lifted
   state above): nothing is recorded. It is how an author checks replies and variants before saving.

Saving. The editor holds its state only in the client, so a redirect on a refused save would lose it: its
save action uses `useActionState` (`services/shared/form-state.ts`), returns the values sent on failure (with
each error's tab, above), and redirects to the exercise with `withNoticeParam(…, "exerciseSaved")` on
success. This is a new documented exception to «las demás acciones redirigen», and the import's two steps
(§4.5) are another: commit 5 adds the editor, and phase 5 the import, to the exhaustive lists in
`docs/content/conventions.mdx` (the «only exceptions» paragraph) and `docs/content/platform/teacher-and-staff.mdx`
(«the only `useActionState` forms are…»), and to AGENTS.md's sentence «las demás acciones redirigen…» as a
one-line exception («salvo el editor de ejercicios y la importación, que conservan el tablero o el informe»),
because the change is to a convention. The hidden inputs carry `solutionPgn`, `startFen` and every «Datos»
value. Buttons (`.platform-button`, one accent per screen):

- teacher: «Guardar borrador» (secondary; stays `DRAFT`, needs only `readSolutionStart` ok, §3.1) and
  «Guardar y marcar como listo» (`_variant_accent`; `READY`, needs `exerciseReadiness`: `analyzeSolution`
  ok, title, difficulty, a topic); a `READY` exercise shows only «Guardar» (accent), which keeps it `READY`
  and refuses an incomplete save;
- staff, academy exercise: «Guardar borrador» (secondary) and «Guardar y publicar» (accent) (phase 4);
- staff, lesson exercise: «Guardar borrador» (secondary) and «Guardar y publicar» (accent) (visible when the
  course is, phase 2).

A new exercise is always inserted by `createExerciseRecord` as `DRAFT`; a button that asks for `READY` or
`PUBLISHED` then calls the transition writer in the same transaction (DRAFT → READY, DRAFT → PUBLISHED of
§8), so no insert sets a status of its own.

`contentLocked` (a teacher's `IN_REVIEW` or `PUBLISHED` exercise) makes the board and fields read-only with
the reason («Está en revisión: retira la propuesta para editarlo.» / «Está en la biblioteca: duplícalo para
hacer tu versión.») and offers «Duplicar» (a `createExerciseRecord` with the content whitelist of §2.3 and
`copiedFromId`; the copy starts `DRAFT`). Row actions on the bank (`.platform-row-action`): «Duplicar»,
«Archivar» (`READY`/`DRAFT`), «Restaurar» (`ARCHIVED`), «Eliminar» (only without attempts and outside class
blocks, through `PlatformConfirmPopup`; otherwise the action is not drawn and «Archivar» is). The bank's
header: «Nuevo ejercicio» `_variant_accent`, «Nueva serie» secondary.

The server: `services/teacher-exercises/teacher-exercises.actions.ts` (`saveTeacherExercise`,
`duplicateTeacherExercise`, `archiveTeacherExercise`, `restoreTeacherExercise`, `deleteTeacherExercise`,
`fetchTeacherGamePgn`), with the form's zod schema shared by every author in
`services/shared/exercise-form.ts` (`EXERCISE_FORM_SCHEMA`, `readExerciseForm`), so teacher and staff
validate the same fields the same way. Each write is one transaction: `createExerciseRecord` or
`syncExerciseSolution` + the other columns + `syncCatalogJoin(tx.exerciseTopic, tx.topic, { parent: {
exerciseId }, catalogColumn: "topicId", codes })` + the status writer when the button asked for a status.
Rate limits: `${user.id}:exercise-save` 60/min, `exercise-delete` 30/min.

### 4.3 The piece-placement board (D09)

- `components/chess/piece-placement-board/piece-placement-board.comp.tsx` (client): its own chessground
  instance (loaded like `chess-board-lazy`), `movable: { free: true, color: "both" }`,
  `draggable: { deleteOnDropOff: true }`, `events.change` → `onPlacementChange(cg.getFen())`; the palette
  (12 pieces, «Quitar» with the eraser icon and `aria-label` «Quitar pieza» — it takes a piece off the
  board without destroying anything, and AGENTS.md forbids «Borrar» (`components/ui-verbs.test.ts`) —, and
  «Mover») beside the board on a wide screen and under it on a
  phone. Two ways to place: drag from the palette (`cg.dragNewPiece(piece, event, true)`) and, for touch,
  select a palette piece then tap squares (tapping the same piece again removes it). Drawn with the platform
  tokens; 8px corners on the palette buttons (they are larger than 20px).
- Motion: the instance sets `animation: { enabled: !calm }` from the same
  `matchMedia("(prefers-reduced-motion: reduce)")` check as `ChessBoard` (`chess-board.comp.tsx`), because
  `reduced-motion.test.ts` reads only stylesheets and would not catch a JS animation.
- The palette is **one tool of several**: a single-select group (Radix `ToggleGroup type="single"`, from
  `radix-ui`), labelled «Herramienta», each item with its accessible name («Rey blanco», «Dama negra»…,
  «Quitar pieza», «Mover»). Choosing a tool is part of filling the form, so the selected item is drawn in
  `--platform-selection` / `--platform-selection-soft` and its focus ring is the selection blue. The story
  covers the keyboard (arrows move between tools, the focused tool visible).
- `lib/chess/position-setup.ts` (pure):

  ```ts
  export interface SetupInput { placement: string; turn: "white" | "black"; castling: { K: boolean; Q: boolean; k: boolean; q: boolean }; epSquare: string | null }
  export function setupFen(input: SetupInput): string;                 // "<placement> <w|b> <KQkq|-> <ep|-> 0 1"
  export function availableCastling(placement: string): SetupInput["castling"]; // king and rook on their squares
  export function enPassantOptions(placement: string, turn: SetupInput["turn"]): string[];
  export type SetupProblem =
    | "empty" | "kings" | "pawnsOnBackrank" | "oppositeCheck" | "castling" | "enPassant"
    | "impossibleCheck" | "impossibleMaterial";
  export function validateSetup(input: SetupInput): { ok: true; fen: string } | { ok: false; problem: SetupProblem };
  /** The two checks chessops' validate() does not make, shared with readSolutionStart (§3.1). */
  export function positionPlausibility(pos: Chess): "impossibleCheck" | "impossibleMaterial" | null;
  ```

  It maps chessops' `IllegalSetup` (`ERR_EMPTY`, `ERR_KINGS`, `ERR_PAWNS_ON_BACKRANK`, `ERR_OPPOSITE_CHECK`)
  and adds the two chessops normalizes silently (a castling right without its pieces, an en passant square
  no double push could have left), plus the two `validate()` never makes: `impossibleCheck` (chessops'
  `isImpossibleCheck`, which also covers a check an en passant square makes impossible: two knights, a triple
  check…) and `impossibleMaterial` (per side at most 16 pieces and 8 pawns, and the queens, rooks, bishops and
  knights beyond the starting set no more than 8 − pawns). Both are refusals; a composed study that needs them
  is not a v1 case. Messages in `constants/platform/exercise-messages.const.ts`: «Cada bando
  necesita exactamente un rey.», «Hay peones en la primera o la última fila.», «El bando que no juega está en
  jaque: esa posición no puede darse.», «Ese enroque necesita el rey y la torre en su casilla.», «Esa casilla
  al paso no es posible en esta posición.», «Coloca al menos los dos reyes.», «Ese jaque no puede darse en una
  partida.», «Hay más piezas de las que puede tener un bando.». The same `positionPlausibility` runs on the
  FEN of «Pegar FEN o PGN», of «Desde una partida» and of the import, through `readSolutionStart`. Tested in
  `position-setup.test.ts` (each problem, every castling combination, ep after `e2e4` and its impossible
  twins, `4k3/8/8/8/8/3n1n2/8/4K3 w - - 0 1` as `impossibleCheck`, nine white pawns and three white queens with
  seven pawns as `impossibleMaterial`, the initial position round trip).

### 4.4 «Crear ejercicio desde aquí» (D11, phase 1b)

- `GameViewer` gains a data prop `exerciseFromHereHref?: string` (a base URL with `estudio` and `partida`
  already in it). With it, the move menu (`MoveContextMenu`, new optional `onCreateExercise`) shows «Crear
  ejercicio desde aquí», and the «Compartir» tab of `GameTools` shows the same link for the current move (the
  menu opens on right click, which iOS Safari does not fire on a long press). The viewer appends
  `&jugada=<path>`. No new action: nothing is saved until the author saves.
- `GameViewSection` passes it when `game.canCreateExercise`: the game is the viewer's own (`canEdit`, not
  `asReader`) and they are an active teacher (from phase 4 also staff, to their academy bank).
  `services/studies/studies.service.ts` resolves it (it already calls `getTeacherContext()`, lines 141 and
  227; plus `EXERCISES_ENABLED`, off → never) and passes a plain `canCreateExercise` boolean to the mapper,
  which stays pure and keeps its unit test.
- The page `/profesor/ejercicios/nuevo` with those parameters calls
  `getExercisePrefillFromGame(teacher, { studyId, gameId, path })` of
  `services/teacher-exercises/teacher-exercises.service.ts`, never Prisma: the service reads the game through
  `getVisibleGamesWhere()` **and** `database: { userId: teacher.user.id }` (D11 says the teacher's studies),
  runs `exerciseSeedFromGame`, and returns the prefill — title («Blancas – Negras, 1999», from the game's
  players and date, or the game's title), source fields, `sourceGameId` and the seed's warnings (refuted
  variants, §3.1) — or null. The page opens the editor on «Solución»; null (a broken path, a game not theirs)
  → the editor opens plain, with no error (built that way in commit 6: nothing was asked to be saved, so
  there is nothing to refuse; a forged URL only gets an empty editor).

### 4.5 PGN bulk import (D12, phase 5)

- Page `/profesor/ejercicios/importar` (and the staff's): a `PlatformForm` with the PGN (textarea or file,
  `PGN_MAX_LENGTH`, at most `PGN_MAX_GAMES` games, read by `readImportedGames` of
  `services/shared/pgn-import.ts`, the platform's one PGN reader) and the defaults for what the headers do not
  say: «Dificultad», «Temas», «Tipo», «Estado» (`Borrador` / `Listo` for a teacher; `Borrador` / «En la
  biblioteca» for the staff — the status tag's own words), «Agregar a la serie» (optional select), and
  «Eliminar las variantes marcadas como error» (`PlatformCheckbox`, on by default: `dropMistakeVariants` before
  reading each game, §3.1).
- Conventions (documented in docs → Platform → Exercises → Import, with an example file):
  one game = one exercise; `[FEN]` is the start position (**required**); the movetext is the solution with
  its variants (accepted alternatives, D02) and comments; `[White]`/`[Black]`/`[Event]`/`[Date]` (year) fill
  the source (`?` is ignored); optional headers of ours: `[Title]`, `[Prompt]`, `[Difficulty "1400"]`,
  `[Topics "FORK, PIN"]` (codes or Spanish labels, case-insensitive), `[MateIn "2"]` (makes it «Mate en N»),
  `[Hint1]`–`[Hint3]`, `[Explanation]`. Without `[Title]`: «Blancas – Negras, año», else «Ejercicio N».
- Two steps through `useActionState` (the report is too long for a URL; the second documented exception of
  §4.2, added to conventions.mdx, teacher-and-staff.mdx and AGENTS.md in phase 5): «Revisar» runs
  `previewExerciseImport` (no write) and returns one row per game — «Se importará», «Se importará como
  borrador: le faltan temas», «No se importará: no tiene [FEN]», «… : su [FEN] no es una posición posible»,
  «… : la jugada 3 es ilegal», «… : la línea 2… no termina en mate», «Se quitó la variante 14. Cxe5? (marcada
  como error)», «Se aceptan varias jugadas: Ab8#, Da8#», «Ya está en tus ejercicios» (same
  `startPositionHash` and same first move among the author's exercises) —; «Importar N ejercicios» runs
  `importExercises`, which re-reads and writes the accepted ones in one transaction (`PGN_IMPORT_TRANSACTION`)
  through `createExerciseRecord` (each starts `DRAFT`) and, for the «Listo» or «En la biblioteca» choice, the
  transition writer in the same transaction, then returns the counts. Rate limit `${user.id}:exercise-import` 10 per 10 min. Tests: the header reading and the
  report rules as a pure module (`services/shared/exercise-import.ts` + test) over a fixture PGN with one
  case per row above.

---

## 5. Student

### 5.1 The «Ejercicios» section (D17, D35)

- Routes: `/ejercicios` (home), `/ejercicios/series/[seriesId]` (a series), `/ejercicios/series/[seriesId]/[n]`
  (its n-th exercise, 1-based), `/ejercicios/practica?tema=<code>&nivel=<slug>` (phase 4),
  `/ejercicios/repaso` (phase 6), `/ejercicios/contrarreloj` (phase 7). Builders in `platformRoutes`.
- `PROTECTED_PATH_PREFIXES` (`constants/platform/auth.const.ts`) gains `"/ejercicios"` and the proxy's
  matcher `"/ejercicios/:path*"` (`proxy.test.ts` fails on one without the other). No CSP change: nothing
  external is loaded.
- `STUDENT_NAV_ITEMS` gains «Ejercicios» after «Mis cursos» when `EXERCISES_ENABLED`. Until phase 4 there is
  nothing but a teacher's series to show, so in phases 1–3 the item is drawn only for a student with an
  active `TeacherStudent` or at least one visible series (`PlatformNavFeatures.exercises` becomes
  `exercises: "all" | "withTeacher" | false`, resolved per request by `getStudentExerciseAccess()` in
  `services/exercises/exercises.service.ts`; `nav-items.test.ts` covers the three). From phase 4, with the
  library, it is drawn for every student.
- `loading.tsx` of these routes draws only server pieces (`BoardSkeleton`), never the solver
  (`components/loading-boundaries.test.ts`).
- Services: `services/exercises/{exercises.service,exercises.mapper,exercises.types,exercises.actions}.ts`.

Home, top to bottom (each card appears with its phase and only with something in it):

1. «De tu profesor» — the series shared with the student (`ExerciseSeriesShare`) and still visible (§6.3),
   newest first: title, teacher, «4 de 10», «Continuar»/«Empezar». Empty states: with an assigned teacher,
   «Tu profesor aún no te ha dado ejercicios.»; without one (a student who reaches `/ejercicios` by URL in
   phases 1–3), «Todavía no tienes ejercicios. Cuando un profesor te dé una serie, aparecerá aquí.»
2. «Para repasar hoy» (phase 6) — «5 ejercicios» and «Repasar».
3. «Práctica libre» (phase 4, D18, D32) — tema and nivel (`PlatformSelect` with `tone="accent"`: it filters,
   it is not a form) and «Empezar».
4. «Series de la academia» (phase 4) — the library's published series.
5. «Contrarreloj» (phase 7) — «Tu mejor marca: 14» and «Empezar».

Buttons: one accent per screen. Only the first card's call to action is `_variant_accent` — the series to
continue (the newest shared series with an unsolved item), or, when there is none, the first card that has
one. Every other card's action is secondary, and the per-series actions in «De tu profesor» are
`.platform-row-action` («Continuar», «Empezar»).

### 5.2 A series

`/ejercicios/series/[seriesId]`: header (title, description, teacher), the items as rows with a small
`StaticDiagram`, title, difficulty, and the student's mark for **this series**: «Resuelto» with
`CircleCheckIcon` in the success ink (a PASSED attempt with this `seriesId`), «Fallado» with
`CircleXmarkIcon` in `--platform-danger` (attempts, none passed), or nothing; the word is always written
beside the icon, never a bare glyph (no ✓ ✗ · characters anywhere). «Empezar» (the page's accent) goes to the
first unsolved item. Only items the student may solve through this series (§6.3 branch 2: the owner's usable
exercise or one in the library now) are listed and counted. A series
the student cannot see → `notFound()`.

### 5.3 The solve screen (D19–D21, D33, D37, D39)

One component, `ExerciseSolver` (`components/platform/shared/exercise-solver/`, client), used by the series,
the lesson, the class block, practice, review and the editor's «Probar». It receives the exercise as data
(`{ id, title, prompt, kind, mateIn, solutionPgn, hints, explanation, difficulty }`), the context
(`{ kind: "SERIES", seriesId, position: "3 / 10" }` …), `next` (`{ href, label }` or none), `mode`
(`"solve" | "unscored" | "preview"`: «unscored» is a retry the same study day, «preview» the editor's
«Probar»; neither submits) and the `submit` action as a prop (absent in preview). It runs on `useExerciseSolver`
(`use-exercise-solver.hook.ts`), a thin hook over the pure solver.

Designed for the phone (D39), written as the CSS will be (desktop-first, range syntax, only the five cuts):

- By default (`width >= 1024px`): board left, a panel right with the head, the feedback, the actions and the
  moves played so far.
- `@media (width < 1024px)` stacks it (this covers tablets, 640–1023 px, and phones): the head; the board,
  full width (`max(min(100vw − 32px, 100svh − 240px), 280px)`, so a short landscape screen keeps a solvable
  board and the page scrolls instead), oriented to the player; under it the feedback line
  (`aria-live="polite"`); then the actions, `_size_lg` for the thumb: «Pista» (`_variant_soft`, lightbulb
  icon) and «Ver la solución» (secondary, eye icon).
- `@media (width < 1024px) and (orientation: landscape)` (an orientation is not a cut; the breakpoints test
  only reads widths) puts the actions beside the board again, so a phone on its side (844 × 390) is not a
  150 px board.
- The head: prompt — «Juegan blancas y ganan», or the default from the side to move, «… y dan mate en 2» for
  «Mate en N» — on the first line; the side dot, the clock `mm:ss` counting up (D21), «3 / 10» and, after a
  mistake, the tag «Fallado» on the second. Below 640 px it is always two lines; from 640 px it may share one. `ChessBoard` gains two data props, documented and storied: `hintSquare?: string`
(a circle on the piece's square) and `lastMoveTone?: "error"` (the wrong move's squares in the danger
colour).

Behaviour:

- The student moves (drag or tap; the existing promotion chooser). Correct: «¡Bien!», and after 450 ms (the
  trainer's `OPPONENT_REPLY_MS`) the reply with its sound. Wrong (D19): the move is shown with
  `lastMoveTone="error"` for 600 ms and taken back; «No es la jugada. Sigue intentándolo o mira la
  solución.»; the head gains the tag «Fallado»; the attempt is submitted **at that moment** (the decision),
  so leaving the page cannot hide a failure. The student can keep trying (D19) or press «Ver la solución».
- «Pista»: the next author text appears under the board (numbered), or the piece to move is circled (D37).
- «Ver la solución» (D20): if nothing was submitted yet, submits FAILED with `solutionShown`; then plays the
  steps one by one with their comments (‹ › to step, autoplay at 900 ms, off under reduced motion).
- On completion (or after the solution), the result panel replaces the actions:
  - «¡Resuelto!» (clean), «Resuelto con pista» (D33), «Fallado» with «Jugaste Cxe5; la jugada era Dxh7+»,
    or «Viste la solución»;
  - the explanation (D13), if any, and «Ver la solución completa» (a read-only `GameViewer` over the solution
    PGN: variants and comments);
  - «Siguiente ejercicio» (accent) / «Volver a la serie», and «Reintentar», which restarts the board as
    `mode="unscored"` (§2.7): nothing is submitted, the head says «Ya lo intentaste hoy: este intento no
    cuenta.», and the result
    panel at its end says only how it went this time, never «¡Resuelto!».
- Motion: the wrong-move flash and the panel's entrance are 160 ms in / 120 ms out and are switched off under
  `prefers-reduced-motion: reduce` (`components/reduced-motion.test.ts`).

### 5.4 Recording an attempt

`submitExerciseAttempt(input)` in `services/exercises/exercises.actions.ts` (a plain async server action, like
`recordTrainingAttempt`, called from the solver; it returns `{ ok: true; scored: boolean; firstSolve: boolean } |
{ ok: false; reason }` and the solver says «No se guardó el intento.» on failure):

```ts
interface SubmitAttemptInput {
  exerciseId: string;
  context: { kind: "SERIES"; seriesId: string } | { kind: "LESSON" } | { kind: "CLASS"; classBlockId: string }
         | { kind: "PRACTICE" } | { kind: "REVIEW" } | { kind: "STORM"; runId: string };
  moves: { san: string; hintsBefore: number }[]; // at most 200
  hintsUsed: number;                              // clamped 0–20
  solutionShown: boolean;
  durationMs: number;                             // clamped 0–2 h
}
```

1. `getCurrentUser()`; `EXERCISES_ENABLED`; `allowAction(`${user.id}:exercise-attempt`, 120, 60_000)`.
2. The exercise must be solvable **in that context** by this user:
   `db.exercise.findFirst({ where: { id, ...solvableInContextWhere(context, user.id, now) } })` (§6.3).
3. `replayAttempt(readSolution(row), input)` on the server; a refusal stores nothing.
4. `recordExerciseAttempt(tx, { userId, exercise, contextCode, seriesId?, classBlockId?, stormRunId?,
   outcome, durationMs, now })` in one transaction. First `lockExerciseFamily(tx, userId, solveKey)` (§2.7:
   the key row created with `ON CONFLICT DO NOTHING`, then `FOR UPDATE`), then the study-day rule read under
   that lock: if any row of the family has `lastAttemptAt` in the current study day, it writes nothing (except
   a `STORM` attempt, below) and returns `{ scored: false }`. Otherwise: the `TrainingAttempt` row; its
   `TrainingMistake` (hash with `createPositionHash(mistake.fen)`, `usedHint: mistake.hintShownBefore`,
   SANs as `makeSan`); the `UserExerciseState` row of this exercise created with `ON CONFLICT DO NOTHING` and
   then updated (`attemptCount + 1`, first/last dates, `lastResultId`, and `applyExerciseReview` over the
   state read after the lock, except for `STORM`); the first-solve `updateMany` and, if it won and no other
   row of the family is solved (§2.7), `recordUserActivity(tx, { typeCode: EXERCISE_PASSED, subjectTypeCode:
   EXERCISE, subjectId: exerciseSolveKey(exercise), topicId: exerciseActivityTopic(topics) })` (D22). A
   `STORM` attempt on a day already taken still stores its `TrainingAttempt` row (with `stormRunId`, no
   mistake row, no state, no activity), so the run's score counts it (§5.6); a rebuild skips it for the state
   by the same day rule.
5. `revalidatePath` of `/inicio` and the series page.

Tests: `services/shared/exercise-attempt.service.test.ts` with a fake client (the `fake-class-db.ts`
pattern): a first pass writes one activity; a second pass on a later study day writes none; a fail then a
pass on the **next** study day writes one and leaves the review at step 0 → step 1 only from that day; a
fail, or a «Ver la solución», then a pass **the same study day** stores nothing for the pass (`scored:
false`, no attempt, no activity, `reviewStep` still 0); the lock is taken before any read of the state (the
fake records the order of statements); a first attempt with no state row creates it without a P2002; a hinted
pass schedules step 1; a STORM attempt leaves `reviewStep` alone; a STORM attempt at an exercise attempted
earlier the same day stores its row for the run and nothing else; a FAILED attempt writes exactly one mistake
with the server's SANs; a pass of a lesson copy after a pass of its library original writes no activity, and
the activity of the original has `subjectId` = the original's id; a fail of the original in a series then a
pass of its lesson copy the same day stores nothing for the copy; the activity's topic is the lowest-order root
for an exercise with topics under two roots. A fake client cannot exercise row locking, so «two concurrent
submits the same day store one attempt» is checked in the phase 1 app check (two pages submitting at once,
Playwright) and written in docs as the manual check.

### 5.5 What the dashboard and the streak show (D22)

No code change beyond §2.6: «Ejercicios superados» and the streak read `UserActivity`/`UserStatDaily`, which
now grow once per distinct exercise. The recent activity names the exercise by its title. Verified in the
app (§9, phase 1).

### 5.6 Practice, review and contrarreloj (phases 4, 6, 7)

- **Práctica libre** (D18, D32): `/ejercicios/practica?tema=&nivel=` serves a random `PUBLISHED` library
  exercise matching the topic (or a child of it) and the level's Elo range, preferring ones without
  `firstSolvedAt` for the student, then any; «Siguiente» asks again. Context `PRACTICE`. Random pick: count,
  then `skip` a random offset (no raw SQL). With nothing to serve: «No hay ejercicios de ese tema en ese
  nivel todavía.»
- **Para repasar hoy** (D23): `UserExerciseState` with `isExerciseDue` (`nextReviewAt ≤ now`), joined to
  `solvableForReviewWhere` (still visible to the student by any path), oldest due first; `/ejercicios/repaso`
  serves them one at a time, context `REVIEW`, and ends with «Has repasado todo por hoy.» The home card's
  count and the session use the same `where` builder (`dueExerciseWhere`, the `dueReviewExerciseWhere`
  lesson), with a test that pins it to `isExerciseDue`.
- **Contrarreloj** (D21, D34, phase 7): `/ejercicios/contrarreloj` shows the best score (`max(score)` over
  the student's finished runs) and «Empezar». `startStormRun()` creates a `StormRun` with `endsAt = now + 3
  min` and a **deck** of 60 `PUBLISHED` library exercise ids of increasing difficulty
  (`buildStormDeck(candidates, { start: 800, step: 35, size: 60 }, rng)`, pure and tested: the i-th pick is
  the closest unused exercise to `start + i·step`, never repeating, never one the student attempted in the
  current study day (§2.7), and skipping ones they solved in the last 7 days when possible). The runner (`StormRunner`, shared, client) shows a 3:00 countdown bar, the score
  and three mistake slots; each exercise is solved with the same solver hook without hints or «Ver la
  solución»; a pass adds one and moves on immediately; a wrong move counts a mistake and moves on; the run ends
  at 0:00 or at the third mistake. Each exercise is submitted with context `STORM` and the `runId` (the server
  checks it belongs to the deck, the run is open and `now ≤ endsAt + 5 s`); `finishStormRun(runId)` then
  counts the run's attempts and writes `score`, `mistakes`, `finishedAt`, `endId` («Tiempo agotado», «Tres
  errores», «Abandonada» for a run never finished, closed when the next starts). A run's tally is separate from
  scoring: once the run checks pass, the STORM attempt row is always stored, even for an exercise that was
  attempted elsewhere after the deck was built (another tab, a series), so the stored score is what the runner
  showed; only the state, review and activity effects wait for the day gate (§5.4), so the fail→pass path stays
  closed. The end screen: score, «¡Nueva mejor marca!», and the failed exercises to open. A storm pass counts
  once toward D22 like any other when the day gate allows it; it does not move the review (§2.7). Hidden while the library has fewer than `STORM_MIN_LIBRARY_SIZE`
  published exercises (60, in `constants/platform/exercise.const.ts`, the one place to change it).

---

## 6. Teacher views, sharing, visibility

### 6.1 Attempts and mistakes (D24, phase 1b)

- Student tab: `/profesor/alumnos/[studentId]/ejercicios` (a link from `AssignedStudentDetail`), gated by
  `requireTeacher()` + an **active** `TeacherStudent` (the same criterion as the student's studies), else
  `notFound()`. A table (`PlatformTable`) of the student's exercise attempts **that this teacher may see**,
  newest first, 25 per page. D08 and the class rule («el profesor sólo ve sus clases asignadas») bound it:
  a student's history can hold a former teacher's series or a class given by another teacher, whose
  exercises and solution moves are not this teacher's to see. So the query is
  `teacherVisibleAttemptsWhere(teacherId, studentId)` (`exercise-visibility-rules.ts`, §6.3). It never
  depends on the exercise's **current** status, so archiving an exercise (or taking one out of the library)
  never hides its history, which is why exercises are archived and not deleted. An attempt is visible when:
  - its context is the teacher's own — a series whose `teacherId` is theirs, or a class block whose class's
    `teacherId` is theirs — whatever the exercise (they put it there when they could pick it); or
  - its context is neutral (`PRACTICE`, `REVIEW`, `LESSON`, `STORM`) and the exercise is theirs by ownership
    or common to all: `teacherId` = theirs (any status), or ever in the library (`lessonId` null and
    `publishedAt` not null: `publishedAt` is kept when it leaves, §2.2), or a lesson exercise (`lessonId`
    set: course content every student sees).
  A former teacher's series, another teacher's class and another teacher's never-published exercise stay out
  (D08). Columns: date, exercise (title, link to the teacher's own exercise when it is
  theirs), where («Serie: Táctica 1», «Clase del 14 oct», «Práctica libre», «Repaso», «Lección: …»), the
  result tag — the same words the student sees (§5.3): «Resuelto», «Resuelto con pista», «Fallado», «Vio la
  solución» —, time, and for a failure the mistake: «Jugó Cxe5 en vez de Dxh7+», with a
  `StaticDiagram` of `mistake.fen` and two arrows (played `tone: "danger"`, expected `tone: "success"`).
  The detail is a disclosure: a button in the row («Ver el error», `aria-expanded`, `aria-controls`) opens the
  next `<tr>` (one cell spanning the columns) with the diagram (`ExerciseAttemptRow`, shared, with a story
  expanded). Filters (`tone="accent"`): series, result. Above, over the same visible
  attempts: «Ejercicios superados: 23» (the metric's name, D22: distinct solve keys with `firstSolvedAt`),
  «Intentos: 41», «Esta semana: 6».
- `StaticDiagram` (`components/chess/static-diagram.comp.tsx`, shared with the site's blog through
  `chess-diagram-block`) gains a data prop `arrows?: { from: string; to: string; tone: "danger" | "success"
  }[]`, drawn as an SVG overlay with `--platform-danger` and `--platform-success-ink`. Only the platform
  passes arrows (the site has no green token and its blog block never sets the prop), so the arrow rules sit
  under the platform context and the site's stylesheet path is unchanged; a story state and its row in the
  `chess/StaticDiagram` docs page come with it (commit 9).
- Series tab of the series editor: a matrix students × items (`SeriesProgressTable`, shared). Each cell
  carries an icon and a text for screen readers, never a bare glyph: `CircleCheckIcon` in the success ink,
  «Resuelto» (here, with or without a hint); `CircleXmarkIcon` in `--platform-danger` with the count,
  «Fallado, 2 intentos»; nothing drawn and «Sin intentar» for the reader. A cell opens a popup with that
  student's attempts at that item and their mistakes. Only students with an active assignment and a share.
- Service: `services/teacher-exercises/teacher-exercises.service.ts` (`getStudentExerciseAttempts`,
  `getSeriesProgress`), reading `trainingAttempt` with `include: { exercise, series, mistakeDetails, context,
  result }` (one query per page, `relationJoins`).

### 6.2 Series and sharing (D18, D31, phase 1)

- «Nueva serie» (bank, secondary button; popup `PlatformPopup` with title and description, `useActionState`) → the series
  editor `/profesor/ejercicios/series/[seriesId]`: title and description (form), the items (sortable with the
  shared `sortable-dnd`; reorder through `planFullReorder`), «Agregar ejercicios» (the page's accent; a `PlatformPopup` with a
  search field and `PlatformCheckCards` of the teacher's `READY`/`IN_REVIEW`/`PUBLISHED` exercises and, from
  phase 4, the library's `PUBLISHED` ones; `DRAFT` and `ARCHIVED` are not offered; the items are inserted
  at `nextOrder` and a P2002 on `ExerciseSeriesItem_pkey` or `ExerciseSeriesItem_seriesId_order_key`, caught
  only with `isUniqueConstraintError(error, "<index>", "<column>")`, answers the popup's formError
  `seriesChanged`, «La serie cambió mientras tanto: vuelve a intentarlo.»), «Quitar» per item
  (`.platform-row-action`), «Eliminar la serie» (`PlatformConfirmPopup`; exercises stay, attempts keep their
  history with `seriesId` set to null).
- «Dar a mis alumnos» (D31): the panel of `share-collection.comp.tsx`, lifted to
  `components/platform/shared/student-share-panel/` (data props: students, shared ids, the two actions) and
  used by both the collection and the series, so the two look and behave alike. `shareSeriesWithStudent` /
  `unshareSeriesWithStudent` check, against the database: an active teacher; the series is theirs; the student
  has an active assignment with them — the three conditions `shareStudyWithStudent` checks. D07 says a
  teacher's exercises reach «their assigned students», so a share **reaches the student only while the
  assignment is active**: the row survives a reassignment (the history keeps its `seriesId`, and the series
  comes back if the student is assigned to that teacher again), but the series branch of §6.3 requires an
  active `TeacherStudent` between the student and the series' teacher, so a former teacher's series and its
  `READY` exercises disappear from the student's section, review included. This is unlike a collection,
  whose share outlives a reassignment today.
- The series editor warns when an item is no longer seen by students («Archivado: tus alumnos ya no lo ven.»).
- Actions in `services/teacher-exercises/teacher-exercises.actions.ts`, beside the exercise actions (one
  `.actions.ts` per domain, as every service folder has; the series are part of the teacher's exercises
  domain); rate limits `${teacherId}:share-series` 60/min, `series-edit` 120/min.

### 6.3 Visibility: one where-builder

`services/shared/exercise-visibility-rules.ts` (pure, only Prisma types; the `game-visibility-rules.ts`
pattern) and `exercise-visibility.ts` (resolves the viewer per request with `cache`):

```ts
export const USABLE_STATUS_CODES = ["READY", "IN_REVIEW", "PUBLISHED"] as const;
/** What a student may solve, by any path: the library, a series given to them, a class block they may see, a published lesson. */
export function buildSolvableExercisesWhere(viewer: { userId: string }, now: Date): Prisma.ExerciseWhereInput;
/** The same, narrowed to the path the attempt claims (the context of §5.4). */
export function solvableInContextWhere(context: AttemptContextInput, userId: string, now: Date): Prisma.ExerciseWhereInput;
/** What an author may pick for a series or a class block (D08): their own usable ones + the library. */
export function buildPickableExercisesWhere(author: { teacherId: string | null }): Prisma.ExerciseWhereInput;
/** What a teacher lists in «Mis ejercicios»: their own, every status. */
export function buildOwnExercisesWhere(teacherId: string): Prisma.ExerciseWhereInput;
/** The attempts of a student that a teacher may see (§6.1): their own context (any exercise), or a neutral one at an
 *  exercise that is theirs (any status), ever in the library, or a lesson's. Never by current status. */
export function teacherVisibleAttemptsWhere(teacherId: string, studentId: string): Prisma.TrainingAttemptWhereInput;
```

`buildSolvableExercisesWhere` is the `OR` of:

1. library: `teacherId: null, lessonId: null, status.code: PUBLISHED` (and a teacher's `PUBLISHED`
   exercise, which is in the library too: `lessonId: null, status.code: PUBLISHED`) — from phase 4 on;
2. series: `seriesItems.some.series.OR[ { shares.some.userId, teacher: { an active TeacherStudent with userId
   (endedAt: null) } }, { teacherId: null, publishedAt: { not: null } } ]` — a teacher's series reaches the
   student only while that teacher is assigned to them (D07, §6.2) — **and** the exercise is still the
   container owner's to give: either the series owner's own (`teacherId` = the series' `teacherId` and
   `status.code in USABLE`) or in the library now (`lessonId: null`, `status.code: PUBLISHED`). Prisma cannot
   compare two columns, so the owner is a value: `exercise-visibility.ts` resolves per request the viewer's
   `activeTeacherId` (at most one, `teacher_student_one_active`), and the branch is two `OR` arms —
   `{ teacherId: activeTeacherId, status in USABLE, seriesItems.some.series: { teacherId: activeTeacherId,
   shares.some.userId } }` and `{ lessonId: null, status PUBLISHED, seriesItems.some.series: <the OR above> }`.
   So another teacher's exercise taken out of the library leaves this teacher's series at once (D07, D08);
3. class (phase 3): the same pair over `classBlockItems.some.block: studentVisibleClassBlockWhere(userId,
   now)`: for each teacher of a class the student holds a seat in (resolved per request, a handful), `{
   teacherId: t, status in USABLE, classBlockItems.some.block: { …visible, class: { teacherId: t } } }`, plus
   the library arm. `solvableInContextWhere` knows the container (one series, one block), so it uses its
   owner directly;
4. lesson (phase 2): `lessonId: { not: null }, status.code: PUBLISHED, lesson: publishedLessonWhere`.

`ARCHIVED` and `DRAFT` are never solvable by a student. `exercise-visibility-rules.test.ts` builds each
`where` with explicit ids and checks: a `DRAFT` in a shared series is out; a teacher's `READY` exercise is not
in the library; a share to another student does not reach this one; an `AFTER` class block counts only once
the class ended (the existing `studentVisibleClassBlockWhere` test covers the clock); a lesson exercise of a
draft course is out; the author's pickable list has no other teacher's exercise (D08); a series shared by a
teacher whose assignment with the student ended is out; another teacher's exercise taken out of the library
(PUBLISHED → READY) is out of this teacher's series and class block, and out of their picker; and
`teacherVisibleAttemptsWhere` leaves out an attempt at another teacher's exercise in that teacher's series,
and one in a class block of a class whose `teacherId` is another teacher's, while keeping the teacher's own
series, a library exercise in practice, a lesson exercise, an attempt at the teacher's own exercise after it
was **archived**, an attempt at an academy exercise after it left the library, and an attempt in the
teacher's own series at another teacher's exercise after it left the library.

The series editor's warning (§6.2) uses the same condition: an item that is neither the series owner's
usable exercise nor in the library now shows «Ya no está disponible: tus alumnos ya no lo ven.» (or
«Archivado: …» for their own archived one).

---

## 7. Courses and classes

### 7.1 Courses (D25–D28, phase 2)

- Staff lesson editor (`components/platform/sections/staff/courses/lesson-editor.section.tsx`): the panel
  «Ejercicios» lists the lesson's exercises (diagram, title, status, «2 jugadas»), with «Agregar ejercicio»
  (→ the editor at the lesson's route), «Agregar desde la biblioteca» (from phase 4: a popup with the library's
  `PUBLISHED` exercises; `copyLibraryExerciseToLesson` calls `createExerciseRecord` with the content whitelist
  of §2.3, `lessonId`, `lessonOrder = nextOrder` and `copiedFromId` — the copy starts `DRAFT` and the same
  transaction moves it DRAFT → PUBLISHED with the transition writer (§8's lesson row), D28), reorder
  (`planSwap`), and two actions that never share a verb: «Eliminar» (`PlatformConfirmPopup` with the verb
  «Eliminar», drawn only when the exercise has no attempts: it destroys the row) and «Archivar» (drawn
  instead when it has attempts: PUBLISHED/DRAFT → ARCHIVED, which takes its `lessonOrder` away and keeps the
  row and its history). Today's panel says «Eliminar»; `ui-verbs.test.ts` only rules out Añadir/Borrar, so
  the review is what keeps «Quitar» from meaning a deletion here. «Agregar ejercicio» and the copy insert at
  `nextOrder`; a P2002 on `Exercise_lessonId_lessonOrder_key`, caught with
  `isUniqueConstraintError(error, "Exercise_lessonId_lessonOrder_key", "lessonOrder")`, answers
  `fail(…, "orderTaken")` (the `ClassBlock_classId_order_key` precedent in `teacher-classes.actions.ts`). The
  old `ExerciseEditor`/`ExerciseMovePicker` (staff, over `TrainingExercise`) and
  `createExercise`/`updateExercise`/`deleteExercise`/`moveExercise`/`listExerciseModes` are removed, with
  their docs.
- **This panel is not behind `EXERCISES_ENABLED`.** The old panel is live today and not behind any flag, and
  once `…_lesson_exercises` has run the hand-made rows live only in `Exercise`, so the old panel would show
  an empty list: with the flag off the staff would lose lesson exercise management. So the new panel and the
  lesson exercise routes (§4.1, staff) render whatever the flag says; the flag still hides everything a
  student sees of it (the lesson card, `practica/[n]`) and «Agregar desde la biblioteca». The flag comment
  says so (§9). Because the data move cannot be undone by switching the flag, the phase 2 migration and this
  panel ship with a release **only after the owner has checked phase 2 locally**; until then the local
  database is the only one that runs it.
- Student lesson page: after the game, a card «Ahora practica: 3 ejercicios» with «2 de 3 resueltos»
  (by solve key: a lesson exercise counts as solved when any row of its family — itself, or for a copy its
  library original — has `UserExerciseState.firstSolvedAt`, §2.7) and «Empezar», which opens
  `/cursos/[courseRef]/[chapterOrder]/[lessonId]/practica/[n]` (`platformRoutes.lessonPractice`), context
  `LESSON`. «Completar lección» is unchanged: the exercises are optional (D26).
- Practice-only lesson (D25): a lesson without content (`!lessonHasContent`) and with `PUBLISHED` exercises
  shows the exercise list where the board would be. No new column: it is derived. The staff editor says so
  under the game picker («Sin partida: la lección será sólo de práctica.»). `courseHasContent` (the minimum to
  publish) counts such a lesson as content, in the same function, so the editor's «Publicado» and
  `publishCourse` agree.
- `deleteLesson` refuses when any of its exercises has attempts (`lessonHasAttempts`): `Restrict` would
  otherwise raise. `deleteChapter` (`staff-courses.actions.ts`, today it checks only `_count.progresses`) gets
  the same refusal: any lesson of the chapter with exercise attempts gives `deleteBlocked`, reusing
  `lessonHasAttempts` over the chapter's lessons. Lesson exercises are optional (D26), so attempts can exist
  without any `LessonProgress`, and the chapter's cascade would otherwise end in an unhandled P2003. (There
  is no course deletion to cover.)
- Seed: `SeedExercise` becomes `SeedLessonExercise { id, order, title, promptText, afterSans, lineSans,
  difficulty, topics }`; the seed derives the start FEN with `deriveExerciseData` as today, builds the PGN with
  `solutionPgnFromLine`, and upserts the `Exercise` by id spreading `exerciseSolutionColumns` (the seed's
  documented exception: rows by fixed id, derived columns from the same function). `planSeededOrders`
  (`prisma/seed-rules.ts`) learns `Exercise_lessonId_lessonOrder_key`. The seeded attempts point at
  `exerciseId`.

### 7.2 Classes (D29, D30, phase 3)

- Catalog: `ClassBlockKind` gains `EXERCISE` «Ejercicio» (migration and seed). `CLASS_BLOCK_KIND.EXERCISE`.
- Model (migration `…_class_exercise_blocks`):

  ```prisma
  /// The exercises of an EXERCISE block, in order. Written only by the teacher's block actions.
  model ClassBlockExercise {
    blockId    String
    exerciseId String
    order      Int
    block    ClassBlock @relation(fields: [blockId], references: [id], onDelete: Cascade)
    exercise Exercise   @relation(fields: [exerciseId], references: [id], onDelete: Restrict)
    @@id([blockId, exerciseId])
    @@unique([blockId, order])
    @@index([exerciseId])
  }
  ```

  `TrainingAttempt` gains `classBlockId String?` (FK `ClassBlock`, `SetNull`, index `(classBlockId,
  userId)`). An EXERCISE block uses none of the single references, so `class_block_single_ref` holds; the
  service rule «an EXERCISE block has 1–10 exercises and no text, video, game, lesson or position» joins the
  other kind↔field rules in `readBlockFields`.
- Teacher (`services/teacher-classes/teacher-classes.actions.ts`): `BLOCK_COMMON_SCHEMA.kind` accepts
  `EXERCISE`; `readBlockFields` reads `exerciseIds[]`, checks each with `buildPickableExercisesWhere` (their
  own usable ones and the library) and writes the items in the block's transaction; a P2002 on
  `ClassBlockExercise_pkey` (a repeated exercise) or `ClassBlockExercise_blockId_order_key` is caught with
  `isUniqueConstraintError` beside the existing `ClassBlock_classId_order_key` check and answers the popup's
  «changed meanwhile» formError. The block popup gains the
  kind «Ejercicio» with the same picker as the series. Visibility «Para preparar» / «Después de la clase»
  only (D29; D30: no date, the AFTER block is the task): `readBlockFields` refuses `TEACHER` for an EXERCISE
  block and the popup does not offer «Guion del profesor» for that kind.
- Student (`/clases/[classId]`): `ClassContentRenderer` renders an EXERCISE block as its list of exercises
  with the student's mark for **this block** and «Resolver», which opens
  `/clases/[classId]/ejercicios/[blockId]/[n]` (context `CLASS`, `classBlockId`). D29's «the student solves
  it there»: in the class, under its URL, back to it at the end.
- Teacher's class page: each exercise of the block shows «2 de 3 lo resolvieron» (participants with a PASSED
  attempt with that `classBlockId`, out of the seats not moved), and a popup with each student's result and
  mistake (`ExerciseAttemptRow`). The staff's class sheet shows the block and the same counts, read-only.
- `services/shared/class-roles.test.ts` gains the line (and the docs → Classes → «Who does what» row: «Ejercicio:
  the teacher adds it and sees who solved it; the student solves it; the staff sees it on the sheet»):

  ```ts
  // An exercise block is the teacher's content, like a game block: their side writes ClassBlockExercise and
  // reads attempts, and never reaches the staff's exercise services nor the library's review writer.
  const STAFF_ONLY = [ ...,
    "services/staff-exercises/",
  ];
  const REVIEW_TOKEN = /\breviewLibraryExercise\b/;
  it("never reviews the library", () => { /* no teacher-side file names REVIEW_TOKEN */ });
  ```

  and `TEACHER_SIDE` gains `services/teacher-exercises`. A sibling guard, `services/exercises/exercise-roles.test.ts`,
  says the student's side (`services/exercises`, `services/classes`, `components/platform/sections/exercises`,
  `components/platform/sections/classes`, `app/(platform)/ejercicios`, `app/(platform)/clases`) reaches neither
  `exercise-record.service.ts` nor `exercise-status.service.ts` nor `services/teacher-exercises/` nor
  `services/staff-exercises/`: a student writes attempts, never exercises.

---

## 8. Library review (D07, D16, D32, phase 4)

- Teacher: on a `READY` exercise, «Proponer a la biblioteca» (`transitionOwnExercise(→ IN_REVIEW)`, stamps
  `submittedAt`; needs `exerciseReadiness` plus an explanation, because a library exercise is solved by
  students who have no teacher to ask); while `IN_REVIEW` the content is locked and «Retirar la propuesta»
  returns it to `READY`. The bank's status tags: «Borrador», «Listo», «En revisión», «En la biblioteca»,
  «Archivado», and a returned one shows the staff's note («Devuelto: …»).
- Staff, `/administracion/ejercicios?vista=revision` («En revisión (3)»): oldest first, with author, topics,
  difficulty. Opening one shows the editor (staff may edit before approving) with a review bar: «Probar», 
  «Aprobar» (`reviewLibraryExercise(→ PUBLISHED)`, stamps `reviewedAt/By`, `publishedAt`) and «Devolver»
  (a `PlatformPopup` with the note, required; → `READY`, `reviewNote`). A teacher's exercise stays the teacher's
  after approval (D07: «is the teacher's»); its content is then edited only by the staff, and the teacher can
  «Duplicar» it. This narrows D07, so it is the **default**, offered to the owner before phase 4 with the
  alternative (the teacher edits it, and saving sends it back to `IN_REVIEW`, out of the library until the
  staff approves again; §10, option B). Either way only the transitions table and `contentLocked` change.
- Staff library (`?vista=biblioteca`): every `PUBLISHED` exercise, filters by topic, level, author; the staff's
  own academy exercises (`teacherId` null) are written with the same editor and go `DRAFT → PUBLISHED`
  («Publicar», no review: the staff is the reviewer). «Quitar de la biblioteca» (`PlatformConfirmPopup`, verb
  «Quitar», note): a teacher's goes back to `READY` (still theirs, still in their students' series) and the
  teacher sees the note as for a returned one; the academy's goes to `ARCHIVED`. That the staff may do this
  without the teacher is part of option B in §10.
- Academy series (`?vista=series`): the same series editor without the share panel, plus «Publicar la serie»
  (`publishedAt`); only `PUBLISHED` exercises can be items, so a library series never shows a student something
  unreviewed (D32).
- Transitions (`services/shared/exercise-status-transitions.ts`, pure, with its table test like
  `class-status-transitions.test.ts`):

  | From → to | Who | Notes |
  | --- | --- | --- |
  | DRAFT → READY | owner teacher | needs readiness |
  | READY → IN_REVIEW | owner teacher | readiness + explanation; `submittedAt` |
  | IN_REVIEW → READY | owner teacher («Retirar») · staff («Devolver», note required) | |
  | IN_REVIEW → PUBLISHED | staff | `reviewedAt`, `reviewedById`, `publishedAt` |
  | PUBLISHED → READY | staff, teacher-owned («Quitar de la biblioteca», note) | `publishedAt` kept (§2.2) |
  | DRAFT → PUBLISHED | staff, academy-owned or lesson | needs readiness |
  | PUBLISHED → DRAFT | staff, lesson | |
  | PUBLISHED → ARCHIVED | staff, academy-owned or lesson | lesson: `lessonOrder` null; `publishedAt` kept |
  | DRAFT → ARCHIVED | staff, lesson («Archivar», §7.1) | `lessonOrder` null |
  | DRAFT/READY → ARCHIVED | owner teacher | |
  | ARCHIVED → READY | owner teacher | needs readiness |
  | ARCHIVED → DRAFT | staff, academy-owned | |

  `transitionOwnExercise` serves the owner's rows of the table and `reviewLibraryExercise` the staff's; both
  live in `exercise-status.service.ts`, the one writer of the column.

---

## 9. Phases

Shared rules for every phase:

- **Flag**: `EXERCISES_ENABLED = false as boolean` in `constants/platform/features.const.ts` (phase 1), with
  the comment the others carry (what it hides: `/ejercicios*`, `/profesor/ejercicios*`,
  `/administracion/ejercicios*`, the nav items, «Crear ejercicio desde aquí», the lesson card and practice
  pages, «Agregar desde la biblioteca», the EXERCISE block kind and its class routes; the actions answer
  `disabled`; and, said in the comment, what it does **not** hide: the staff lesson panel «Ejercicios» and its
  routes from phase 2, because they replace the live unflagged panel over data the phase 2 migration moves,
  §7.1). The owner switches it on locally to check. That file has someone else's uncommitted flips today (`PLAY_ENABLED`,
  `ADVENTURE_ENABLED`, `ANALYSIS_BOARD_ENABLED` set to `true`): the commit stages HEAD plus the new constant
  only (the «stage mine over foreign changes» method) and tests that staged tree.
- **Migration**: each phase that has one writes it by hand (§2.4), adds its block to
  `prisma/exercise-migration.test.ts`, and is applied with `npm run db:deploy` against the **local** database
  only with the owner's go (`npm run db:target` first), then `npm run db:generate`, `npm run typecheck` and the
  «No difference detected» check. Never `db:migrate`, `db push` or `migrate reset`. Production goes with the
  release (TODOS T49 style: backups, `db:deploy` there, push — all with his go), and a migration that moves
  data (phase 2's) is released only after the owner has checked its phase locally.
- **Components**: every new piece of `components/platform/shared/` and `components/chess/` lives in its folder
  with `<name>.stories.tsx` (one story per state, a JSDoc line each, `title` = `platform/shared/<Name>` or
  `chess/<Name>`), its tile in `components/platform/overview/overview.stories.tsx`, and its page in
  `docs/content/components/…` with the «Story» row after «Stylesheet» and the stylesheet's line count
  (`components/docs-line-counts.test.ts`). A story that shows a popup opens it in a `play`. No story imports a
  `.actions.ts`. Icons: the ones needed exist (`lightbulb`, `eye`, `stopwatch`, `puzzle-piece`, `eraser`,
  `trash-can`, `file-import`, `circle-check`, `circle-xmark`, the six `chess-*-piece`); none is added. No
  text glyph (✓ ✗ ·) stands in for an icon.
- **Before each commit**: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`,
  `npm run storybook:build`, `npm run test:storybook` in that order, and `cd docs && npm run build` when docs
  changed. One commit per logical change, no Claude attribution, nothing pushed.
- **App checks**: on the local dev server (started with the owner's go; the hook asks), signed in with the
  README demo accounts (`profesor.demo@…`, `alumno.demo@…` — assigned to him by the seed —, `staff.demo@…`,
  password `ajedrez365`), driven by Playwright, at 1440 and 390 px, light and dark, focus rings emulated where
  a step checks focus. Notes of what the checks leave in the local seed go in the phase's docs page.

### Phase 1 — the teacher creates, the student solves (D40)

Exactly D40's first delivery: the bank, the editor (piece editor, solution on the board, metadata), the
teacher's series given to their students, and the «Ejercicios» section to solve. Implements D01–D03, D06–D10
(teacher side), D13–D15, D17 (series part), D19–D22, D31, D33, D35, D37–D39, and the D23 schedule (no screen
yet). The attempt and its first mistake are recorded from here (`TrainingMistake`), so D24's views in phase 1b
show phase 1's attempts. The owner checks this phase before 1b starts.

Commits, in order (numbered as before; 6 and 9 are phase 1b):

- **1.** `feat(exercises): the bank's tables, catalogs and the attempt's second exercise` —
   `prisma/schema.prisma` (§2.2), `prisma/migrations/20261016120000_exercises/migration.sql` (§2.4),
   `constants/platform/exercise-codes.const.ts`, `training-codes.const.ts` (contexts), `shared-codes.const.ts`
   (topics), `prisma/seed-data.ts` (`CATALOG_VALUES.exerciseKind`, `exerciseStatus`, contexts, topics with
   parent), `prisma/seed.ts` (seed the catalogs; attempts on `trainingExerciseId`),
   `services/trainer/trainer.actions.ts` and `services/dashboard/dashboard.service.ts` (§2.6),
   `prisma/exercise-migration.test.ts`, docs → Data model (models, CHECKs, migration list).
- **2.** `feat(exercises): the solver, the solution format, the position setup and the exercise review ladder` —
   `lib/chess/exercise-format.ts`, `lib/chess/exercise-solver.ts`, `lib/chess/position-setup.ts`,
   `lib/training/review-schedule.ts` (+ tests of §3.4 and §4.3), docs → Chess → Library.
- **3.** `feat(exercises): the shared writers and the visibility rule` — `services/shared/exercise-record.service.ts`,
   `exercise-status.service.ts` + `exercise-status-transitions.ts`, `exercise-attempt.service.ts`
   (`recordExerciseAttempt`, `lockExerciseFamily`, `rebuildUserExerciseState`), `exercise-activity-topic.ts`,
   `exercise-visibility-rules.ts` + `exercise-visibility.ts`, `exercise-form.ts`, `exercise-level.ts`, their tests,
   `services/shared/exercise-writers.test.ts`; AGENTS.md gains the «Ejercicios» bullet (one table for every
   authored exercise; the five writers, and every insert through `createExerciseRecord`; the one where-builder; first-wrong-move decides; only the author's
   lines are accepted, «Mate en N» included; one scored attempt per exercise per study day; the flag).
- **4.** `feat(exercises): the piece-placement board` — `components/chess/piece-placement-board/` (+ story: empty,
   initial position, a puzzle, touch mode with a piece selected, keyboard focus on the palette; tile; docs page).
- **5.** `feat(exercises): the exercise editor and the teacher's bank` — `PlatformTabs` (+ stories, one with
   an error mark on a hidden tab), `PlatformCheckCards` `groups` prop (+ story state, Overview tile update,
   docs row), `MovePathPicker` lifted (the class block editor imports it from there; it gets its first story —
   playing, a path chosen — with a `fetchPgn` stub, its Overview tile, and its existing docs page moves from
   `…/teacher/classes/class-block-editor/move-path-picker.mdx` to the shared folder with the «Story» row and
   both `_meta.ts` entries), `ExerciseAuthoring` (`components/platform/shared/exercise-authoring/`, block
   `.exercise-authoring`, never `ExerciseEditor`, §4.2; + stories: new, editing a mate in 2, a refused save
   with errors on two tabs, locked), `ExerciseCard` (+ story), `ChessBoard` props `hintSquare` and
   `lastMoveTone` (+ story states); `app/(platform)/profesor/ejercicios/{page,nuevo/page,[exerciseId]/page}.tsx`;
   `components/platform/sections/teacher/exercises/` (bank section, editor section);
   `services/teacher-exercises/{service,mapper,types,actions}.ts`; `lib/platform-routes.ts`;
   `constants/platform/nav-items.const.ts` (+ `nav-items.test.ts`); `features.const.ts` (flag); the editor's
   `useActionState` exception in `docs/content/conventions.mdx` (the «only exceptions» paragraph),
   `docs/content/platform/teacher-and-staff.mdx` («the only `useActionState` forms are…») and AGENTS.md («las
   demás acciones redirigen…»).
- **7.** `feat(exercises): series and giving them to students` — `ExerciseSeries*` actions and pages
   (`/profesor/ejercicios/series/[seriesId]`; the actions in `teacher-exercises.actions.ts`), `StudentSharePanel`
   lifted from `share-collection.comp.tsx` (+ story, Overview tile, a new docs page with its Stylesheet line
   count and «Story» row; the collection uses it, and `share-collection.mdx`, `study-detail-section.mdx` and
   `game-view/study-aside.mdx` are updated to name it — or `share-collection.mdx` and its `_meta.ts` entry go
   if the collection's component is emptied), the «Agregar ejercicios» popup.
- **8.** `feat(exercises): «Ejercicios» for the student` — `PROTECTED_PATH_PREFIXES` + matcher (+ `proxy.test.ts`),
   `STUDENT_NAV_ITEMS`, `app/(platform)/ejercicios/{page,loading,series/[seriesId]/page,series/[seriesId]/[n]/page}.tsx`,
   `components/platform/sections/exercises/` (home, series), `ExerciseSolver` + `useExerciseSolver`
   (+ stories: playing, correct reply, wrong move, text hint, piece hint, solved clean, solved with hint,
   failed, solution shown, mate in 2, black to move, unscored retry, preview, and «Mate en 2» + «Fallado» at
   390 px with the two-line head), `services/exercises/*` with
   `submitExerciseAttempt` and `getStudentExerciseAccess` (the nav item's `"withTeacher"` rule, §5.1); `services/exercises/exercise-roles.test.ts`.
- **10.** `docs(exercises): the exercises' pages and routes` — new `docs/content/platform/exercises.mdx` (in
    `_meta.ts` after «Classes»: model, rules of §3.3, writers, visibility, flag, what phase 1 delivers),
    `student.mdx` («Ejercicios» section; the trainer section notes `trainingExerciseId`),
    `teacher-and-staff.mdx`, `architecture/routing.mdx`, `glossary.mdx` («Ejercicio», «Serie», «Pista», «Ver la
    solución», «Contrarreloj»), `operations/scripts-and-seed.mdx` (seeded exercises), README (routes list, the
    flag).

Seed (in commit 1 for catalogs, commit 8 for data): `IDS` for five teacher exercises of `profesor.demo`, all
`READY` and checked by a seed test that runs `analyzeSolution` on each (`prisma/seed-exercises.test.ts`): the
back-rank mate in 1, Philidor's smothered mate in 2 (`MATE_IN`, 2), the black mate in 1, the knight fork with a
variant, and one with two text hints and an explanation; one series «Táctica de la semana» with the five,
shared with `alumno.demo`; three attempts of his by fixed id (one clean, one failed at the first move with its
mistake, one with a hint), then `rebuildUserExerciseState(db, demoUser)`, and their two `EXERCISE_PASSED`
activities by fixed id before the existing `rebuildDailyStats`.

App checks (flag on locally). As `profesor.demo`: create exercise A with the piece editor (place, castling
off, black to move; each refusal message once), record a mate in 2 with a defence variant, check «Probar»,
save as draft, refuse «Guardar y marcar como listo» without a topic, then mark it ready; create exercise B,
a sequence, by pasting a FEN. Build a series «Prueba» of **four**, in this order: A, B, and the two seeded
exercises `alumno.demo` has never tried (the seed's attempts cover three of the five); give it to
`alumno.demo`. As `alumno.demo` at 390 px: «Ejercicios» in the menu, «Prueba» at «0 de 4»; item 1 clean,
item 2 failed at the first move and finished, item 3 solved with a hint, item 4 «Ver la solución». On
`/inicio`, «Ejercicios superados» is two more than before (items 1 and 3) and the streak shows today done;
reopening item 1 says «Ya lo intentaste hoy: este intento no cuenta.» and solving it changes nothing;
«Reintentar» on item 2 does the same. Item 4's «Ver la solución» (above) is pressed in two pages of it at the
same moment (Playwright, two tabs of the same session), and one attempt is stored. The solve screen is also checked on a phone in landscape
(844 × 390: the board stays solvable, the actions beside it) and at 768 px. Every seeded student has a teacher, so as `staff.demo` end
`valentina.demo`'s assignment from the panel (noted in the phase's docs page as left in the seed), then as
`valentina.demo`: no «Ejercicios» in the menu, and `/ejercicios` shows the no-teacher empty state. With the flag off: every route answers 404 and
no menu shows «Ejercicios». (The teacher's views of these attempts are checked in phase 1b.)

### Phase 1b — the teacher's shortcut and the teacher's view of attempts (D11, D24)

After the owner has checked phase 1. No migration. Commits:

- **6.** `feat(exercises): «Crear ejercicio desde aquí» in a teacher's study` — `GameViewer`, `MoveContextMenu`,
   `GameTools` (prop and item, stories), `GameViewSection`, `services/studies` mapper (`canCreateExercise`),
   the `nuevo` page reading `estudio`/`partida`/`jugada`; docs → Chess → Viewer and → Student → Studies.
- **9.** `feat(exercises): the teacher sees every attempt and its mistake` — `/profesor/alumnos/[studentId]/ejercicios`
   with `teacherVisibleAttemptsWhere` (§6.1, §6.3), the series progress tab, `ExerciseAttemptRow` (+ stories,
   one expanded) and `SeriesProgressTable` (+ stories, tiles), `StaticDiagram`'s `arrows` prop (+ story state,
   its row in the `chess/StaticDiagram` docs page), docs → Platform → Exercises and → Teacher & staff.

App checks: as `profesor.demo`, «Crear ejercicio desde aquí» on a move of a seeded study opens the editor on
«Solución» with what follows; the student's tab shows the four new attempts of phase 1 on top of the three
seeded ones (seven rows), tagged «Resuelto», «Fallado» (with «Jugó … en vez de …» and the diagram), «Resuelto
con pista» and «Vio la solución»; the matrix of «Prueba» shows, for `alumno.demo`, across items 1–4, the
check icon («Resuelto»), the cross with 1 («Fallado, 1 intento»), the check icon, the cross with 1 (each
cell's reader text checked once); last, «Archivar» on exercise B leaves its attempt in the student's tab, and «Táctica de la semana» shows the seeded marks. A student of another teacher is not
reachable (404).

### Phase 2 — courses (D04, D05, D25–D28)

Migration `…_lesson_exercises` (§2.5). Files: `schema.prisma` (`lessonId`, `lessonOrder`, the relation
rename on `Lesson` to `trainingExercises` and the new `lessonExercises`, `TrainingAttempt.isLegacy`); every
`lesson.exercises` reader of §2.6 (tsc finds them, since the name is no longer on `Lesson`); the staff lesson
editor (§7.1) with the editor mounted at the lesson routes; `services/staff-courses` (exercise actions
replaced; the `deleteLesson` and `deleteChapter` refusals over `lessonHasAttempts`; `courseHasContent`); `services/courses` (lesson view: exercises, practice-only); the lesson card and
`practica/[n]` page; seed (§7.1); docs → Teacher & staff → Courses, → Student → Courses, → Data model.
The staff lesson panel and its routes are not behind the flag (§7.1), and this phase's migration goes to
production only in a release made after the owner has checked the phase locally.
«Agregar desde la biblioteca» is written here but drawn from phase 4 (it needs a library). Commits: the
migration and its readers; the staff lesson editor; the student's lesson; docs. App checks: the four seeded
hand-made exercises open in the new editor with their lines; the Najdorf one solves as a sequence with
replies; a practice-only lesson in a draft course shows its list once published; «2 de 3 resueltos» moves;
`/entrenador` still answers 404; with the flag off the staff panel still lists and edits the lesson's
exercises and the student sees no card.

### Phase 3 — classes (D29, D30)

Migration `…_class_exercise_blocks` (§7.2). Files: `class-codes.const.ts`, seed (`classBlockKind` row, one
EXERCISE block «Para preparar» in a seeded class of `profesor.demo` with two of his exercises),
`services/teacher-classes` (schema, `readBlockFields`, picker read), the block popup and `ClassBlockList`
(+ stories), `ClassContentRenderer` (+ story state), `services/classes` (student view), the class exercise
route, the teacher's «2 de 3 lo resolvieron» and its popup, `class-roles.test.ts`, docs → Classes (block kind,
«Who does what»). App checks: the teacher adds the block, `alumno.demo` solves one from `/clases/[id]`, the
teacher's page says «1 de N lo resolvieron»; an AFTER block appears only after the class ends.

### Phase 4 — library and review (D07, D16, D18 practice, D32)

No migration (the review columns came in phase 1). Files: `services/staff-exercises/*`, the staff pages
(§8), `STAFF_NAV_ITEMS`, the teacher's «Proponer»/«Retirar» and the «Biblioteca» tab (D08), staff authoring in
the academy bank, academy series, «Agregar desde la biblioteca» in the lesson editor, the student's «Práctica
libre» and «Series de la academia» cards and `/ejercicios/practica`, `GameViewSection` for staff (D11 to the
academy bank). Seed: a handful of academy exercises `PUBLISHED`, one returned teacher exercise, one in review.
Tests: transitions table, the visibility test's library branch, the practice picker (pure part). App checks:
propose → return with a note → fix → propose → approve; the teacher cannot edit it after (or, with option
B of §10, editing sends it back to review); the student
practises «Táctica · Intermedio» and gets only library exercises.

### Phase 5 — PGN import (D12)

No migration. Files: `services/shared/exercise-import.ts` (+ test and fixture), the two import pages and their
actions, docs → Exercises → Import with the conventions and a sample file, and
`prisma/fixtures/exercise-library.pgn`: at least 60 checked library exercises spread from 800 to about 2900
(every `[Difficulty]`, `[Topics]` and `[Title]` header set, each passing `analyzeSolution`, pinned by a test
that reads the file), the library a local database needs for the contrarreloj. App checks: a 30-game file with
one case per report row; re-importing says «Ya está en tus ejercicios» for all; as `staff.demo`, importing
`exercise-library.pgn` with «Estado: En la biblioteca» puts all of it in the library. The import's two-step
`useActionState` is added to the exceptions in conventions.mdx, teacher-and-staff.mdx and AGENTS.md.

### Phase 6 — the student's history (D51; spaced review is OUT, replaces D23)

The owner dropped the review ladder on 2026-10-16 (D51). Phase 6 is now **«Historial»** in «Ejercicios»:
every scored attempt of the student, newest first, as rows (exercise title, where it came from — series,
course lesson, class, practice —, when, the outcome tag «Resuelto» / «Resuelto con pista» / «Fallado» /
«Vio la solución», and for a failure «Jugaste … en vez de …» with the diagram, reusing `ExerciseAttemptRow`'s
look for the student), with filters as `FilterPills`/`PlatformSelect` with `tone="accent"` (a filter is not a
form): result (all / resueltos / fallados), source (all / series / cursos / clases / práctica), and a month
picker or «Últimos 7 días / 30 días / todo»; 25 a page accumulating like the teacher's tab. A row links back
to where it can be retried when that place still exists. Migration `…_drop_review_ladder`: removes the
ladder's columns from `UserExerciseState` (`nextReviewAt`, `reviewStep` and whatever phase 1 added for the
ladder — see §2.7) and `applyExerciseReview`/`isExerciseDue` and their tests go; `recordExerciseAttempt`
and `rebuildUserExerciseState` stop computing them; docs lose the ladder. The route `/ejercicios/historial`
(already under `/ejercicios`). App checks: the rows match the student's day on «Prueba»; the filters narrow;
the diagram shows the mistake; nothing says a payment.

### Phase 7 — contrarreloj (D21, D34)

Migration `…_exercise_storm`:

```prisma
/// Why a run ended (STORM_END): TIME «Tiempo agotado», MISTAKES «Tres errores», ABANDONED «Abandonada».
model StormEnd { id Int @id @default(autoincrement()) code String @unique label String order Int @default(0) runs StormRun[] }

/// One contrarreloj run. The deck is fixed at the start; score, mistakes, finishedAt and endId are written
/// only by finishStormRun (services/shared/storm-run.service.ts), counted from the run's attempts.
/// CHECK storm_run_finished_has_end: (finishedAt IS NULL) = (endId IS NULL) AND (finishedAt IS NULL) = (score IS NULL).
model StormRun {
  id         String    @id @default(uuid())
  userId     String
  startedAt  DateTime  @default(now())
  endsAt     DateTime
  deck       String[]
  finishedAt DateTime?
  score      Int?
  mistakes   Int?
  endId      Int?
  user     User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  end      StormEnd?         @relation(fields: [endId], references: [id])
  attempts TrainingAttempt[]
  @@index([userId, score])
  @@index([userId, startedAt])
}
```

`TrainingAttempt.stormRunId String?` (FK `StormRun`, `SetNull`). Files: `buildStormDeck` (+ test),
`storm-run.service.ts` (+ test), `StormRunner` (+ stories: running, two mistakes, ended by time, new best),
the page, docs. App checks, after the phase 5 library fixture is imported and published (so the library
holds at least `STORM_MIN_LIBRARY_SIZE` exercises; the card is hidden before, which is checked first): a run
ends at the third mistake; another at 0:00; the best score shows the max; the deck climbs in difficulty; the
reduced-motion run has no moving bar.

Why this order: it is D40's. Two notes on dependencies: free practice (D18) needs the library (D32), so it
arrives with phase 4, not with phase 1's section; and import goes before the contrarreloj because a
contrarreloj needs a library of at least 60 exercises across the difficulty range, which import is how the
staff fills. Spaced review's schedule is computed from phase 1 because it is the same transaction and the
same tested function; only its screens wait for phase 6, so no backfill migration is ever needed.

---

## 10. Risks, open points and IMPROVEMENTS

### Risks

- **The solution reaches the browser.** The solver runs on the client, so a curious student can read the
  answer in the page's data (as on Lichess). The server re-plays every attempt (§3.3 rule 9), so a forged
  result needs the right moves, which a cheater has anyway. Accepted: there is no ranking at stake. Goes to
  `WARNINGS.md` with how to undo it (a per-move server check, one round trip per move).
- **Rename of `TrainingAttempt.exerciseId`.** The constraint and index names must be the real ones (§2.4) or
  `migrate diff` reports drift; checked before writing the SQL.
- **The phase 2 data move in SQL.** It re-implements `createPositionHash` and the line → PGN shape in SQL;
  the migration test pins both against the JS functions on the seed's FENs, and the app check opens every
  moved exercise. Production's hand-made exercises (if any) move the same way.
- **Topic list growth.** Nineteen tactical topics also show in the staff lesson editor's «Temas»; grouped by
  parent there too, with the `groups` prop `PlatformCheckCards` gains in commit 5 (§4.2; it has none today),
  or that editor becomes long.
- **Phase 1 size.** Eight commits after moving 6 and 9 to phase 1b; the editor (commit 5) is the biggest. If
  it slips, commits 1–4 and 8 can be checked first with seeded exercises.
- **`features.const.ts` has foreign uncommitted changes**: staged around (§9 shared rules).

### Interpretations this plan makes (none blocks the build; each is one place to change)

1. «Mate en N» follows D02 as written: only the author's lines are accepted, and «checked by chess rules»
   (D03) is the check that every line ends in mate within N (§3.3 rule 4). Accepting another mate is option A
   below, not built.
2. The level is derived from the difficulty, not chosen apart, so the two cannot contradict (D13 + D38).
3. A teacher's exercise approved into the library stays the teacher's, but its content is then the staff's
   to edit; the teacher duplicates it to change it, and the staff may take it out of the library with a note.
   This is the default; option B below is the alternative.
4. Series and class progress count attempts made **in that series or block**; «Ejercicios superados» and the
   lesson's «2 de 3» count any solve.
5. A contrarreloj pass counts once toward the streak (D22) but never moves the review.
6. A hinted first solve enters review at three days; a clean first solve never does (§2.7).
7. The attempt is decided and stored at the first wrong move; what the student plays afterwards is not stored.
8. An exercise is scored at most once per study day per student (§2.7): «Reintentar», a reload or the same
   exercise in another context that day runs unscored, and «the same exercise» includes a lesson copy and its
   library original (the solve key's family). So a class block's exercise the student already tried
   that day in a series shows unsolved in the block until a later day.
9. A lesson copy of a library exercise and its original are one exercise for D22 (§2.7, the solve key); a
   teacher's «Duplicar» makes a new one.
10. A teacher's series reaches a student only while that teacher is assigned to them (D07, §6.2); the share
    row survives a reassignment but shows nothing.
11. A teacher sees the attempts made in their own series and classes, and in a neutral context those at
    their own exercises (any status), at exercises that were ever in the library, or at lesson exercises
    (§6.1). Never by current status, so archiving hides no history.
12. A player variant the author marked as a mistake (?, ??, ?!) is refused, not accepted (§3.1): D02 makes
    every variant an accepted answer, so a refuted try copied from a study or a file must be dropped first.
13. «Mate en N» means the main line mates in exactly N, and for N ≤ 2 that the key move forces it against any
    defence (an exhaustive rules search, D03); for N ≥ 3 the author's lines are trusted.
14. A STORM attempt is always stored for the run's score, but on a day the exercise was already attempted it
    scores nothing else (§5.6).

### Options for the owner (none blocks phase 1)

- **A. Accept any mate in «Mate en N»** (before phase 1 is checked, or any time later): a legal move outside
  the tree that gives checkmate would also solve it. Default: no (D02). It is one branch in `playMove` and
  one test.
- **B. Editing an approved exercise** (before phase 4): default, the content is locked and the teacher
  duplicates; alternative, the teacher edits and the save sends it back to `IN_REVIEW`, out of the library
  until approved again, and «Quitar de la biblioteca» needs no separate staff power. Only the transitions
  table and `contentLocked` change.

### To `IMPROVEMENTS.md` (local)

- Exercises, automatic rating (D14 «later»): an Elo per exercise from its attempts; the author's number as
  the prior. Priority medium, after phase 7.
- Exercises, the dormant trainer writes `EXERCISE_PASSED` on every pass: give it its own activity type before
  `MOVE_TRAINER_ENABLED` is switched on (D22, D36). Priority high when the trainer returns.
- Exercises, mistake analytics: `TrainingMistake.positionHash` groups the same wrong move across students; a
  teacher view «el error más común». Priority low.
- Exercises, chapter exam (D27): `CHAPTER_QUIZ` and `quizPassedAt` stay unused; if wanted, a series per chapter
  with a pass mark. Priority low.
- Exercises, teacher dashboard card («Esta semana tus alumnos resolvieron 34 ejercicios») and a notice to the
  student when a series is given. Priority low.
- Exercises, `npm run exercises:rebuild-state` (`rebuildUserExerciseState` for every user), the drift fixer
  like `stats:rebuild`. Priority low.
- Exercises, export a series as PGN (the import's conventions, reversed). Priority low.

---

## Review log (2026-10-16)

Two rounds. Round 1: fifteen findings (1–15), each checked against the code and DECISIONES.md; all fifteen
held and were applied, none was rejected; finding 13 was applied as a default plus an option for the owner.
Round 2: thirty-four findings (16–49), conventions and chess-model lenses; all held in substance and were
applied, none was rejected outright. Two duplicates were merged (37 into 20; 49 into 16, with part of 49's
fix replaced), and two were applied with a correction noted on their line (36, 39).

1. «Mate en N» accepts any mate (§3.3, §2.2, §10): **applied**. D02 says «NOT any mate counts», so only the
   tree is accepted; `byRule` is gone; accepting another mate is option A for the owner.
2. «Reintentar» scores right after a failure (§5.3, §5.4, §2.7): **applied**. It would undo D19/D20, skip
   D23's one-day return and flip D24/D29 marks. Now there is one scored attempt per exercise per study day,
   retries run `mode="unscored"`, and the tests and checks say so.
3. The student tab shows other teachers' exercises (§6.1): **applied**. A class's `teacherId` can differ
   from the assigned teacher (`Class.teacherId`), and `teacher_student_one_active` makes reassignment
   normal. `teacherVisibleAttemptsWhere` bounds the tab, and its test cases were added.
4. Phase 2 removes an unflagged live panel (§7.1, §9): **applied**. `lesson-editor.section.tsx` mounts
   `ExerciseEditor` without a flag. The new panel renders whatever the flag says, the flag comment names the
   exception, and the data-moving migration is released only after the owner's local check.
5. Phase 7 cannot be checked without 60 library exercises: **applied**. Phase 5 now adds
   `prisma/fixtures/exercise-library.pgn` (≥60, 800–2900), staff import it as published, and the threshold
   is the constant `STORM_MIN_LIBRARY_SIZE`.
6. The palette says «Borrar»: **applied**. `ui-verbs.test.ts` rules it out, so it is now «Quitar» with
   `aria-label` «Quitar pieza».
7. Feminine status labels: **applied**. «ejercicio» is masculine, so the labels are now «Listo»,
   «Archivado» and «Guardar y marcar como listo», in the catalog, buttons, tags, import and checks.
8. The phase 1 check script contradicts itself: **applied**. The series now has four items with named
   outcomes, «Ejercicios superados» goes up by two with the streak marked today, and the counts include the
   seeded attempts and give the exact matrix cells.
9. Different words for the same outcome: **applied**. The teacher's tags now use the student's words
   («Resuelto», «Resuelto con pista», «Fallado», «Vio la solución») and «Ejercicios superados» stays only as
   the metric. The import says «Ya está en tus ejercicios».
10. «Guion del profesor» on EXERCISE blocks: **applied**. D29 names only «Para preparar» and «Después de la
    clase», so `readBlockFields` refuses `TEACHER` for that kind.
11. A lesson copy counts twice: **applied**. D22 says «each exercise once», so the activity is keyed on the
    solve key (`copiedFromId` for a lesson copy). A teacher's «Duplicar» stays a new exercise.
12. A share outlives a reassignment: **applied**. D07 says «their assigned students», so the series branch
    of the visibility rule now requires an active assignment with the series' teacher.
13. A teacher cannot edit an approved exercise: **applied** as a default with an alternative. It is option B
    for the owner, due before phase 4, not phase 1.
14. A student without a teacher gets an empty «Ejercicios»: **applied**. Until phase 4 the menu item is drawn
    only with an active assignment or a visible series, and there is a no-teacher empty state. The check uses
    a student whose assignment staff ends, because every seeded student has a teacher.
15. Phase 1 goes beyond D40: **applied**. Commits 6 (D11) and 9 (D24) move to a phase 1b with their own
    check, and the owner checks D40's core first.

Round 2:

16. Inserts skip the writers, and `statusId`'s writer contradicts itself (§2.1–2.3, §4.2, §4.5, §7.1):
    **applied**. Every insert (create, «Duplicar», lesson copy, import) goes through `createExerciseRecord`,
    which spreads `exerciseSolutionColumns` and `initialExerciseStatusData()` (the `initialClassStatusData`
    pattern, `class-schedule.service.ts:131`); any other status is reached with the transition writer in the
    same transaction; «INSERT … SELECT» is gone; the guard reads spreads as its precedent does.
17. Archiving hides a teacher's attempts (§6.1, §6.3): **applied**. `teacherVisibleAttemptsWhere` no longer
    uses the pickable (status-based) set: own context, or a neutral one at an own (any status), ever-library or
    lesson exercise; `publishedAt` is kept when an exercise leaves the library; tests added.
18. `deleteChapter` cascades into a P2003 (§7.1): **applied**. Verified: `staff-courses.actions.ts:911-933`
    checks only progresses; it now refuses with `deleteBlocked` through `lessonHasAttempts`.
19. P2002 never handled (§6.2, §7.1, §7.2, §5.4): **applied**. Each order-unique insert names its index and
    answer through `isUniqueConstraintError` (precedent `teacher-classes.actions.ts:304`); the state row is
    created with `ON CONFLICT DO NOTHING`, so it cannot raise one.
20. The study-day gate is read-then-write (§2.7, §5.4): **applied**. `lockExerciseFamily` takes a row lock
    first (the `lockClasses` pattern); the gate and the review read after it.
21. Reusing `exercises` on `Lesson` hides missed readers (§2.5, §2.6): **applied**. Verified the three readers;
    the new relation is `lessonExercises`, so a missed reader fails tsc.
22. `kindId`/`mateIn` outside the solution writer (§2.2, §2.3): **applied**. They are inputs of the MATE_IN
    check, so `exerciseSolutionColumns` returns them and the guard restricts them.
23. A second `.actions.ts` in one domain (§6.2): **applied**. Verified no service folder has two; the series
    actions go in `teacher-exercises.actions.ts`.
24. A DAL call in a pure mapper, Prisma in a page (§4.4): **applied**. Verified `studies.mapper.ts` imports no
    DAL; `studies.service.ts` resolves `canCreateExercise` and the prefill is a service function.
25. `useActionState` exceptions not documented where they are listed (§4.2, §4.5): **applied**. Verified
    conventions.mdx:65 and teacher-and-staff.mdx:92 list them exhaustively; commit 5 and phase 5 update both
    and AGENTS.md.
26. Tabs and one save form do not fit (§4.2): **applied**. Verified `PlatformForm` relies on the browser's
    blocking and `position-input` is its own form; the editor keeps lifted controlled state, the save form sits
    outside the tabs, errors map to their tab, and no form is nested.
27. `ExerciseEditor` / `.exercise-editor` collide with the live staff panel (§4.2, §9): **applied**. Verified
    the old block and export; the new piece is `ExerciseAuthoring` / `.exercise-authoring`.
28. «Quitar» deletes (§7.1): **applied**. AGENTS.md's verb table; the panel draws «Eliminar» without attempts
    and «Archivar» with them, never one verb for both; a lesson DRAFT → ARCHIVED row joins the transitions.
29. `PlatformCheckCards` has no groups (§4.2, §10): **applied**. Verified its props; commit 5 adds a `groups`
    prop with a story state, tile and docs row.
30. `StaticDiagram` has no arrows, the row no disclosure (§6.1, commit 9): **applied**. A data prop `arrows`
    with platform tokens (only the platform passes it; the site has no green token, so no site fallback), a
    story state and docs row; the row is a button with `aria-expanded` over a following `<tr>`.
31. Solve-screen breakpoints off-scale and landscape unusable (§5.3): **applied**. Written desktop-first with
    `width < 1024px`, a 280 px board floor, a landscape arrangement, a two-line head below 640 px, a 390 px
    story and landscape/768 px app checks.
32. Placement board ignores reduced motion; palette has no semantics (§4.3): **applied**. Verified
    `chess-board.comp.tsx:173`; the instance reads the same `matchMedia`, and the palette is a single-select
    `ToggleGroup` in the selection blue with accessible names.
33. ✓ ✗ · glyphs (§5.2, §6.1): **applied**. `CircleCheckIcon`/`CircleXmarkIcon` exist; cells carry reader text.
34. Which button is the accent (§4.2, §5.1, §6.2): **applied**. Each screen names its one accent; the others
    are secondary, row actions or `_size_sm` tools.
35. Copy slips (§4.2, §4.5, phase 5): **applied**. «editarlo», and the import says «En la biblioteca», the
    status tag's words.
36. Lifted components lack stories and docs (commits 5, 7): **applied with a correction**. `MovePathPicker`
    already has a docs page (`…/class-block-editor/move-path-picker.mdx`), so it is moved and gains its
    «Story» row rather than written anew; it has no story, which commit 5 adds with its tile.
    `StudentSharePanel` gets a page, a tile and the three ShareCollection pages updated.
37. Concurrent submits pass the gate (§2.7, §5.4): **applied**, merged with 20. The fake-client test cannot
    lock, so a two-tab submit joins the phase 1 app check and docs name the locking statement.
38. Refuted variants become accepted answers (§3.1, §3.3, §4.4, §4.5): **applied**. D02 stays; a player
    variant marked $2/$4/$6 is refused (`mistakeVariant`), accepted alternatives are listed, short ones warned,
    and the editor and import offer to drop marked variants (interpretation 12).
39. A foreign exercise still reaches students after leaving the library (§6.3, §8): **applied with a
    correction**. Prisma cannot compare two columns, so branches 2–3 compare the exercise's owner with the
    container's owner as a value resolved per request (the active teacher; the student's class teachers);
    the series warning and the tests use the same rule.
40. Drafts have nothing to freeze (§2.2, §3.1, §4.2): **applied**. `readSolutionStart` gives deterministic
    frozen columns for any readable PGN; `analyzeSolution` is only the readiness gate.
41. `parsePgnTree` hides a bad `[FEN]` and honours `[Variant]` (§3.1): **applied**. Verified its
    `Chess.default()` fallback and `isOpenablePgn`'s regex; `badPosition`, `unsupportedVariant`, the header
    rewritten to the normalized FEN, and `readPositionInput` shares the check.
42. `validateSetup` misses impossible checks and material (§4.3): **applied**. Verified
    `isImpossibleCheck` is separate from `validate()` and the two-knights FEN passes `fromSetup`; both are
    refusals, shared with `readSolutionStart`.
43. «Mate en N» can pass mislabelled exercises (§3.3): **applied**. The mating move must be the player's,
    `mateLengthMismatch`, and for N ≤ 2 an exhaustive rules search (`notForced`; no engine, D03); N ≥ 3
    trusted (interpretation 13).
44. The castling test would fail (§3.3, §3.4): **applied**. Verified `parseSan(pos, "Kg1")` is undefined and
    the board sends `O-O`; the test and rule 1 say so, and stored SANs are `makeSan`.
45. The solve key covers the activity only (§2.7, §7.1): **applied**. The day gate and the lesson's
    «resueltos» run over the family; the old «could both count» note is gone because the family lock
    serialises it.
46. The backfill and the rebuild disagree (§2.5, §2.3): **applied**. Moved attempts carry `isLegacy`, folded
    as the migration did; a test pins rebuild = migration.
47. The contrarreloj score can drop attempts (§5.6): **applied**. A STORM attempt row is always stored for the
    run; state, review and activity still wait for the day gate (interpretation 14).
48. The activity topic is nondeterministic (§2.7): **applied**. `exerciseActivityTopic` picks the lowest-order
    root, ties by id, in one tested helper.
49. The writers table contradicts itself; copies write frozen columns and stamps (§2.3, §7.1): **applied**,
    merged with 16, with one change: the initial status is not chosen on insert (always `DRAFT` by the spread,
    then the transition writer), which keeps one writer of `statusId`; copies pass a content whitelist and
    never the review stamps.

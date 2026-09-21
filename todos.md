# Delegable TODOs

> **Status: the ten tasks of this batch (T1–T10) are done** (2026-08-30). They are left recorded
> below with what ended up changing, so they are not repeated. The improvements that are still open
> live in `IMPROVEMENTS.md`.
>
> **2026-08-31 — `PLAN-TEACHER-ADMIN.md` executed in full** (phases 1 to 7): teacher panel
> (`/teacher`) and administration panel (`/staff`). What was really verified, phase by phase, is in
> the next section; what was left pending was noted in `IMPROVEMENTS.md` (entries 23 to 27).

## Teacher and administration panels (2026-08-31)

Validated by running every check, not by reading the code:

- **P1 · Schema and data** — migration `add_teacher_staff_panels` applied over the populated
  database (additive); `npm run db:seed` twice with no changes; a second `INSERT` of an active
  assignment for the same student **fails in SQL** (P2002 of the partial index
  `teacher_student_one_active`); the previous CHECKs and the `NULLS NOT DISTINCT` index intact.
- **P2 · Authorisation** — the 15 panel routes redirect to the login without a cookie; with a
  session, the wrong role is ejected without a single piece of data being rendered (checked by
  searching for content markers in the HTML of the three demo accounts); the menu stacks the right
  group by role.
- **P3 · Teacher, read-only** — the study and the game of an **unassigned** student give "not
  found" by direct URL, without leaking their name; the `meetingUrl` is always seen by the teacher
  and by the student only from `meetingUrlVisibleFrom` (unit test of the mapper).
- **P4 · Classes and blocks** — reordering tested against PostgreSQL with 5 blocks: up, down, the
  ends, the full chain and deleting the third, always a dense order and **without a single P2002**;
  an unassigned student's game is rejected in the guard's `where`, and goes on being rejected after
  closing the assignment.
- **P5 · Staff** — reassigning keeps the previous row closed; reassigning to the same teacher
  creates no row; the duplicate email and the duplicate assignment give a friendly message (it took
  `services/shared/prisma-errors.ts`, see IMPROVEMENTS #23); resetting the password deletes
  every session of the account.
- **P6 · Courses** — `deriveExerciseData` extracted from `prisma/seed.ts` **by moving the code, not
  rewriting it**: after the refactor the re-seed produces derived data identical field by field
  (`path`, `startPly`, `endPly`, `startFen`, `line`); an exercise created by the staff **is not born
  stale**, is trainable, and is marked stale when the lesson's PGN is touched; a draft course gives
  "not found" in `/courses` by direct URL.
- **P7 · Cross-cutting** — permissions matrix walked cell by cell over HTTP with the three demo
  accounts; `npm run build` clean; zero Payload files touched.

**The only thing that could not be closed as the plan asked:** the direct POST of server actions
with the wrong role (IMPROVEMENTS #27) — Next 16 does not accept those requests from a synthetic
HTTP client. Instead it was audited that the 44 actions of `/teacher` and `/staff` open with their
`require*`.

Project rules for any new task added here (non-negotiable):

- **CSS**: strict Yandex-style BEM (`block__element`, modifier `_key_value`, boolean `_open`),
  kebab-case files, every CSS file nests ALL of its rules under its root selector with native
  nesting (`&`), media queries nested inside the block, desktop-first (`max-width`). NO Tailwind (it
  was removed from the project), NO CSS-in-JS. The colours use the tokens of
  `app/(frontend)/globals.css` (`--color-*`) and, in the platform, the `--platform-*` of
  `app/(platform)/platform.css`.
- **Files**: kebab-case with the suffixes `.comp.tsx`, `.section.tsx`, `.hook.ts`, `.const.ts`, etc.
  Named exports (default only in App Router files). No barrels: imports with the full `@/...` path.
- **Components**: Server Components by default; `"use client"` only on the leaf that owns state.
- **Data**: the UI never calls Prisma directly; always `services/<domain>/*.service.ts`.
- **Comments**: in English, like the rest of the code. The UI copy stays in Spanish.
- On finishing each task: `npx tsc --noEmit`, `npm run lint` and `npm test` must pass.

---

## Done

### T1 — CSS tokens instead of hex values · [CSS] ✅
110 substitutions in 34 files of `components/**` and `app/(frontend)/**`. Only the hex
values that matched a token exactly were substituted; the rest (`#b4a99d`, `#8a8175`, `#1c1611`,
`#5c5348`…) were left intact because there is no equivalent token.

### T2 — `app/sitemap.ts` and `app/robots.ts` · [SEO] ✅
Sitemap with `/`, `/blog`, `/nosotros`, `/reloj-de-ajedrez` and every `/blog/<slug>`; robots blocks
`/dashboard`, `/classes`, `/studies`, `/courses`, `/trainer`, `/admin` and `/api`. Base URL from
`NEXT_PUBLIC_SITE_URL` (added to `.env.example`).

### T3 — `enums/chess-pieces.enum.ts` → `as const` · [Architecture] ✅
Now `constants/chess-pieces.const.ts`; the hero's usages updated and the `enums/` folder deleted.

### T4 — `landingPage` class · [CSS] ✅
Renamed to `landing-page` in `app/(frontend)/landing-page.tsx`.

### T5 — `priority` → `preload` in `next/image` · [SEO / Next 16] ✅
Only occurrence: the hero's `<Image>`.

### T6 — Spanish SAN in the MoveTree · [Chess / UX] ✅
`sanToSpanish()` exported from `lib/chess/notation.ts` (it also translates the promotion piece,
`e8=Q` → `e8=D`, and respects castling) and used by `move-tree.comp.tsx`.

### T7 — Creating a study and importing a PGN · [Platform] ✅
`services/studies/studies.actions.ts` with `createStudy` and `importPgnGames`: it validates the kind
against the catalog, checks that the database is the student's before writing (it never touches
course databases), parses with `chessops/pgn` dumping headers into columns, and bounds the PGN size
and the number of games. Plain forms (server actions) in the listing and in the study detail.

### T8 — Vitest and the first tests · [Quality] ✅
`vitest.config.mts` + `npm test` / `npm run test:watch`. 33 tests in `lib/chess/pgn-tree.test.ts`,
`lib/chess/notation.test.ts` and `constants/platform/study-codes.test.ts`. One of them documents a
real gap in the parser (see entry 11b of `IMPROVEMENTS.md`).

### T9 — README · [Docs] ✅
A Spanish section with the requirements, the setup, the script table, the demo user, the route map
and the architecture.

### T10 — `loading.tsx` per section · [UX] ✅
One in each area of `app/(platform)/` reusing `LoadingPanel`.

---

## Pending mechanical tasks (2026-09-09)

They come from the audit noted in `IMPROVEMENTS.md` (entries 35–70). They are repetitive and
bounded changes; the project rules above still hold. On finishing each one, mark the
`IMPROVEMENTS.md` entry as resolved and run `npm run typecheck`, `npm run lint` and `npm test`.

### T11 — Format the repository with Prettier · [DX] (IMPROVEMENTS #39)
`npm run format` changes 135 files. Do it in a commit of its own, without any other modification,
and afterwards add `npm run format:check` as a step of `.github/workflows/ci.yml`.

### T12 — Submit button with a pending state in every form · [UX] (IMPROVEMENTS #53) ✅ 2026-09-21
`components/platform/shared/submit-button.comp.tsx` (`useFormStatus`, `pendingLabel` per verb) in the 55 submit buttons of the write forms; the two `useActionState` forms and the GET search forms keep their own button.

Original task:
Create `components/platform/shared/submit-button.comp.tsx` (`"use client"`, `useFormStatus`,
`disabled={pending}` and an alternate label, e.g. "Guardando…") from
`components/auth/sections/login/login-submit.comp.tsx`, and use it in the `<button type="submit">`
of every write form of `components/platform/sections/**` (about 40). The sections stay Server
Components; only the button changes.

### T13 — `GameTable` on `PlatformTable` · [Frontend / A11y] (IMPROVEMENTS #58)
`components/platform/sections/studies/study-detail/game-table.comp.tsx` renders the table with
`div`s; build the header and the rows with `PlatformTable`/`PlatformTableRow`/`PlatformTableCell`
(`components/platform/shared/platform-table.comp.tsx`) keeping the reordering handle `<button>` in the first
cell and its keyboard handling, and delete the duplicated grid in `game-table.comp.css`. Reference
of the same data with the good table: `teacher/students/student-study-view.section.tsx`.

### T14 — Loose hex values to tokens · [CSS] (IMPROVEMENTS #59) ✅ 2026-09-21
48 substitutions in 25 stylesheets; `#8a8175` only survives as the fallback of `var(--platform-text-muted, …)` in the board and as grey of the public site, where no token matches it.

Original task:
Substitute in `components/**` and `app/**`: `#b4a99d` → `var(--color-muted-on-dark)` (27 uses),
`#5c5348` → `var(--color-muted-on-light)` (19), `#b8611f` → `var(--color-primary-deep)` (8) and, in
the platform, `#8a8175` as text → `var(--platform-text-muted)`. Exact matches only; do not touch
`rgba(...)`.

### T15 — Unused exports · [Quality] (IMPROVEMENTS #45) ✅ 2026-09-21
Deleted `getStudentStudies`, `reindexGame`, `formatOptionalDate`, `isNumericId` (and its test), `STAFF_ERROR_PARAM`, `STAFF_ACCOUNT_MESSAGES`, `TEACHER_ERROR_PARAM`; `NUMERIC_ID_DIGITS`, `CLOCK_TIME_CONTROLS`, `STUDENT_KINDS`/`TEACHER_KINDS` and `getStaffContext` are module-private now.

Original task:
Delete `getStudentStudies` (`teacher-students.service.ts`), `reindexGame`
(`game-positions.service.ts`), `formatOptionalDate` (`teacher-students.mapper.ts`), `isNumericId`
and `NUMERIC_ID_DIGITS` (`lib/numeric-id.ts`, along with its test), `CLOCK_TIME_CONTROLS` as an
export (`use-chess-clock.hook.ts`), `STUDENT_KINDS`/`TEACHER_KINDS` as exports (`study-rules.ts`),
`STAFF_ERROR_PARAM`, `STAFF_ACCOUNT_MESSAGES` (`staff-messages.const.ts`) and `TEACHER_ERROR_PARAM`
(`teacher-messages.const.ts`); remove the `export` from `getStaffContext` (`roles.ts`). Check each
one with `grep -rw` before deleting.

### T16 — `noUncheckedIndexedAccess` · [DX] (IMPROVEMENTS #62)
Enable it in `tsconfig.json` and resolve the 172 errors (almost all `array[i]` possibly
`undefined`): `trainer-session.comp.tsx`, `move-tree.comp.tsx`, `lib/chess/notation.ts`,
`services/shared/reorder.ts` and several `lib/chess` suites. Without changing behaviour: where the
index is safe by construction, a check with a `throw` or a `?? defaultValue`.

### T17 — A stylesheet with *mobile-first* media queries · [CSS] ✅ 2026-09-21
`resources.section.css`: the head's grid is the block's value and `@media (max-width: 819px)` puts it back to `display: block`.

Original task:
`components/site/sections/home/resources/resources.section.css` uses `@media (min-width: …)` when
the convention is desktop-first (`max-width`). Invert it: the block's values become the desktop ones
and the `max-width` media query (with the same threshold minus 1 px) receives the mobile ones. Check
the home page visually at 375, 768 and 1280 px before and after; nothing should change. (The other
offender, `ui/section-heading.comp.css`, was deleted as dead code when `components/` was reorganised.)

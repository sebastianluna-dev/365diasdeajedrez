# Pending improvements

Backlog of the project's technical debt and improvements. Every entry carries an **area**, a
**priority** (low · medium · high · extreme) and a guide on how to approach it.

> Last review: 2026-09-09. Full audit of the project (auth and data, frontend and CSS, tests and
> tooling): entries 35 to 70 come in. What is still open is at the top; what is already resolved is
> left noted with what was done, so it is not reopened.

---

## HIGH priority

### 7. Schema validation in server actions — [Security]

_Mostly resolved:_ every write action resolves the user on the server through the DAL (which now
checks the session for real), bounds its inputs (name lengths, PGN size, cap on imported games,
`clamp` on `mistakes`/`durationMs`) and goes through `allowAction()` in `lib/rate-limit.ts`. The
login adds a double ceiling, per account and per origin.

**(a) Shared rate limit — RESOLVED (2026-09-04).** The counter lived in a process `Map`, so the
ceiling was per instance. It now lives in the `RateLimit` table (migration
`20260904150000_rate_limit`): one statement with `ON CONFLICT` that decides whether the window is
still alive or starts another, with the times from the application's clock and not the database's.
The database that already exists was chosen over a Redis so as not to add one more service that can
go down on its own. On a database failure it lets the request through, on purpose: without a
database there is no login to protect. Expired windows are swept from the app, one call in a hundred.

**What is missing:** declarative validation with zod at the entry of every action.

### 35. ~~`/lecciones` is left out of the protected routes, of the proxy and of `robots.txt`~~ — RESOLVED (2026-09-09)

`/lecciones` added to `PROTECTED_PATH_PREFIXES` and to the matcher in `proxy.ts`; `app/robots.ts`
now imports the constant instead of copying it. `proxy.test.ts` walks every prefix without a cookie
and checks that the matcher is exactly the constant plus the home page, so a new route added in only
one place breaks the test.

### 36. ~~The seed creates an administration account with a public password and no environment guard~~ — RESOLVED (2026-09-09)

`prisma/seed.ts` aborts if the database is not local (or `NODE_ENV=production`) and the demo
password is the repository's: a `PLATFORM_DEMO_PASSWORD` of your own has to be defined or, for a
remote test database, `ALLOW_DEMO_SEED=1` (documented in `.env.example`). Locally nothing changes.

### 37. A 57 MB versioned ZIP inflates the repository to 365 MB — [DX / Repository]

_Partially resolved (2026-09-09):_ `Academia de Ajedrez Landing.zip` removed from the tree and
`*.zip` added to `.gitignore`.

**What is left:** it is still in the history (commit `2e1af25`), so every clone drags the 57 MB
along. Recovering them requires rewriting the history (`git filter-repo --path "Academia de Ajedrez
Landing.zip" --invert-paths`) and cloning again: a separate decision, because it invalidates the
existing clones.

### 38. ~~`server-only` does not resolve in Vitest: services and actions cannot even be imported~~ — RESOLVED (2026-09-09)

`vitest.config.mts` aliases `server-only` to `lib/testing/server-only.stub.ts` (an empty module).
The real protection — that it does not end up in a Client Component — is still done by Next's
bundler. First test of the server layer: `services/shared/form-data.test.ts`.

### 39. ~~Nothing verifies the code before it reaches `main`: no CI, no `typecheck`, prettier undeclared~~ — RESOLVED (2026-09-21)

_Mostly resolved (2026-09-09):_ `.github/workflows/ci.yml` runs `npm ci`, `db:generate`, `lint`,
`typecheck` and `test` on Node 20 (without `next build`: static generation queries Payload). New
scripts: `typecheck`, `test:coverage`, `format` and `format:check`; `prettier` pinned in
`devDependencies` (3.9.6, the one Payload already brought as a transitive dependency).

**Resolved (2026-09-21):** the repository is formatted (one commit, no logic inside) and
`npm run format:check` runs in CI before the lint.

### 40. ~~The README describes English routes that no longer exist~~ — RESOLVED (2026-09-09)

Route map regenerated from `app/` and `lib/platform-routes.ts` (including `/entrar`,
`/lecciones/[lessonId]`, `/estudios/clases` and `/explorador`), access routes and demo account
routes corrected, `create-next-app` boilerplate deleted, and the command table completed
(`positions:index`, `collections:by-chapter`, `typecheck`, `test:coverage`, `format`).

### 41. ~~`(frontend)` and `(auth)` have neither `not-found.tsx` nor `error.tsx`~~ — RESOLVED (2026-09-09)

`app/(frontend)/not-found.tsx` (header, footer and `SiteMessage`, the new notice screen in
`components/site/sections/shell/site-message`) serves the `notFound()` calls of the blog and the
mentors; `app/global-not-found.tsx` with `experimental.globalNotFound` covers the URLs without a
route, which with three root layouts could not be composed from a `not-found.tsx`;
`app/(frontend)/error.tsx` and `app/global-error.tsx` complete the borders. All in Spanish and with
the site's palette.

### 42. ~~`/blog` sends the full content of every article to the browser and paginates without a URL~~ — RESOLVED (2026-09-09)

`getArticleSummaries()` excludes `content` in the query (`select: { content: false }`) and is cached
with `unstable_cache` and the `articles` tag, which the new `afterChange`/`afterDelete` hooks of
`collections/Articles.ts` expire. Category and page travel in the URL
(`/blog?categoria=…&pagina=…`, pure logic in `services/articles/article-listing.ts`, with tests),
`BlogArticles` is a Server Component again and filter and pagination are links. The page goes from
~74 KB to ~42 KB without a single Lexical node, and every view has its canonical.

### 43. ~~`/reloj-de-ajedrez` mounts two clocks at once and captures the space bar on `window`~~ — RESOLVED (2026-09-09)

`useChessClock({ enabled })` starts neither the interval nor the keyboard listener when it is off,
and `ChessClock` (`chess-clock.comp.tsx`) switches on only the variant matching the width with
`matchMedia` (both are still mounted so the server renders both and the CSS decides). The space bar
is no longer intercepted with the focus on a button or a link, nor on a repeated key.

---

## MEDIUM priority

### 1b. Password recovery and email verification — [Security / Product]

The login already exists (entry 1), but a student who forgets their password depends on the academy
changing it by hand with `npm run user:password`.

**How to approach it:** a mail service is needed, which the project does not have yet. Afterwards: a
table of single-use tokens with a short expiry (the same pattern as `Session`: store the SHA-256,
never the token), a `/recuperar` page, and always answering the same whether the account exists or
not, so as not to reveal who is enrolled. When the token is used, close every session of the user
(`destroyAllSessionsOf`, already written).

### 1c. Invalid session: redirect inside the stream, not a 307 — [Security / UX]

Entering without a cookie is cut by the proxy with a clean 307. But with a cookie **present and no
longer valid** (expired or revoked), the proxy lets it through and the redirect is thrown by the DAL
when the response has already started streaming: Next sends it inside the stream and the HTTP status
is 200. No data leaks — nothing of the student's gets rendered — and the browser redirects all the
same, but a client without JavaScript would see the empty shell. Verified that it does not depend on
the `loading.tsx` files.

**How to approach it:** either the session is validated in the proxy (which means querying the
database there, which is exactly what was meant to be avoided), or wait for `unauthorized()` +
`unauthorized.tsx`, experimental in Next 16 today.

### 11b. ~~A malformed SAN is discarded without warning~~ — RESOLVED (2026-09-04)

`lib/chess/movetext-scan.ts` scans the raw movetext — removing headers, brace and line comments,
NAGs, move numbers, parentheses and the result — and reports the tokens that do not fit the SAN
grammar. `parsePgnTree` adds them to `warnings`, so a "Qz9" no longer makes a branch disappear
silently. The bar was deliberately set high (`--`, `Z0` and the signs stuck to the SAN are
tolerated): a false positive in a good game is worse than staying quiet about a bad one.

### 14b. ~~The daily statistics bucket is UTC~~ — RESOLVED (2026-09-21)

`UserStatDaily.day` is now the study day (`statsDay` in `lib/date-ranges.ts`, `STUDY_DAY_TIMEZONE`,
the same day the streak already used) and `rangeStart` cuts the week, month and year on that same
day. The aggregate is derived, so the existing rows are recomputed with the new
`npm run stats:rebuild` (`services/shared/daily-stats.ts`, shared with the seed). **Pending in
production: run `npm run stats:rebuild` once after deploying.** A zone per student is still the
next step, when students get one.

---

### 23. The shape of the P2002 error depends on the driver — [Data / Security]

Prisma 7 with the PostgreSQL _driver adapter_ does **not** fill `meta.target` on uniqueness
violations: the real name of the index travels in
`meta.driverAdapterError.cause.constraint.index`. Any `catch` written against `meta.target` (the
usual pattern and the one that tends to be in the examples) does not recognise the conflict and lets
a 500 without a message escape. It was detected when testing the assignment race against the real
database.

**Status:** resolved where it mattered with `services/shared/prisma-errors.ts`
(`isUniqueConstraintError`, which looks at both routes and always against a specific name), used in
account creation, teacher creation, the student↔teacher assignment and the course and author slugs.
**What is left:** use that helper — and not a hand-written `catch` — in any P2002 `catch` added in
the future; it is worth reviewing if the adapter is ever changed.

### 24. ~~Exercise input by hand-written SAN~~ — RESOLVED (2026-09-04)

`exercise-move-picker.comp.tsx` mounts the `GameViewer` over the lesson's PGN inside the exercise's
form: the start and the end of the line are marked on the board and from there come `afterSans` and
`lineSans` (`sansAlongPath` in `lib/chess/pgn-tree.ts`, with tests). The text fields are still there
and can be typed or corrected by hand — the board fills them in, it does not replace them — so the
server action did not change. `afterSans` is still not preloaded when editing, but it is now rebuilt
in two clicks.

### 25. ~~The seed rewrites `frozenAt` and `pgnUpdatedAt` on every run~~ — RESOLVED (2026-09-04)

`prisma/seed.ts` hangs all of its dates from `seedReferenceDate()` instead of `new Date()`: the
current day at 18:00 UTC, or whatever `SEED_NOW` (ISO) says if a database is to be reproduced byte
for byte. Two passes on the same day write exactly the same, and the dates still follow the calendar
so the demo's "next class" is not born in the past. The time is not midnight because class times
come out of that instant.

### 44. ~~Open redirect: `returnTo` reaches `redirect()` raw~~ — RESOLVED (2026-09-09)

`safeReturnTo` now lives in `services/shared/safe-return-to.ts` (with tests) and is used by the
login and the two assignment actions (`assignStudent`, `endAssignment`); `withErrorParam` builds the
`?error=` respecting the existing query in the `fail()` calls of staff and teacher. The third action
with `returnTo`, `createTeacherPosition`, was orphaned and was deleted (entry 45).

### 45. ~~Exports without a single consumer, three of them server actions~~ — RESOLVED (2026-09-21)

_Partially resolved (2026-09-09):_ the three write actions without an interface deleted
(`updateGamePgn`, `refreezeExercise`, `createTeacherPosition`) along with the imports only they used.

**Resolved (2026-09-21):** the loose symbols are gone or module-private (T15 in `todos.md`).
`noUnusedLocals` (entry 62) prevents the within-file variant; cross-file dead exports still need an
occasional `grep -rw`, there is no tool wired for it.

### 46. ~~The trainer serves exercises from unpublished courses~~ — RESOLVED (2026-09-09)

`services/shared/published-content.ts` defines `publishedCourseWhere`/`publishedChapterWhere`/
`publishedLessonWhere`, chained into `getTrainerSession`, `recordTrainingAttempt`,
`toggleTrainerChapter` and into `getLessonContext` (which feeds `touchLesson` and `completeLesson`).
`getTrainerData` uses the same `where`, so there are no longer two versions of the rule.

### 47. ~~Import transactions of up to 500 games without a `timeout`~~ — RESOLVED (2026-09-09)

`PGN_IMPORT_TRANSACTION` (`content-limits.const.ts`: `maxWait` 5 s, `timeout` 120 s) accompanies the
three transactions that store and index imports (`importPgnGames`, `copyClassGamesToStudy`,
`importChapterGames`). Atomicity is kept; it is only given the time the 500-game cap needs.

### 48. The study page loads the PGN of every one of its games without paginating — [Data / Performance]

_Mostly resolved (2026-09-09):_ `studyDetailInclude.games` uses `select` with the ten fields the
mapper reads (never `pgn` nor `tags`), and `listCollectionGames` counts the moves with
`_count.positions` of the position index instead of reading and replaying the collection's PGN.

**What is left:** paginating the list by `searchParams` (and the game's aside) when a study goes
beyond a few dozen games; today they are all rendered, already without the weight of the PGN.

### 49. ~~The dashboard reads the full statistics history and the whole catalog~~ — RESOLVED (2026-09-09)

The statistics come from four `groupBy` with `_sum` (one per calendar range) in
`dashboard.service.ts`, and the mapper only puts a name and an order on them. "Continuar
estudiando" uses `getContinueStudyingCourse()` (`courses.service.ts`): it locates the progress in
course with a targeted query and loads only that course, instead of `getUserCourses()` with the
whole catalog.

### 50. Not a single log on the server: failures are swallowed silently — [Observability]

_Mostly resolved (2026-09-09):_ `lib/logger.ts` (one JSON line per event on `stderr`, without
"server-only" so it also serves the seed and the scripts) and `instrumentation.ts` with
`onRequestError`, through which every error Next catches while serving a request passes, with its
`digest`. They also log the `catch` in `allowAction` (a limit that disappears now says so), the
sweeps of `RateLimit` and `Session`, the replayer's `warnings` when indexing positions and an
unreadable password hash. The platform's error boundary shows the `digest` ("Código del error") so
it can be cross-referenced with the log.

**(b) Silent actions — RESOLVED (2026-09-21).** The student's actions now report what a person can
provoke: `updateDailyGoal`, `completeLesson`, `setOnlyPriorityLessons`, `toggleTrainerChapter`,
`createStudy`, `updateStudy`, `importPgnGames` and `createStudyGame` redirect with `?error=<code>`
(`throttled`, `invalid`, `goal`, `pgnEmpty`, `pgnTooLong`, `fen`) and the pages translate the code
with `STUDENT_ERROR_MESSAGES` into a `PlatformNotice`; the two actions that live on two pages carry a
`returnTo` field (checked by `safeReturnTo`). `recordTrainingAttempt` returns whether it stored the
attempt and the session summary counts the ones it did not; `searchPosition` returns `throttled: true`
and the explorer says so instead of showing zero games. What only a forged request produces (a foreign
study, an unpublished lesson) still comes out silently, on purpose.

### 51. ~~The Cloudinary upload signature bounds neither format nor size~~ — RESOLVED (2026-09-09)

`signPlatformUpload` also signs `allowed_formats` (`IMAGE_ALLOWED_FORMATS`, the same four formats as
the browser's `accept`) and `ImageUpload` forwards it as is: changing it invalidates the signature.
The weight cannot be signed — the upload API has no such parameter — so `IMAGE_MAX_BYTES` remains
the browser's and the real ceiling is that of the account's plan or preset; the comment in
`upload.const.ts` already says so.

### 52. Payload without `sharp`, uploads without a cap and a half-done preview — [CMS]

_Mostly resolved (2026-09-09):_ `sharp` installed and passed to `buildConfig`, so new uploads fill
`Media.width`/`height` (the existing ones stay null until re-uploaded; the teacher photo's fallback
remains for that reason). `upload.limits.fileSize` of 5 MB with `abortOnLimit`, the same ceiling as
the platform. `PREVIEW_SECRET` removed from `.env.example` and from the README: nothing read it.

**What is left:** deciding whether `Articles` drafts deserve an `admin.preview` with a preview
route; today they are only seen inside the admin form.

### 53. ~~Hardly any platform form says that it is being submitted~~ — RESOLVED (2026-09-21)

`components/platform/shared/submit-button.comp.tsx` (`useFormStatus`, disabled + `aria-busy` + a
`pendingLabel` per verb) replaces the 55 submit buttons of the write forms under
`components/platform/sections/**`; `.platform-button:disabled` gained its look in `platform.css`. The
GET search forms and the two `useActionState` forms (account creation, password reset) keep their own.

### 54. ~~`StaticDiagram` and the blog's diagram block are the same duplicated component~~ — RESOLVED (2026-09-09)

`ChessDiagramBlockRenderer` is a one-line adapter over `StaticDiagram`, which gains the
`context="article"` prop (a smaller caption and a grey that contrasts).
`chess-diagram-block.comp.css` deleted.

### 55. ~~`--platform-text-subtle` is used as text in 46 stylesheets and does not reach the minimum contrast~~ — RESOLVED (2026-09-09)

The token goes from `#9a9189` (3.1:1) to `#7a7168` (4.8:1 on white). The blog diagram's caption uses
the new `--color-muted-on-light` instead of `#8a8175`.

### 56. ~~No focus strategy: no global `:focus-visible`, `outline: none` in the notation and dialogs without focus~~ — RESOLVED (2026-09-21)

_Mostly resolved (2026-09-09):_ global `:focus-visible` in `globals.css` (orange on the dark
background) and recoloured in `platform.css` for the light one; out with the notation's
`outline: none`; the promotion picker carries `aria-modal`, takes focus on the first piece and
closes with Escape.

**Resolved (2026-09-21):** the viewer's options menu focuses its first option on open, walks them
with Up/Down and returns the focus to its button on Escape or on choosing an option (`closeOptions`
in `game-viewer.comp.tsx`).

### 57. ~~Mobile menu focusable while closed, dropdown without ARIA and no skip link~~ — RESOLVED (2026-09-09)

The closed mobile menu carries `visibility: hidden` (with the transition delayed so as not to cut
the fade). `HeaderDropdown` is now a Client Component with `aria-haspopup`, `aria-expanded`,
`aria-controls`, closing with Escape and with Tab on the way out; with the mouse it still opens
through CSS. The three layouts start with "Saltar al contenido" and each `<main>` carries
`id="contenido"`.

### 58. ~~`GameTable` reimplements a table with `div`s when `PlatformTable` exists~~ — RESOLVED (2026-09-21)

`PlatformTableRow` passes the `<tr>` attributes through, so `GameTable` keeps its drag-and-drop and
keyboard reordering on a semantic `<table>`; the duplicated grid is gone from `game-table.comp.css`.

### 59. ~~The board colours and several recurring hex values are not tokens~~ — RESOLVED (2026-09-21)

_Mostly resolved (2026-09-09):_ `--board-light`/`--board-dark` in `globals.css`, used by the board
and the diagram, with their twin in `constants/chess-board-colors.const.ts` for the canvas export.
New tokens `--color-muted-on-dark` (#b4a99d), `--color-muted-on-light` (#5c5348) and
`--color-primary-deep` (#b8611f); `globals.css` no longer repeats `#ff9143`, `#16110d` or `#b8611f`.

**Resolved (2026-09-21):** the 48 loose uses in `components/**` and `app/**` go through the tokens
(T14 in `todos.md`).

### 60. ~~CSS stylesheets outside their root~~ — RESOLVED (2026-09-09)

Out with the global `a {}` of `blog.css`; `mentor-page.css` nested whole under `.mentor-page`;
`study-card.comp.css` with a single root; the orphan route uses the `new-game-page` block and no
longer clashes with the modal; the button and the notice of `exercise-move-picker` hang from the
root with the `_state_closed` modifier; `.teacher-game` has its own stylesheet
(`teacher-game.section.css`). The helpers of `blog.css` (`.blog-button`…) are global on purpose and
stay that way.

### 61. Vitest blind to `.test.tsx`, no coverage, and pure modules without a single test — [Tests]

_Mostly resolved (2026-09-09):_ `include` with `{ts,tsx}`, `@vitest/coverage-v8` and
`npm run test:coverage` (with `include`/`exclude` narrowed to `lib`, `services`, `constants` and
`hooks`). New tests (26) for `form-data`, `date-ranges`, `format-spanish-date`,
`format-spanish-time`, `numeric-id`, `parse-fen-placement`, `generate-slug`, `legal-moves` and
`studies.mapper` (the name ladder, class citations and sharing according to who is looking).

**What is left:** the other mappers without a test (`classes`, `home`, `game-explorer`…) and the
timer hooks, which need a Vitest project with `jsdom`.

### 62. `tsconfig.json` with `target` ES2017 and without the flags that catch index bugs — [DX]

_Partially resolved (2026-09-09):_ `target: ES2022` and `noUnusedLocals: true`, both without a
single error.

**What is left:** `noUncheckedIndexedAccess` gives 172 errors (the worst offenders:
`trainer-session.comp`, `move-tree.comp`, `notation.ts`, `reorder.ts` and several `lib/chess`
suites). It is a batch of its own: almost all are legitimate `array[i]` accesses that have to be
rewritten with a check.

### 63. Two databases in production without a backup or restore procedure — [Ops]

_Mostly resolved (2026-09-09):_ a "Copias de seguridad" section in the README with the `pg_dump` of
both databases, the mandatory step before every `db:deploy` and how to restore.

**What is left:** rehearsing a full restore on a separate database, noting how long it takes and
documenting what the provider offers (automatic backups and retention).

### 64. ~~Chess libraries loaded before anyone asks for them~~ — RESOLVED (2026-09-09)

`game-tools.comp.tsx` imports `board-export` (and `gifenc`) with `await import()` when export is
pressed; the mentor page and the blog's game block use `ChessBoardLazy`.

### 65. ~~`.env.example` out of date and `AGENTS.md` without the project's conventions~~ — RESOLVED (2026-09-09)

`.env.example` matches `grep process.env`: out with `PREVIEW_SECRET`, in with `ALLOW_DEMO_SEED`,
`SEED_NOW` and `PLATFORM_USER_PASSWORD` (commented out and explained). `AGENTS.md` now carries a
summary of the conventions — layers, data, auth, files, components, CSS, debt and verification —
outside the block that `next dev` regenerates.

---

## LOW priority

### 30. `buildNotationRows` always numbers from move 1 — [Chess / Notation]

`parsePgnTree` already takes the ply from the starting FEN, so the notation of "Mis estudios"
numbers a position starting at move 44 correctly. `lib/chess/notation.ts` does not:
`buildNotationRows` receives a flat list of SANs, starts counting at 1 and assumes the first is
White's. It is used by `ChessBoard` (lessons and class blocks) and the position explorer, both
capable of starting from a FEN.

**How to approach it:** its `ply` is NOT the move number, it is the index within the array of
positions — `setPly(row.white.ply)` uses it to move the board — so shifting it is not enough:
"index" has to be separated from "number shown" and the starting ply passed in. Two places call it.

### 26. The `<title>` of someone else's panel is seen before the ejection — [UX / Minor privacy]

When entering `/teacher` or `/staff` by URL without the role, Next evaluates the page's
`export const metadata` before the `redirect()` of `require*` takes effect, so the response carries
`<title>Panel del profesor…</title>` even though not a single piece of data is rendered. Verified
with the three demo accounts: **no data leaks**, only the static text of the title.

**How to approach it:** if it bothers, move the title to `generateMetadata` and resolve the role
there (with `cache()` it costs no extra query). Low priority: it is cosmetic.

### 27. The server actions cannot be exercised over raw HTTP — [DX / Tests]

The "direct POST with the wrong role" verification could not be completed from a synthetic HTTP
client: Next 16 rejects server action requests that do not come from the client runtime (they fail
with "Connection closed" and a 500 before entering the action), both through the hidden
`$ACTION_ID_` field route and through the `Next-Action` header, with a correct `Origin` and
everything. What was verified: (a) that the 44 actions of `/teacher` and `/staff` open with
`requireTeacher()`/`requireStaff()` — two do so by delegating to another function that already
guards — and (b) that those same `require*` eject the wrong role at the HTTP level on all 15 panel
routes.

**How to approach it:** an end-to-end test with a real browser (Playwright) is the natural way to
close this cell of the permissions matrix.

### 16b. Remaining npm audit vulnerabilities — [DX / Security]

_Partially resolved:_ down from 21 to **10** (1 low, 6 moderate, 3 high) by removing Tailwind and
applying `npm audit fix`.

**What is left:** the 3 "high" ones are the same chain `prisma` → `@prisma/config` →
`deepmerge-ts` (stack exhaustion when merging recursive graphs). `npm audit` only offers as a fix
going down to `prisma@6.12.0`, which is a **major backwards** and incompatible with the current
schema. It affects the development CLI, not the app's runtime. Review on every Prisma 7 update.

### 17. ~~Dev on webpack, build on Turbopack~~ — RESOLVED (2026-09-21)

`--webpack` removed from `dev`: the flag dated from Tailwind v4, which is gone, and the platform,
the public site and the CMS were navigated on `next dev` with Turbopack without incident (login,
courses, trainer, studies, explorer).

### 20. Seed dates relative to the moment of execution — [Data / DX]

_Mostly resolved with entry 25:_ the reference instant is already stable within the day and can be
fixed with `SEED_NOW`, so re-seeding does not dirty the database.

**What is left:** the dates are still counted from "today", which is what is wanted for a live demo;
if it is not re-run for weeks, the "next class" ends up in the past. `npm run db:seed` (idempotent)
is still needed before a demo.

---

### 29. Orphaned "new game" page — [Debt / Cleanup]

When game creation moved to the study page's modal, `/estudios/[studyId]/partidas/nueva` was left
without a single link pointing at it. It still works by direct URL and shares `game-fields.comp`
with editing, so it does not get in the way, but it is a second door to the same action with
duplicated validation.

**How to approach it:** decide whether the route is withdrawn along with `new-game.section.tsx` and
`platformRoutes.newStudyGame`, or whether it is kept as a deep link. If it is kept, it had better
share the form with the modal instead of maintaining two.

### 31. ~~The home page renders per request because of the session cookie~~ — RESOLVED (2026-09-09)

`/` no longer reads cookies: it is prerendered (one-hour ISR plus `revalidatePath` from the CMS
hooks) and served from the CDN. The jump for whoever already logged in is done by `proxy.ts`: with a
cookie it sends them to `/entrar`, a route handler that queries the real session, dispatches by role
and, if the cookie is expired, deletes it and returns them to the home page. That last part was what
prevented doing it before: without deleting the cookie, whoever had an expired one could not see the
home page again.

**What is left:** with `cacheComponents` it could be decided in the render itself (a session check
inside a `<Suspense>` over a prerendered shell) and the jump saved; and the services moved from
`unstable_cache` to `"use cache"` + `cacheTag`. Review the `force-dynamic` of
`app/(platform)/layout.tsx` then.

### 32. ~~The sitemap loads every article with `depth: 2` to read the `slug`~~ — RESOLVED (2026-09-09)

`getArticleLinks()` (`articles.service.ts`) asks only for `slug` and `updatedAt` with `depth: 0`,
cached with the `articles` tag; the sitemap also sends `lastModified`.

### 33. Security headers (CSP, COOP, X-Frame-Options) — [Security]

_Mostly resolved (2026-09-21):_ `headers()` in `next.config.ts` sends `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Cross-Origin-Opener-Policy: same-origin` and a `Permissions-Policy` on every route; checked on the
login, the home page and Payload's `/admin`, which keeps working.

**What is left:** the CSP. It needs a nonce generated in `proxy.ts` and passed to the inline
scripts of GA and the Meta Pixel (and to whatever Payload injects in `/admin`); a job of its own.

### 34. ~~The board sounds go without a licence or attribution~~ — RESOLVED (2026-09-21)

Worse than missing attribution: lila's `COPYING.md` lists the sounds of `public/sound` that are not
Enigmahack's sets among its **non-free exceptions**, so the two files could not be redistributed at
all. They are now synthesised by `scripts/make-board-sounds.ts` (`npm run sounds:make`, seeded and
reproducible) and there is nothing to attribute.

### 66. ~~The `Session` table is never purged~~ — RESOLVED (2026-09-09)

`readSessionUser` deletes the row as soon as it detects it expired and, one read in a hundred,
sweeps every expired one without blocking the response (the same pattern as `allowAction` with
`RateLimit`).

### 67. ~~The per-origin login ceiling trusts `x-forwarded-for` without writing it down~~ — RESOLVED (2026-09-09)

The assumption is now written next to the code in `auth.actions.ts` (trustworthy on Vercel; on
another deployment the last hop or the platform's header has to be read). Clients without the header
already fell into their own bucket ("unknown") and the per-account ceiling still holds all the same.

### 68. ~~Public metadata without `metadataBase`, canonical or default OG~~ — RESOLVED (2026-09-09)

`metadataBase` from `lib/site-url.ts` (which the sitemap and robots now share), `twitter.card`,
`openGraph.siteName`, a default OG image generated at build time with `ImageResponse`
(`app/(frontend)/opengraph-image.tsx`, inherited by every public page) and a canonical on the home
page, `/blog` (with its parameters), `/nosotros`, `/reloj-de-ajedrez`, every article and every
mentor.

### 69. ~~Time-zone offset computed twice and composite indexes missing~~ — RESOLVED (2026-09-09)

`lib/study-streak.ts` imports `offsetMsAt` from `lib/timezone.ts`. `Game` moves to
`@@index([databaseId, order])` and `Class` to `@@index([teacherId, scheduledAt])` (the simple ones
they cover are redundant); migration `20260909120000_composite_indexes`, generated with
`prisma migrate diff`. **Pending application with `npm run db:migrate`.**

### 70. Eight blocking CSS stylesheets on the home page — [Performance]

_Tried and discarded (2026-09-09):_ `experimental.cssChunking: "graph"` left the home page with the
same stylesheets (nine, 47 KB); Turbopack already groups them the same way with the default mode, so
it was removed. The ninth is the notice screen (`site-message.section.css`, 1.3 KB), which enters
the `(frontend)` tree through `error.tsx`.

**What is left:** fewer CSS files in the home page's critical path will only come from merging the
stylesheets of sections that are always rendered together (hero, program, plans…) into fewer
modules.

---

### 30. ~~`StudiesNavigation` keeps a crumb nobody renders any more~~ — RESOLVED (2026-09-04)

The `current` prop and its JSX branch removed when the `/editar` route disappeared.

### 71. `docs/` logs "Encountered a script tag while rendering React component" in dev — [DX / Docs]

Every page of the Nextra site prints that console error in `next dev` (Next 16.3, React 19.2). It
comes from `ThemeProvider` of `next-themes` 0.4.6, which `nextra-theme-docs` 4.6.1 always renders
inside its `Layout`: the provider injects an inline `<script>` to set the colour scheme before
hydration, and React 19 warns about any `<script>` rendered by a component on the client. The
script still runs on the server render, so the theme works; the warning is noise in development
only and does not appear in `npm run build && npm run start`. Upstream:
[next-themes#387](https://github.com/pacocoursey/next-themes/issues/387).

**How to address it:** nothing in our code causes it and Nextra exposes no way to drop the script.
Wait for a `next-themes` release that moves the script out of the React tree (`useServerInsertedHTML`),
then bump `nextra`/`nextra-theme-docs`. Do not filter `console.error` in the docs layout.

---

## Resolved (2026-08-30)

| #   | Entry                                  | How it was resolved                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | No real authentication                 | Own login in the platform's database (decision: identity is not delegated to Payload). `User.passwordHash` with **scrypt** and its cost parameters inside the hash; opaque sessions in the `Session` table, of which only the token's SHA-256 is stored, with a 30-day expiry and sliding renewal. `getCurrentUser()` now requires a session or redirects; `proxy.ts` does the optimistic rejection. No public sign-up: accounts created with `npm run user:create`. The login is a plain server action, so it works without JavaScript. |
| 2   | Isolation of the private area          | Closes with entry 1: the five private routes return a 307 to the login without a session (verified route by route). `robots: { index: false }` in the layout and the exclusion in `app/robots.ts`, which now includes `/login`, are kept.                                                                                                                                                                                                                                                                                                |
| 3   | Services that loaded whole collections | `getArticleBySlug` queries by slug with `limit: 1`; the courses use targeted `getPublishedCourse(courseId)` and `getCourseProgressState(courseId)`, deduplicated by `cache()`. `getMentorBySlug` goes on filtering in memory on purpose: the mentors live in a Payload **Global**, a single document.                                                                                                                                                                                                                                    |
| 4   | `UserStatDaily` was not being fed      | `services/shared/user-activity.service.ts` records the fact and increments the daily bucket (total + breakdown by topic) with `ON CONFLICT` in raw SQL, needed because of the `NULLS NOT DISTINCT` index. The dashboard reads from there; the seed rebuilds the whole table from `UserActivity`.                                                                                                                                                                                                                                         |
| 5   | "Stale" exercises undetected           | `TrainingExercise.frozenAt` column (migration `add_exercise_frozen_at`); `isExerciseStale()` compares it with `Lesson.pgnUpdatedAt` and the training session marks the exercise as "Desactualizado".                                                                                                                                                                                                                                                                                                                                     |
| 6   | No tests                               | Vitest + `npm test`. 33 tests over `pgn-tree`, `notation` and the result codes.                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 8   | Hardcoded hex values                   | 110 substitutions for `var(--color-*)` in 34 CSS files of the public site.                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 9   | Half-removed Tailwind                  | Removed (dependencies, `@import`, `@theme`, `postcss.config.mjs` and the utility classes of the layouts). Its _preflight_ was replaced by an equivalent explicit reset in `globals.css` so as not to change anything visually.                                                                                                                                                                                                                                                                                                           |
| 10  | Promotion always to queen              | Piece picker in `ChessBoard` (`isPromotionMove` + `sanForMove(..., promotion)`); the trainer already compares the SAN with the chosen piece.                                                                                                                                                                                                                                                                                                                                                                                             |
| 11  | PGN truncated silently                 | `parsePgnTree` returns `warnings[]` and `replayGameDetailed` reports the cut; the `GameViewer` shows them in development. (The malformed-token case remains: entry 11b.)                                                                                                                                                                                                                                                                                                                                                                 |
| 12  | Time zone of the classes               | `LocalDateTime` reformats the ISO in the browser's zone with `useSyncExternalStore`, falling back to the server's text when there is no JS.                                                                                                                                                                                                                                                                                                                                                                                              |
| 13  | Incomplete public metadata             | `app/sitemap.ts` and `app/robots.ts`; `priority` → `preload` in `next/image`.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 14  | Moving statistics ranges               | `lib/date-ranges.ts`: week from Monday, current month and year.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 18  | TS `enum` for the pieces               | Migrated to `constants/chess-pieces.const.ts` with `as const`; the `enums/` folder deleted.                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 19  | SSL warning from the pg driver         | `PLATFORM_DATABASE_URL` moves to `sslmode=verify-full`, like `DATABASE_URI`.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 21  | `.landingPage` without CSS             | Renamed to `landing-page`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 21b | Pre-existing lint errors               | Impure initialisations moved into effects in the clock hooks and in `ChessBoard`; `public/**` and Prisma's generated client excluded from the lint. `npm run lint` passes clean.                                                                                                                                                                                                                                                                                                                                                         |
| —   | "Mis estudios" actions                 | Creating a study and importing a PGN (`services/studies/studies.actions.ts`), with ownership validation and size caps.                                                                                                                                                                                                                                                                                                                                                                                                                   |

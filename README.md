# 365 días de ajedrez

Monorepo of a single Next.js app that brings three pieces together: the **public site**, the **CMS** (Payload) and the **learning platform** (Prisma + Postgres).

## Requirements

- **Node 20.9+** (Next 16's requirement).
- **Two separate Postgres databases**, with no shared tables:
  - `DATABASE_URI` → Payload / CMS.
  - `PLATFORM_DATABASE_URL` → learning platform (Prisma). Use `sslmode=verify-full`; with `sslmode=require` the `pg` driver warns about the change of semantics planned for pg v9.
- Environment variables in `.env.local` (copy `.env.example` and fill it in): `PAYLOAD_SECRET`, the Cloudinary credentials, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_ENV` (only `production` turns Google Analytics and the Meta Pixel on), `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_META_PIXEL_ID`.

Prisma's CLI reads `PLATFORM_DATABASE_URL` through `prisma.config.ts`, which loads `.env.local` and `.env`.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run db:up                # Postgres for both databases, in a container
npm run db:generate          # generates the Prisma client in lib/platform-db/generated
npm run db:migrate           # applies the migrations to PLATFORM_DATABASE_URL
npm run db:seed              # catalogues (idempotent) + demo data
npm run dev                  # http://localhost:3000
```

`npm run db:up` starts the Postgres of `docker-compose.yml`: one server, two databases — `plataforma` for the platform and `payload` for the CMS — at the version the managed ones run. Point `.env.local` at them and nothing else changes:

```bash
DATABASE_URI=postgres://ajedrez:ajedrez@localhost:5432/payload
PLATFORM_DATABASE_URL=postgres://ajedrez:ajedrez@localhost:5432/plataforma
```

No `sslmode` in those two: the container speaks no TLS. The CMS's tables create themselves on the first `npm run dev` (Drizzle push); the platform's come from the migrations. `docs/`, "Local database", covers copying the real data into it and how to go back to the managed ones.

## Available commands

| Command                                   | Description                                                                                                                                                                       |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                             | Development server (Turbopack, like the build), on `127.0.0.1` only. `npm run dev:lan` opens it to the local network, to try it on a phone.                                       |
| `npm run build`                           | `prisma generate` + production build (the generated client is not in git; Vercel only runs this script).                                                                          |
| `npm run start`                           | Serves the production build.                                                                                                                                                      |
| `npm run lint`                            | ESLint.                                                                                                                                                                           |
| `npm run test`                            | Vitest, one pass.                                                                                                                                                                 |
| `npm run test:watch`                      | Vitest in watch mode.                                                                                                                                                             |
| `npm run test:storybook`                  | Every story as a test in a headless Chromium: its `play` function, then axe, in light and in dark (`vitest.storybook.config.mts`; `npx playwright install chromium` once).        |
| `npm run db:up`                           | Starts the container's Postgres (both databases).                                                                                                                                 |
| `npm run db:down`                         | Stops it. The data survives; `docker compose down -v` is what throws it away.                                                                                                     |
| `npm run db:generate`                     | `prisma generate`.                                                                                                                                                                |
| `npm run db:migrate`                      | `prisma migrate dev` (development).                                                                                                                                               |
| `npm run db:deploy`                       | `prisma migrate deploy` (production).                                                                                                                                             |
| `npm run db:seed`                         | `prisma db seed`.                                                                                                                                                                 |
| `npm run db:target`                       | Says which databases `.env.local` points at (host and name, never the URL).                                                                                                       |
| `npm run db:backup`                       | Dumps both into `~/Backups/365diasdeajedrez/` with the container's `pg_dump`.                                                                                                     |
| `npm run db:studio`                       | `prisma studio`.                                                                                                                                                                  |
| `npm run user:create -- <email> "<Name>"` | Enrols a student (asks for the password without echoing it).                                                                                                                      |
| `npm run user:password -- <email>`        | Changes their password and closes their sessions.                                                                                                                                 |
| `npm run user:list`                       | Lists the accounts, whether they have a password and their open sessions.                                                                                                         |
| `npm run pieces:sync`                     | Copies the board pieces (chessground) to `public/pieces`; run it whenever chessground is updated.                                                                                 |
| `npm run typecheck`                       | `next typegen` + `tsc --noEmit`, the same CI runs.                                                                                                                                |
| `npm run storybook`                       | Storybook at `localhost:6006`: the platform's foundations, its primitives and a story for every shared piece (`components/**/*.stories.tsx`; guide in `docs/`, "Storybook").      |
| `npm run storybook:build`                 | Static Storybook build in `storybook-static/` (git-ignored).                                                                                                                      |
| `npm run test:coverage`                   | Vitest with coverage (v8) over `lib`, `services`, `constants` and `hooks`.                                                                                                        |
| `npm run format` / `npm run format:check` | Prettier over the repo: `format` writes, `format:check` is CI's first step and part of done.                                                                                      |
| `npm run positions:index`                 | Fills in the position index of the games already stored (`-- --all` reindexes every one).                                                                                         |
| `npm run collections:by-chapter`          | One-off data migration: course collections → per-chapter collections.                                                                                                             |
| `npm run stats:rebuild`                   | Rebuilds `UserStatDaily` from `UserActivity` for every account (or `-- <email>` for one).                                                                                         |
| `npm run sounds:make`                     | Writes two synthesised board sounds (`.wav`) as the way out of lichess's `.mp3`, which are what plays today.                                                                      |
| `npm run bots:calibrate`                  | Plays the bots of «Jugar» against fixed Stockfish anchors and writes their measured Elo to `lib/chess/bots/calibration.json`; no database (`-- --check`, `-- --verify-openings`). |
| `npm run bots:sql`                        | Prints the SQL of «Jugar»'s catalogs and bots, from the roster, to paste into a new migration whenever the roster changes; no database.                                           |

`.github/workflows/ci.yml` runs `format:check`, `lint`, `typecheck`, `test`, `storybook:build` and `test:storybook` (with Playwright's Chromium installed before it), in that order, on every push to `main` and on every pull request; the first step that fails skips the rest. It does not run `next build`: static generation queries the databases, which CI does not have; the deployment is what validates the build.

## Backups

There are two databases and neither can be rebuilt from the code: `PLATFORM_DATABASE_URL` holds the accounts, the progress and the game annotations; `DATABASE_URI`, the content of the site and of the blog. Prisma's migrations have no way back, so **before every `npm run db:deploy` in production** take a timestamped dump of both:

```bash
pg_dump --format=custom --no-owner --file="plataforma-$(date +%Y%m%d-%H%M).dump" "$PLATFORM_DATABASE_URL"
pg_dump --format=custom --no-owner --file="payload-$(date +%Y%m%d-%H%M).dump" "$DATABASE_URI"
```

They are restored onto an empty or test database with `pg_restore --no-owner --dbname="$URL" file.dump`. It is worth rehearsing a full restore on a separate database at least once and noting here how long it took, along with whatever the provider offers (automatic backups and retention).

## Access to the platform

The private area (`/inicio`, `/clases`, `/estudios`, `/cursos`, `/lecciones` (the old lesson URLs, which redirect), `/ajustes`, `/entrenador`, `/explorador`, `/jugar` and `/perfil` (both behind `PLAY_ENABLED`, off), `/herramientas` (behind `ANALYSIS_BOARD_ENABLED`, off), `/profesor`, `/administracion`) requires signing in at `/iniciar-sesion`. The seed leaves three test accounts ready with the password `ajedrez365` (or the one in `PLATFORM_DEMO_PASSWORD`); it is only assigned to accounts that do not have a password yet, so a re-seed never reverts a change made by hand:

| Account                              | Role                 | What they see beyond the student's view |
| ------------------------------------ | -------------------- | --------------------------------------- |
| `alumno.demo@365diasdeajedrez.com`   | Student              | —                                       |
| `profesor.demo@365diasdeajedrez.com` | Teacher              | `/profesor/*`                           |
| `staff.demo@365diasdeajedrez.com`    | Administrator/Editor | `/administracion/*`                     |

**There is no public sign-up**: in an academy a student exists because somebody enrols them. The administration team does it from `/administracion/alumnos/nuevo`, which generates a temporary password and shows it once (there is no email service). `npm run user:create` still exists as an alternative route from the command line.

### Roles

There is no roles table and no column on `User`: **the role is the existence of a row** (`Teacher`, `Staff`), and they are orthogonal — the same person can be a teacher and staff, and is still a student. They are resolved in the same query as the session (no extra queries) and are exposed only through `lib/platform-auth/roles.ts`, whose `requireTeacher()` / `requireStaff()` are the first `await` of every page and every server action of those panels. A teacher is **deactivated** (`Teacher.isActive`), never deleted: their classes and assignments are history.

The `admin`/`editor` roles of `payload/collections/Users.ts` belong to **Payload**, the CMS of the public site: another database, another login, and they do not mix with this.

How it is put together:

- **Identity and credential live in the platform's database** (Prisma), not in Payload: `User.passwordHash` stores a **scrypt** hash with its cost parameters inside, so they can be raised without invalidating the old hashes (`lib/platform-auth/password.ts`).
- **Opaque sessions in the database** (`lib/platform-auth/session.ts`): the cookie carries a random token of which only the SHA-256 is stored, and the real expiry is `Session.expiresAt` (30 days, sliding). Signing out or changing the password revokes instantly, without depending on the browser.
- **`lib/platform-auth/current-user.ts` is the identity DAL**: `getCurrentUser()` returns the user or redirects to the login, and `getSessionUser()` is its version that accepts null. Every service and every server action resolves the user there and never trusts data from the client.
- **`proxy.ts` only makes an optimistic rejection** (is the cookie there?) to save a render; it validates nothing. The real check is always the DAL's, which is also the one that covers the server actions — reachable by a direct POST.
- The login is a **plain server action**, not `useActionState`: that way it also works without JavaScript, which is the least one can ask of the front door.

## Route map

The platform's URLs are in Spanish because the product is; only the names of the dynamic parameters (`[courseId]`…) stay in English, and they never show up in the URL. The source of truth are the three constants in `lib/platform-routes.ts`.

**Public site** — `app/(frontend)`

- `/`
- `/blog`, `/blog/[slug]`
- `/nosotros`
- `/mentor/[slug]`
- `/reloj-de-ajedrez`

**CMS** — `app/(payload)`

- `/admin` (plus `/api/*`; GraphQL is turned off)

**Access** — `app/(auth)`

- `/iniciar-sesion`
- `/entrar` — route handler: whoever arrives at `/` with a session cookie is sent on to their panel according to their role, or has the expired cookie deleted and is returned to the home page

**Platform — student** — `app/(platform)` (requires a session)

- `/inicio`
- `/clases`, `/clases/[classId]`
- `/estudios`, `/estudios/clases` (games seen in class), `/estudios/[studyId]` (redirects to the study's first game; a study without games renders its empty page), `/estudios/[studyId]/partidas/[gameId]`
- `/cursos` (the courses the student added), `/cursos/explorar` (the catalog; `?nivel=<slug>` narrows it to a level), `/cursos/<slug>` (a course's information page, where it is added), `/cursos/<id>` and `/cursos/<id>/<chapterOrder>` (the course to study; the two share the `[courseRef]` segment)
- `/cursos/<id>/<chapterOrder>/<lessonId>` (a lesson: it hangs from its chapter so the column of lessons lives in the chapter's `layout.tsx` and is not fetched again on a move to another lesson). `/lecciones/[lessonId]`, where the lessons used to live, answers **308** to it.
- `/ajustes` (the account: the student's details, the theme and the daily goal; reached from the menu behind the avatar of the bar). The platform has a **light and a dark theme**: it follows the machine unless the person chooses, and the choice is the `tema` cookie — see `docs/` → Architecture → Themes.
- `/entrenador` (the Move Trainer; **switched off**: it answers 404 while `MOVE_TRAINER_ENABLED` in `constants/platform/features.const.ts` is `false`)
- `/explorador` (search for games by position; student and teacher share it)
- `/jugar`, `/jugar/partidas/[gameId]` (games against the bots), `/perfil`, `/perfil/[slug]`, `/perfil/[slug]/partidas` (a person's profile and every game they played; seen by them, their teachers and the staff) — **switched off** while `PLAY_ENABLED` is `false`
- `/herramientas` (goes to the board), `/herramientas/tablero-de-analisis`, `/herramientas/importar-partida` — **switched off** while `ANALYSIS_BOARD_ENABLED` is `false`; once on, «Herramientas» in the bar gathers them with the explorer

**Platform — teacher** (requires an active `Teacher` row)

- `/profesor`
- `/profesor/alumnos`, `/profesor/alumnos/[studentId]`
- `/profesor/alumnos/[studentId]/estudios/[studyId]`, `…/partidas/[gameId]` (**read-only** access to the studies of their assigned students)
- `/profesor/clases`, `/profesor/clases/nuevo`, `/profesor/clases/[classId]`, `/profesor/clases/[classId]/editar`
- `/profesor/perfil` («Mi ficha» in the teacher's menu: the public card the student sees)

**Platform — administration** (requires a `Staff` row; `/admin` belongs to Payload)

- `/administracion`
- `/administracion/alumnos`, `/administracion/alumnos/nuevo`, `/administracion/alumnos/[userId]`
- `/administracion/profesores`, `/administracion/profesores/nuevo`, `/administracion/profesores/[teacherId]`
- `/administracion/cursos` (creating a course is a dialog on this page), `/administracion/cursos/[courseId]`, `…/temario` (the chapters, at full width), `…/partidas`, `…/capitulos/[chapterId]`, `…/capitulos/[chapterId]/lecciones` (the lessons, at full width), `…/capitulos/[chapterId]/partidas`, `…/capitulos/[chapterId]/partidas/[gameId]` (a game on the board, to read and edit), `…/capitulos/[chapterId]/lecciones/[lessonId]`
- `/administracion/clases`, `/administracion/clases/[classId]` (global read; only support recording and cancellation)

## Architecture in brief

- **Route groups**: `(frontend)` (public site), `(payload)` (CMS), `(auth)` (login) and `(platform)` (the authenticated area, with its own `layout`, `loading`, `error` and `platform.css`). Each one has its own root layout.
- **Every section calls its own service**: page components never query the database directly.
- **Stockfish runs in the browser, untouched**: `public/engine/` serves the lite single-threaded WebAssembly build (GPL-3.0, its licence in `LICENSE-stockfish.txt`) in a Web Worker, and everything the platform does with it — the analysis, the review, the bots of «Jugar» and the full-strength module of the analysis board — goes through one UCI client (`lib/chess/engine/engine-client.ts`). A bot is weakened on our side of the protocol, never by changing the engine. See `docs/` → Chess → Bots.
- **A triad per domain**: `services/<domain>/{<domain>.service.ts, <domain>.mapper.ts, <domain>.types.ts}` (plus `.actions.ts` where there are server actions). The _service_ fetches data, the _mapper_ translates it into the view type and the _types_ are the contract of the UI.
- **BEM CSS per component**, no Tailwind: every `.css` file nests under its own root selector so that styles do not leak between sections.
- **Catalogues instead of enums**: the Prisma schema uses no enums; every restricted domain is a catalogue table with a unique, stable `code` (the logic compares `code`, never ids) and the seed loads them idempotently.
- **PGN is the source of the chess content** (`Lesson.pgn`, `Game.pgn`): there are no per-move tables and no relational trees of moves.
- Some invariants are expressed as CHECK constraints and hand-written indexes in the migrations (`prisma/migrations`); the rest is validated in the service layer. The header of `prisma/schema.prisma` documents them. Among them, the partial index `teacher_student_one_active`, which is the last word on "one active teacher per student" (the service closes the previous assignment before creating the new one, but only the index separates two simultaneous requests).
- **Authorisation inside the `where`**: teacher and staff reads filter by role and membership in the query itself; there is no "read and then check". For writes there are centralised guards in `lib/platform-auth/guards.ts`. Hiding a button never authorises anything: every action revalidates on the server.
- **Reordering lists with `@@unique([parent, order])`** (class blocks, chapters, lessons, exercises) always goes through `services/shared/reorder.ts`: PostgreSQL validates the index row by row, so a direct swap throws P2002 intermittently.

## Next.js documentation convention

This version of Next.js brings breaking changes with respect to what models usually hold: **read `node_modules/next/dist/docs/` before writing code**. `AGENTS.md` and `CLAUDE.md` explain it.

## Coding agents

`.claude/settings.json` is the repository's Claude Code policy, and it only restricts: Claude never reads or edits `.env.local`/`.env` and never forces a push; it asks before any push (a push to `main` deploys Production), before the scripts that write to a database and before rewriting history; a hook (`.claude/hooks/database-target-guard.mjs`) also asks before any command that uses the databases while `.env.local` points at a managed one; and it adds no attribution to commits or pull requests. Personal rules go in `.claude/settings.local.json`, which git ignores. `.mcp.json` offers Next's development MCP server (`next-devtools-mcp`, pinned), which Claude Code asks about before using. `docs/`, "Conventions", has the full list and its limits.

## Documentation

The project's full documentation lives in `docs/` as a standalone [Nextra](https://nextra.site) site (with its own `package.json`, so the production build carries neither MDX nor the search index):

```bash
cd docs
npm install
npm run dev      # http://localhost:3000
npm run build    # static pages + search index (Pagefind)
```

It covers architecture, routes, data access, the public site and the CMS, authentication, the data model, the student, teacher and administration features, the chess library and the viewer, styles and shared components, testing, scripts, deployment, the backlog and a Spanish ↔ code glossary. Whenever something it describes changes, the page is updated in the same commit.

## Backlog

- `IMPROVEMENTS.md` — pending improvements, prioritised (security, architecture, CSS, UX). Local only: gitignored, not in the remote.
- `TODOS.md` — concrete tasks in the queue. Local only, like the one above.
- `WARNINGS.md` — risks taken on knowingly, with the way out of each. Local only, like the two above.

The three are in English, like the code comments and this README, which stays the quick reference to the repository.

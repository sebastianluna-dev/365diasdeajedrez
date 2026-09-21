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
npm run db:generate          # generates the Prisma client in lib/platform-db/generated
npm run db:migrate           # applies the migrations to PLATFORM_DATABASE_URL
npm run db:seed              # catalogues (idempotent) + demo data
npm run dev                  # http://localhost:3000
```

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Development server (Webpack). |
| `npm run build` | `prisma generate` + production build (the generated client is not in git; Vercel only runs this script). |
| `npm run start` | Serves the production build. |
| `npm run lint` | ESLint. |
| `npm run test` | Vitest, one pass. |
| `npm run test:watch` | Vitest in watch mode. |
| `npm run db:generate` | `prisma generate`. |
| `npm run db:migrate` | `prisma migrate dev` (development). |
| `npm run db:deploy` | `prisma migrate deploy` (production). |
| `npm run db:seed` | `prisma db seed`. |
| `npm run db:studio` | `prisma studio`. |
| `npm run user:create -- <email> "<Name>"` | Enrols a student (asks for the password without echoing it). |
| `npm run user:password -- <email>` | Changes their password and closes their sessions. |
| `npm run user:list` | Lists the accounts, whether they have a password and their open sessions. |
| `npm run pieces:sync` | Copies the board pieces (chessground) to `public/pieces`; run it whenever chessground is updated. |
| `npm run typecheck` | `tsc --noEmit`, the same CI runs. |
| `npm run storybook` | Storybook at `localhost:6006` (pilot: `PlanCard` only; guide in `docs/`, "Storybook"). |
| `npm run storybook:build` | Static Storybook build in `storybook-static/` (git-ignored). |
| `npm run test:coverage` | Vitest with coverage (v8) over `lib`, `services`, `constants` and `hooks`. |
| `npm run format` / `npm run format:check` | Prettier over the repo (`format:check` fails today: the repo was never formatted, see `IMPROVEMENTS.md` #39). |
| `npm run positions:index` | Fills in the position index of the games already stored (`-- --all` reindexes every one). |
| `npm run collections:by-chapter` | One-off data migration: course collections → per-chapter collections. |
| `npm run stats:rebuild` | Rebuilds `UserStatDaily` from `UserActivity` for every account (or `-- <email>` for one). |

`.github/workflows/ci.yml` runs `lint`, `typecheck` and `test` on every push to `main` and on every pull request. It does not run `next build`: static generation queries the databases, which CI does not have; the deployment is what validates the build.

## Backups

There are two databases and neither can be rebuilt from the code: `PLATFORM_DATABASE_URL` holds the accounts, the progress and the game annotations; `DATABASE_URI`, the content of the site and of the blog. Prisma's migrations have no way back, so **before every `npm run db:deploy` in production** take a timestamped dump of both:

```bash
pg_dump --format=custom --no-owner --file="plataforma-$(date +%Y%m%d-%H%M).dump" "$PLATFORM_DATABASE_URL"
pg_dump --format=custom --no-owner --file="payload-$(date +%Y%m%d-%H%M).dump" "$DATABASE_URI"
```

They are restored onto an empty or test database with `pg_restore --no-owner --dbname="$URL" file.dump`. It is worth rehearsing a full restore on a separate database at least once and noting here how long it took, along with whatever the provider offers (automatic backups and retention).

## Access to the platform

The private area (`/inicio`, `/clases`, `/estudios`, `/cursos`, `/lecciones`, `/entrenador`, `/explorador`, `/profesor`, `/administracion`) requires signing in at `/iniciar-sesion`. The seed leaves three test accounts ready with the password `ajedrez365` (or the one in `PLATFORM_DEMO_PASSWORD`); it is only assigned to accounts that do not have a password yet, so a re-seed never reverts a change made by hand:

| Account | Role | What they see beyond the student's view |
|---|---|---|
| `alumno.demo@365diasdeajedrez.com` | Student | — |
| `profesor.demo@365diasdeajedrez.com` | Teacher | `/profesor/*` |
| `staff.demo@365diasdeajedrez.com` | Administrator/Editor | `/administracion/*` |

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
- `/estudios`, `/estudios/clases` (games seen in class), `/estudios/[studyId]`, `/estudios/[studyId]/partidas/[gameId]`, `/estudios/[studyId]/partidas/nueva`
- `/cursos`, `/cursos/[courseId]`, `/cursos/[courseId]/[chapterOrder]`
- `/lecciones/[lessonId]` (the lesson hangs off the root: its identifier already locates it)
- `/entrenador`
- `/explorador` (search for games by position; student and teacher share it)

**Platform — teacher** (requires an active `Teacher` row)

- `/profesor`
- `/profesor/alumnos`, `/profesor/alumnos/[studentId]`
- `/profesor/alumnos/[studentId]/estudios/[studyId]`, `…/partidas/[gameId]` (**read-only** access to the studies of their assigned students)
- `/profesor/clases`, `/profesor/clases/nuevo`, `/profesor/clases/[classId]`, `/profesor/clases/[classId]/editar`
- `/profesor/perfil`

**Platform — administration** (requires a `Staff` row; `/admin` belongs to Payload)

- `/administracion`
- `/administracion/alumnos`, `/administracion/alumnos/nuevo`, `/administracion/alumnos/[userId]`
- `/administracion/profesores`, `/administracion/profesores/nuevo`, `/administracion/profesores/[teacherId]`
- `/administracion/cursos`, `/administracion/cursos/nuevo`, `/administracion/cursos/[courseId]`, `…/partidas`, `…/capitulos/[chapterId]`, `…/capitulos/[chapterId]/partidas`, `…/capitulos/[chapterId]/lecciones/[lessonId]`
- `/administracion/autores`
- `/administracion/clases`, `/administracion/clases/[classId]` (global read; only support recording and cancellation)

## Architecture in brief

- **Route groups**: `(frontend)` (public site), `(payload)` (CMS), `(auth)` (login) and `(platform)` (the authenticated area, with its own `layout`, `loading`, `error` and `platform.css`). Each one has its own root layout.
- **Every section calls its own service**: page components never query the database directly.
- **A triad per domain**: `services/<domain>/{<domain>.service.ts, <domain>.mapper.ts, <domain>.types.ts}` (plus `.actions.ts` where there are server actions). The *service* fetches data, the *mapper* translates it into the view type and the *types* are the contract of the UI.
- **BEM CSS per component**, no Tailwind: every `.css` file nests under its own root selector so that styles do not leak between sections.
- **Catalogues instead of enums**: the Prisma schema uses no enums; every restricted domain is a catalogue table with a unique, stable `code` (the logic compares `code`, never ids) and the seed loads them idempotently.
- **PGN is the source of the chess content** (`Lesson.pgn`, `Game.pgn`): there are no per-move tables and no relational trees of moves.
- Some invariants are expressed as CHECK constraints and hand-written indexes in the migrations (`prisma/migrations`); the rest is validated in the service layer. The header of `prisma/schema.prisma` documents them. Among them, the partial index `teacher_student_one_active`, which is the last word on "one active teacher per student" (the service closes the previous assignment before creating the new one, but only the index separates two simultaneous requests).
- **Authorisation inside the `where`**: teacher and staff reads filter by role and membership in the query itself; there is no "read and then check". For writes there are centralised guards in `lib/platform-auth/guards.ts`. Hiding a button never authorises anything: every action revalidates on the server.
- **Reordering lists with `@@unique([parent, order])`** (class blocks, chapters, lessons, exercises) always goes through `services/shared/reorder.ts`: PostgreSQL validates the index row by row, so a direct swap throws P2002 intermittently.

## Next.js documentation convention

This version of Next.js brings breaking changes with respect to what models usually hold: **read `node_modules/next/dist/docs/` before writing code**. `AGENTS.md` and `CLAUDE.md` explain it.

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

- `IMPROVEMENTS.md` — pending improvements, prioritised (security, architecture, CSS, UX).
- `todos.md` — concrete tasks in the queue.

Both are in English, like the code comments and this README, which stays the quick reference to the repository.

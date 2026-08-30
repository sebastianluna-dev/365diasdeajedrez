This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

---

# 365 días de ajedrez

Monorepo de una sola app Next.js que reúne tres piezas: el **sitio público**, el **CMS** (Payload) y la **plataforma educativa** (Prisma + Postgres).

## Requisitos

- **Node 20.9+** (requisito de Next 16).
- **Dos bases de datos Postgres distintas**, sin tablas compartidas:
  - `DATABASE_URI` → Payload / CMS.
  - `PLATFORM_DATABASE_URL` → plataforma educativa (Prisma). Usa `sslmode=verify-full`; con `sslmode=require` el driver `pg` avisa del cambio de semántica previsto para pg v9.
- Variables de entorno en `.env.local` (copia `.env.example` y rellena): `PAYLOAD_SECRET`, credenciales de Cloudinary, `PREVIEW_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_ENV` (sólo `production` activa Google Analytics y Meta Pixel), `NEXT_PUBLIC_GA_MEASUREMENT_ID` y `NEXT_PUBLIC_META_PIXEL_ID`.

El CLI de Prisma lee `PLATFORM_DATABASE_URL` a través de `prisma.config.ts`, que carga `.env.local` y `.env`.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y rellena los valores
npm run db:generate          # genera el cliente Prisma en lib/platform-db/generated
npm run db:migrate           # aplica las migraciones sobre PLATFORM_DATABASE_URL
npm run db:seed              # catálogos (idempotentes) + datos demo
npm run dev                  # http://localhost:3000
```

## Comandos disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (Webpack). |
| `npm run build` | Build de producción. |
| `npm run start` | Sirve el build de producción. |
| `npm run lint` | ESLint. |
| `npm run test` | Vitest, una pasada. |
| `npm run test:watch` | Vitest en modo watch. |
| `npm run db:generate` | `prisma generate`. |
| `npm run db:migrate` | `prisma migrate dev` (desarrollo). |
| `npm run db:deploy` | `prisma migrate deploy` (producción). |
| `npm run db:seed` | `prisma db seed`. |
| `npm run db:studio` | `prisma studio`. |
| `npm run user:create -- <correo> "<Nombre>"` | Da de alta un alumno (pide la contraseña sin eco). |
| `npm run user:password -- <correo>` | Cambia su contraseña y cierra sus sesiones. |
| `npm run user:list` | Lista las cuentas, si tienen contraseña y sus sesiones abiertas. |

## Acceso a la plataforma

La zona privada (`/dashboard`, `/classes`, `/studies`, `/courses`, `/trainer`) exige iniciar sesión en `/login`. El seed deja lista la cuenta de pruebas **`alumno.demo@365diasdeajedrez.com`** con la contraseña `ajedrez365` (o la de `PLATFORM_DEMO_PASSWORD`); sólo se asigna a cuentas que aún no tienen contraseña, así que un re-seed nunca revierte un cambio hecho a mano.

**No hay registro público**: en una academia el alumno existe porque se le da de alta. Mientras no exista el panel del profesor, la vía es `npm run user:create`.

Cómo está montado:

- **Identidad y credencial viven en la base de la plataforma** (Prisma), no en Payload: `User.passwordHash` guarda un hash **scrypt** con sus parámetros de coste dentro, para poder subirlos sin invalidar los hashes antiguos (`lib/platform-auth/password.ts`).
- **Sesiones opacas en base de datos** (`lib/platform-auth/session.ts`): la cookie lleva un token aleatorio del que sólo se almacena su SHA-256, y la caducidad de verdad es `Session.expiresAt` (30 días, con renovación deslizante). Cerrar sesión o cambiar la contraseña revoca al instante, sin depender del navegador.
- **`lib/platform-auth/current-user.ts` es el DAL de identidad**: `getCurrentUser()` devuelve al usuario o redirige al login, y `getSessionUser()` es su versión que admite null. Todo servicio y toda server action resuelve el usuario ahí y nunca confía en datos del cliente.
- **`proxy.ts` sólo hace un rechazo optimista** (¿existe la cookie?) para ahorrar un render; no valida nada. La comprobación real es siempre la del DAL, que es además la que cubre las server actions —alcanzables por POST directo—.
- El login es una **server action plana**, no `useActionState`: así funciona también sin JavaScript, que es lo mínimo exigible en la puerta de entrada.

## Mapa de rutas

**Sitio público** — `app/(frontend)`

- `/`
- `/blog`, `/blog/[slug]`
- `/nosotros`
- `/mentor/[slug]`
- `/reloj-de-ajedrez`

**CMS** — `app/(payload)`

- `/admin` (más `/api/*` y `/api/graphql`)

**Acceso** — `app/(auth)`

- `/login`

**Plataforma** — `app/(platform)` (requiere sesión)

- `/dashboard`
- `/classes`, `/classes/[classId]`
- `/studies`, `/studies/[studyId]`, `/studies/[studyId]/games/[gameId]`
- `/courses`, `/courses/[courseId]`, `/courses/[courseId]/chapters/[chapterId]`, `/courses/[courseId]/chapters/[chapterId]/lessons/[lessonId]`
- `/trainer`

## Arquitectura en breve

- **Route groups**: `(frontend)` (sitio público), `(payload)` (CMS), `(auth)` (login) y `(platform)` (zona autenticada, con su propio `layout`, `loading`, `error` y `platform.css`). Cada uno tiene su propio root layout.
- **Cada sección llama a su propio servicio**: los componentes de página no consultan la base de datos directamente.
- **Tríada por dominio**: `services/<dominio>/{<dominio>.service.ts, <dominio>.mapper.ts, <dominio>.types.ts}` (más `.actions.ts` donde hay server actions). El *service* obtiene datos, el *mapper* traduce al tipo de vista y los *types* son el contrato de la UI.
- **CSS BEM por componente**, sin Tailwind: cada archivo `.css` anida bajo su propio selector raíz para que los estilos no se filtren entre secciones.
- **Catálogos en lugar de enums**: el schema de Prisma no usa enums; cada dominio restringido es una tabla catálogo con `code` único y estable (la lógica compara `code`, nunca ids) y el seed los carga de forma idempotente.
- **El PGN es la fuente del contenido ajedrecístico** (`Lesson.pgn`, `Game.pgn`): no hay tablas por movimiento ni árboles relacionales de jugadas.
- Algunas invariantes se expresan como CHECK constraints escritos a mano en la migración inicial (`prisma/migrations`); el resto se valida en la capa de servicios. La cabecera de `prisma/schema.prisma` las documenta.

## Convención de documentación de Next.js

Esta versión de Next.js trae cambios de ruptura respecto a lo que suele estar en los modelos: **consulta `node_modules/next/dist/docs/` antes de escribir código**. Lo explican `AGENTS.md` y `CLAUDE.md`.

## Backlog

- `MEJORAS.md` — mejoras pendientes priorizadas (seguridad, arquitectura, CSS, UX).
- `todos.md` — tareas concretas en cola.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

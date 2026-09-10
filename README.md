# 365 días de ajedrez

Monorepo de una sola app Next.js que reúne tres piezas: el **sitio público**, el **CMS** (Payload) y la **plataforma educativa** (Prisma + Postgres).

## Requisitos

- **Node 20.9+** (requisito de Next 16).
- **Dos bases de datos Postgres distintas**, sin tablas compartidas:
  - `DATABASE_URI` → Payload / CMS.
  - `PLATFORM_DATABASE_URL` → plataforma educativa (Prisma). Usa `sslmode=verify-full`; con `sslmode=require` el driver `pg` avisa del cambio de semántica previsto para pg v9.
- Variables de entorno en `.env.local` (copia `.env.example` y rellena): `PAYLOAD_SECRET`, credenciales de Cloudinary, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_ENV` (sólo `production` activa Google Analytics y Meta Pixel), `NEXT_PUBLIC_GA_MEASUREMENT_ID` y `NEXT_PUBLIC_META_PIXEL_ID`.

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
| `npm run pieces:sync` | Copia las piezas del tablero (chessground) a `public/pieces`; ejecutar al actualizar chessground. |
| `npm run typecheck` | `tsc --noEmit`, lo mismo que corre CI. |
| `npm run test:coverage` | Vitest con cobertura (v8) sobre `lib`, `services`, `constants` y `hooks`. |
| `npm run format` / `npm run format:check` | Prettier sobre el repo (hoy `format:check` falla: el repo nunca se formateó, ver `IMPROVEMENTS.md` #39). |
| `npm run positions:index` | Rellena el índice de posiciones de las partidas ya guardadas (`-- --all` reindexa todas). |
| `npm run collections:by-chapter` | Migración de datos de una sola vez: colecciones de curso → colecciones por capítulo. |

`.github/workflows/ci.yml` corre `lint`, `typecheck` y `test` en cada push a `main` y en cada pull request. No hace `next build`: la generación estática consulta las bases, que CI no tiene; el build lo valida el despliegue.

## Copias de seguridad

Hay dos bases y ninguna se puede reconstruir desde el código: en `PLATFORM_DATABASE_URL` viven las cuentas, el progreso y las anotaciones de partidas; en `DATABASE_URI`, el contenido del sitio y del blog. Las migraciones de Prisma no tienen camino inverso, así que **antes de cada `npm run db:deploy` en producción** se hace un volcado con marca de tiempo de las dos:

```bash
pg_dump --format=custom --no-owner --file="plataforma-$(date +%Y%m%d-%H%M).dump" "$PLATFORM_DATABASE_URL"
pg_dump --format=custom --no-owner --file="payload-$(date +%Y%m%d-%H%M).dump" "$DATABASE_URI"
```

Se restaura sobre una base vacía o de pruebas con `pg_restore --no-owner --dbname="$URL" archivo.dump`. Conviene ensayar una restauración completa en una base aparte al menos una vez y anotar aquí cuánto tardó, junto con lo que ofrezca el proveedor (copias automáticas y retención).

## Acceso a la plataforma

La zona privada (`/inicio`, `/clases`, `/estudios`, `/cursos`, `/lecciones`, `/entrenador`, `/explorador`, `/profesor`, `/administracion`) exige iniciar sesión en `/iniciar-sesion`. El seed deja listas tres cuentas de pruebas con la contraseña `ajedrez365` (o la de `PLATFORM_DEMO_PASSWORD`); sólo se asigna a cuentas que aún no tienen contraseña, así que un re-seed nunca revierte un cambio hecho a mano:

| Cuenta | Rol | Qué ve además de lo del alumno |
|---|---|---|
| `alumno.demo@365diasdeajedrez.com` | Alumno | — |
| `profesor.demo@365diasdeajedrez.com` | Profesor | `/profesor/*` |
| `staff.demo@365diasdeajedrez.com` | Administrador/Editor | `/administracion/*` |

**No hay registro público**: en una academia el alumno existe porque se le da de alta. Lo hace el equipo de administración desde `/administracion/alumnos/nuevo`, que genera una contraseña temporal y la muestra una sola vez (no hay servicio de correo). `npm run user:create` sigue existiendo como vía alternativa desde la línea de comandos.

### Roles

No hay tabla de roles ni columna en `User`: **el rol es la existencia de una fila** (`Teacher`, `Staff`), y son ortogonales — una misma persona puede ser profesor y staff, y sigue siendo alumno. Se resuelven en la misma consulta que la sesión (sin consultas extra) y se exponen sólo por `lib/platform-auth/roles.ts`, cuyos `requireTeacher()` / `requireStaff()` son el primer `await` de toda página y de toda server action de esos paneles. Un profesor se **desactiva** (`Teacher.isActive`), nunca se borra: sus clases y asignaciones son historial.

Los roles `admin`/`editor` de `collections/Users.ts` son de **Payload**, del CMS del sitio público: otra base de datos, otro login, y no se mezclan con esto.

Cómo está montado:

- **Identidad y credencial viven en la base de la plataforma** (Prisma), no en Payload: `User.passwordHash` guarda un hash **scrypt** con sus parámetros de coste dentro, para poder subirlos sin invalidar los hashes antiguos (`lib/platform-auth/password.ts`).
- **Sesiones opacas en base de datos** (`lib/platform-auth/session.ts`): la cookie lleva un token aleatorio del que sólo se almacena su SHA-256, y la caducidad de verdad es `Session.expiresAt` (30 días, con renovación deslizante). Cerrar sesión o cambiar la contraseña revoca al instante, sin depender del navegador.
- **`lib/platform-auth/current-user.ts` es el DAL de identidad**: `getCurrentUser()` devuelve al usuario o redirige al login, y `getSessionUser()` es su versión que admite null. Todo servicio y toda server action resuelve el usuario ahí y nunca confía en datos del cliente.
- **`proxy.ts` sólo hace un rechazo optimista** (¿existe la cookie?) para ahorrar un render; no valida nada. La comprobación real es siempre la del DAL, que es además la que cubre las server actions —alcanzables por POST directo—.
- El login es una **server action plana**, no `useActionState`: así funciona también sin JavaScript, que es lo mínimo exigible en la puerta de entrada.

## Mapa de rutas

Las URLs de la plataforma están en español porque el producto lo está; sólo los nombres de los parámetros dinámicos (`[courseId]`…) siguen en inglés, y no salen en la URL. La fuente de verdad son las tres constantes de `lib/platform-routes.ts`.

**Sitio público** — `app/(frontend)`

- `/`
- `/blog`, `/blog/[slug]`
- `/nosotros`
- `/mentor/[slug]`
- `/reloj-de-ajedrez`

**CMS** — `app/(payload)`

- `/admin` (más `/api/*`; GraphQL está desactivado)

**Acceso** — `app/(auth)`

- `/iniciar-sesion`
- `/entrar` — route handler: a quien llega a `/` con cookie de sesión lo reparte a su panel según el rol, o borra la cookie caducada y lo devuelve a la portada

**Plataforma — alumno** — `app/(platform)` (requiere sesión)

- `/inicio`
- `/clases`, `/clases/[classId]`
- `/estudios`, `/estudios/clases` (partidas vistas en clase), `/estudios/[studyId]`, `/estudios/[studyId]/partidas/[gameId]`, `/estudios/[studyId]/partidas/nueva`
- `/cursos`, `/cursos/[courseId]`, `/cursos/[courseId]/[chapterOrder]`
- `/lecciones/[lessonId]` (la lección cuelga de la raíz: su identificador ya la localiza)
- `/entrenador`
- `/explorador` (buscador de partidas por posición; lo comparten alumno y profesor)

**Plataforma — profesor** (requiere fila `Teacher` activa)

- `/profesor`
- `/profesor/alumnos`, `/profesor/alumnos/[studentId]`
- `/profesor/alumnos/[studentId]/estudios/[studyId]`, `…/partidas/[gameId]` (**sólo lectura** de los estudios de sus alumnos asignados)
- `/profesor/clases`, `/profesor/clases/nuevo`, `/profesor/clases/[classId]`, `/profesor/clases/[classId]/editar`
- `/profesor/perfil`

**Plataforma — administración** (requiere fila `Staff`; `/admin` es de Payload)

- `/administracion`
- `/administracion/alumnos`, `/administracion/alumnos/nuevo`, `/administracion/alumnos/[userId]`
- `/administracion/profesores`, `/administracion/profesores/nuevo`, `/administracion/profesores/[teacherId]`
- `/administracion/cursos`, `/administracion/cursos/nuevo`, `/administracion/cursos/[courseId]`, `…/partidas`, `…/capitulos/[chapterId]`, `…/capitulos/[chapterId]/partidas`, `…/capitulos/[chapterId]/lecciones/[lessonId]`
- `/administracion/autores`
- `/administracion/clases`, `/administracion/clases/[classId]` (lectura global; sólo grabación y cancelación de soporte)

## Arquitectura en breve

- **Route groups**: `(frontend)` (sitio público), `(payload)` (CMS), `(auth)` (login) y `(platform)` (zona autenticada, con su propio `layout`, `loading`, `error` y `platform.css`). Cada uno tiene su propio root layout.
- **Cada sección llama a su propio servicio**: los componentes de página no consultan la base de datos directamente.
- **Tríada por dominio**: `services/<dominio>/{<dominio>.service.ts, <dominio>.mapper.ts, <dominio>.types.ts}` (más `.actions.ts` donde hay server actions). El *service* obtiene datos, el *mapper* traduce al tipo de vista y los *types* son el contrato de la UI.
- **CSS BEM por componente**, sin Tailwind: cada archivo `.css` anida bajo su propio selector raíz para que los estilos no se filtren entre secciones.
- **Catálogos en lugar de enums**: el schema de Prisma no usa enums; cada dominio restringido es una tabla catálogo con `code` único y estable (la lógica compara `code`, nunca ids) y el seed los carga de forma idempotente.
- **El PGN es la fuente del contenido ajedrecístico** (`Lesson.pgn`, `Game.pgn`): no hay tablas por movimiento ni árboles relacionales de jugadas.
- Algunas invariantes se expresan como CHECK constraints e índices escritos a mano en las migraciones (`prisma/migrations`); el resto se valida en la capa de servicios. La cabecera de `prisma/schema.prisma` las documenta. Entre ellas, el índice parcial `teacher_student_one_active`, que es la verdad última de «un profesor activo por alumno» (el servicio cierra la asignación anterior antes de crear la nueva, pero dos peticiones simultáneas sólo las separa el índice).
- **Autorización dentro del `where`**: las lecturas de profesor y staff filtran por rol y pertenencia en la propia consulta; no existe «leer y luego comprobar». Para las escrituras hay guards centralizados en `lib/platform-auth/guards.ts`. Ocultar un botón nunca autoriza nada: cada action revalida en el servidor.
- **Reordenar listas con `@@unique([padre, order])`** (bloques de clase, capítulos, lecciones, ejercicios) pasa siempre por `services/shared/reorder.ts`: PostgreSQL valida el índice fila a fila, así que un intercambio directo lanza P2002 de forma intermitente.

## Convención de documentación de Next.js

Esta versión de Next.js trae cambios de ruptura respecto a lo que suele estar en los modelos: **consulta `node_modules/next/dist/docs/` antes de escribir código**. Lo explican `AGENTS.md` y `CLAUDE.md`.

## Documentación

La documentación completa del proyecto, en inglés, vive en `docs/` como un sitio [Nextra](https://nextra.site) independiente (con su propio `package.json`, para que el build de producción no cargue con MDX ni con el buscador):

```bash
cd docs
npm install
npm run dev      # http://localhost:3000
npm run build    # páginas estáticas + índice de búsqueda (Pagefind)
```

Cubre arquitectura, rutas, acceso a datos, sitio público y CMS, autenticación, modelo de datos, funciones de alumno, profesor y administración, la librería de ajedrez y el visor, estilos y componentes compartidos, pruebas, scripts, despliegue, el backlog y un glosario español ↔ código. Cuando cambie algo de lo que describe, se actualiza la página en el mismo commit.

## Backlog

- `IMPROVEMENTS.md` — mejoras pendientes priorizadas (seguridad, arquitectura, CSS, UX).
- `todos.md` — tareas concretas en cola.

Los dos están en inglés, como los comentarios del código; este README sigue siendo la referencia rápida en español.

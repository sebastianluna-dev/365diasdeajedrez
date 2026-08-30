# Mejoras pendientes

Backlog de deuda técnica y mejoras del proyecto. Cada punto lleva **área** y **prioridad**
(baja · media · alta · extrema) y una guía de cómo abordarlo.

> Última revisión: 2026-08-30. En esa ronda se resolvieron 16 de los 22 puntos originales
> (ver «Resueltos» al final). Lo que sigue abierto está arriba.

---

## Prioridad EXTREMA

### 1. La plataforma no tiene autenticación real — [Seguridad]
Todas las rutas de `app/(platform)/` (dashboard, cursos, clases, estudios, trainer) son públicas y
operan con un usuario demo fijo. Las server actions escriben progreso e intentos sin verificar
identidad real.

*Estado: aplazado a propósito (decisión del 2026-08-30: seguir con el usuario demo en esta ronda).*

**Cómo abordarlo:** implementar login de alumnos. La opción de menor fricción es una colección
`students` con `auth: true` en Payload (reutiliza sesiones, cookies y hash sin dependencias
nuevas); la alternativa es Auth.js sobre la base de la plataforma. El único punto de swap es
`lib/platform-auth/current-user.ts` (`getCurrentUser()`): debe leer la sesión real y buscar/crear el
`User` de Prisma vinculado por email. Añadir `proxy.ts` en la raíz (Next 16 renombró
`middleware.ts` → `proxy.ts`) con un matcher sobre las rutas de plataforma para el check optimista,
y mantener la verificación de verdad en el DAL. NUNCA hacer el check de auth en
`app/(platform)/layout.tsx` (la doc de Next 16 lo desaconseja explícitamente: el layout no controla
el render de los segmentos).

**Depende de esto:** cerrar del todo los puntos 2 y 7.

---

## Prioridad ALTA

### 2. Indexación y aislamiento de la zona privada — [SEO / Seguridad]
*Parcialmente resuelto:* el layout de plataforma ya declara `robots: { index: false, follow: false }`
y `app/robots.ts` excluye `/dashboard`, `/classes`, `/studies`, `/courses` y `/trainer`.

**Lo que falta:** con autenticación real, comprobar que esas rutas devuelven contenido sólo a
sesiones válidas (hoy cualquiera con la URL ve los datos del alumno demo).

### 7. Validación de esquema y rate limit en server actions — [Seguridad]
*Parcialmente resuelto:* todas las actions de escritura resuelven el usuario en el servidor, acotan
sus entradas (longitud de nombres, tamaño del PGN, tope de partidas importadas, `clamp` de
`mistakes`/`durationMs`) y pasan por `allowAction()` de `lib/rate-limit.ts`.

**Lo que falta:** (a) el contador de `lib/rate-limit.ts` vive **en memoria del proceso**, así que con
varias instancias el límite es por instancia — mover a un almacén compartido (Redis/Upstash) al
desplegar en serio; (b) validación declarativa con zod en la entrada de cada action, que cobra
sentido cuando el usuario deje de ser fijo.

### 15. Falta gestión de contenido de la plataforma — [Arquitectura / Producto]
Cursos, lecciones y clases sólo pueden crearse vía seed. El panel del profesor (crear clases,
inscribir alumnos, marcar pagos) descrito en el diagrama no existe aún.

*Estado: aplazado a propósito (decisión del 2026-08-30) — es una fase propia, no una mejora.*

**Cómo abordarlo:** rutas `/teacher` cuya llave es la existencia de la fila `Teacher` (sin sistema de
roles, como dice el diagrama): alta y edición de clases, editor de bloques de contenido,
inscripción de alumnos y marcado de pago/asistencia. Después, un editor mínimo de cursos. No
convertir catálogos en CRUDs: siguen siendo seed.

---

## Prioridad MEDIA

### 11b. Un SAN malformado se descarta sin aviso — [Arquitectura / Ajedrez]
*Parcialmente resuelto:* `parsePgnTree` ya devuelve `warnings[]` y el `GameViewer` los muestra en
desarrollo, pero **sólo** para jugadas bien formadas e ilegales (`Nf6` cuando no se puede).

**El hueco:** el tokenizador de chessops descarta los tokens que ni siquiera son SAN sintácticamente
válido (`Qz9`, `Bx99`) antes de llegar a nuestra validación, así que la rama desaparece con
`warnings` vacío — y ése es justo el error más probable en un PGN escrito a mano. Detectado por
`lib/chess/pgn-tree.test.ts`, que lo documenta con un test.

**Cómo abordarlo:** tokenizar el movetext por nuestra cuenta (quitar cabeceras, `{comentarios}`,
paréntesis, NAGs, números de jugada y el resultado) y avisar de los tokens restantes que no casen
con la gramática SAN. Ojo con los falsos positivos.

### 14b. El bucket diario de estadísticas es UTC — [Datos / UX]
*Parcialmente resuelto:* los rangos ya son de calendario (semana desde el lunes, mes y año en
curso) en `lib/date-ranges.ts`, y las horas de clase se muestran en la zona del alumno con
`LocalDateTime`.

**Lo que falta:** `UserStatDaily.day` se calcula en UTC (`toUtcDay`), así que para un alumno en
UTC-6 la actividad de última hora de la tarde cuenta en el día siguiente. Se arregla guardando el
bucket en la zona del usuario (haría falta persistir su zona horaria) o agregando por rango de
`occurredAt` en vez de por día.

---

## Prioridad BAJA

### 16b. Vulnerabilidades restantes de npm audit — [DX / Seguridad]
*Parcialmente resuelto:* de 21 se bajó a **10** (1 low, 6 moderate, 3 high) retirando Tailwind y
aplicando `npm audit fix`.

**Lo que queda:** las 3 «high» son la misma cadena `prisma` → `@prisma/config` → `deepmerge-ts`
(agotamiento de pila al fusionar grafos recursivos). `npm audit` sólo ofrece como arreglo bajar a
`prisma@6.12.0`, que es un **major hacia atrás** e incompatible con el schema actual. Afecta al CLI
de desarrollo, no al runtime de la app. Revisar en cada actualización de Prisma 7.

### 17. Dev con webpack, build con Turbopack — [DX]
`dev: next dev --webpack` pero `build: next build` (Turbopack por defecto en Next 16).

*Investigado:* la causa más probable del flag era Tailwind v4, que **ya se retiró**, y `next build`
con Turbopack funciona sin incidencias. No se cambió el script porque validarlo exige arrancar
`next dev` sin otro servidor de desarrollo activo sobre el mismo `.next/dev`.

**Cómo abordarlo:** con el proyecto parado, quitar `--webpack` de `dev`, arrancar y navegar. Si
falla, documentar el motivo real junto al flag en `package.json`.

### 20. Fechas del seed relativas al momento de ejecución — [Datos / DX]
Las clases y la actividad demo se recalculan respecto a «ahora» en cada `db:seed`; si no se
re-ejecuta en semanas, la «próxima clase» queda en el pasado.

**Cómo abordarlo:** re-ejecutar `npm run db:seed` (es idempotente) antes de demos.

---

## Resueltos (2026-08-30)

| # | Punto | Cómo se resolvió |
|---|---|---|
| 3 | Servicios que cargaban colecciones completas | `getArticleBySlug` consulta por slug con `limit: 1`; los cursos usan `getPublishedCourse(courseId)` y `getCourseProgressState(courseId)` dirigidos, deduplicados por `cache()`. `getMentorBySlug` se queda filtrando en memoria a propósito: los mentores viven en un **Global** de Payload, un único documento. |
| 4 | `UserStatDaily` no se alimentaba | `services/shared/user-activity.service.ts` registra el hecho e incrementa el bucket diario (total + desglose por tema) con `ON CONFLICT` en SQL crudo, necesario por el índice `NULLS NOT DISTINCT`. El dashboard lee de ahí; el seed reconstruye la tabla entera desde `UserActivity`. |
| 5 | Ejercicios «stale» sin detectar | Columna `TrainingExercise.frozenAt` (migración `add_exercise_frozen_at`); `isExerciseStale()` compara con `Lesson.pgnUpdatedAt` y la sesión de entrenamiento marca el ejercicio como «Desactualizado». |
| 6 | Sin tests | Vitest + `npm test`. 33 pruebas sobre `pgn-tree`, `notation` y los códigos de resultado. |
| 8 | Hex hardcodeados | 110 sustituciones por `var(--color-*)` en 34 archivos CSS del sitio público. |
| 9 | Tailwind a medias | Retirado (dependencias, `@import`, `@theme`, `postcss.config.mjs` y las clases utilitarias de los layouts). Su *preflight* se sustituyó por un reset explícito equivalente en `globals.css` para no cambiar nada visualmente. |
| 10 | Promoción siempre a dama | Selector de pieza en `ChessBoard` (`isPromotionMove` + `sanForMove(..., promotion)`); el trainer ya compara la SAN con la pieza elegida. |
| 11 | PGN recortado en silencio | `parsePgnTree` devuelve `warnings[]` y `replayGameDetailed` informa del corte; el `GameViewer` los muestra en desarrollo. (Queda el caso de tokens malformados: punto 11b.) |
| 12 | Zona horaria de las clases | `LocalDateTime` reformatea el ISO en la zona del navegador con `useSyncExternalStore`, cayendo al texto del servidor si no hay JS. |
| 13 | Metadata pública incompleta | `app/sitemap.ts` y `app/robots.ts`; `priority` → `preload` en `next/image`. |
| 14 | Rangos de estadísticas móviles | `lib/date-ranges.ts`: semana desde el lunes, mes y año en curso. |
| 18 | `enum` de TS en piezas | Migrado a `constants/chess-pieces.const.ts` con `as const`; carpeta `enums/` eliminada. |
| 19 | Aviso SSL del driver pg | `PLATFORM_DATABASE_URL` pasa a `sslmode=verify-full`, igual que `DATABASE_URI`. |
| 21 | `.landingPage` sin CSS | Renombrada a `landing-page`. |
| 21b | Errores de lint preexistentes | Inicializaciones impuras movidas a efectos en los hooks del reloj y en `ChessBoard`; `public/**` y el cliente generado de Prisma excluidos del lint. `npm run lint` pasa limpio. |
| — | Acciones de «Mis estudios» | Crear estudio e importar PGN (`services/studies/studies.actions.ts`), con validación de propiedad y topes de tamaño. |

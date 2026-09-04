# Mejoras pendientes

Backlog de deuda técnica y mejoras del proyecto. Cada punto lleva **área** y **prioridad**
(baja · media · alta · extrema) y una guía de cómo abordarlo.

> Última revisión: 2026-09-04. En esta tanda se cierran los puntos 7a, 11b, 24, 25 y 30, y el 20 se
> queda en lo que de verdad le falta. Lo que sigue abierto está arriba; lo que ya está resuelto se
> deja anotado con lo que se hizo, para no volver a abrirlo.

---

## Prioridad ALTA

### 7. Validación de esquema en server actions — [Seguridad]
*Mayormente resuelto:* todas las actions de escritura resuelven el usuario en el servidor mediante
el DAL (que ahora comprueba la sesión de verdad), acotan sus entradas (longitud de nombres, tamaño
del PGN, tope de partidas importadas, `clamp` de `mistakes`/`durationMs`) y pasan por
`allowAction()` de `lib/rate-limit.ts`. El login añade doble techo, por cuenta y por origen.

**(a) Rate limit compartido — RESUELTO (2026-09-04).** El contador vivía en un `Map` del proceso,
así que el techo era por instancia. Ahora vive en la tabla `RateLimit` (migración
`20260904150000_rate_limit`): una sentencia con `ON CONFLICT` que decide si la ventana sigue viva o
arranca otra, con las horas del reloj de la aplicación y no del de la base. Se eligió la base que ya
existe en vez de un Redis para no meter un servicio más que pueda caerse por su cuenta. Ante un
fallo de la base se deja pasar, a propósito: sin base no hay login que proteger. Las ventanas
vencidas se barren desde la app, una de cada cien llamadas.

**Lo que falta:** validación declarativa con zod en la entrada de cada action.

---

## Prioridad MEDIA

### 1b. Recuperación de contraseña y verificación de correo — [Seguridad / Producto]
El login ya existe (punto 1), pero un alumno que olvida su contraseña depende de que la academia se
la cambie a mano con `npm run user:password`.

**Cómo abordarlo:** hace falta un servicio de correo, que el proyecto todavía no tiene. Después:
tabla de tokens de un solo uso con caducidad corta (mismo patrón que `Session`: guardar el SHA-256,
nunca el token), página `/recuperar`, y responder siempre lo mismo exista o no la cuenta, para no
revelar quién está dado de alta. Al usar el token, cerrar todas las sesiones del usuario
(`destroyAllSessionsOf`, ya escrita).

### 1c. Sesión inválida: redirección dentro del stream, no 307 — [Seguridad / UX]
Entrar sin cookie lo corta el proxy con un 307 limpio. Pero con una cookie **presente y ya no
válida** (caducada o revocada), el proxy la deja pasar y la redirección la lanza el DAL cuando la
respuesta ya ha empezado a transmitirse: Next la manda dentro del stream y el estado HTTP es 200.
No se filtra ningún dato —nada del alumno llega a renderizarse— y el navegador redirige igual, pero
un cliente sin JavaScript vería el armazón vacío. Comprobado que no depende de los `loading.tsx`.

**Cómo abordarlo:** o se valida la sesión en el proxy (implica consultar la base ahí, que es
justo lo que se quiso evitar), o se espera a `unauthorized()` + `unauthorized.tsx`, hoy
experimental en Next 16.

### 11b. ~~Un SAN malformado se descarta sin aviso~~ — RESUELTO (2026-09-04)
`lib/chess/movetext-scan.ts` rastrea el movetext crudo —quitando cabeceras, comentarios de llave y
de línea, NAGs, números de jugada, paréntesis y el resultado— y avisa de los tokens que no encajan
en la gramática SAN. `parsePgnTree` los añade a `warnings`, así que un «Qz9» ya no hace desaparecer
una rama en silencio. El listón se dejó alto a propósito (se toleran `--`, `Z0` y los signos
pegados al SAN): un falso positivo en una partida buena es peor que callarse en una mala.

### 14b. El bucket diario de estadísticas es UTC — [Datos / UX]
*Parcialmente resuelto:* los rangos ya son de calendario (semana desde el lunes, mes y año en
curso) en `lib/date-ranges.ts`, y las horas de clase se muestran en la zona del alumno con
`LocalDateTime`.

**Lo que falta:** `UserStatDaily.day` se calcula en UTC (`toUtcDay`), así que para un alumno en
UTC-6 la actividad de última hora de la tarde cuenta en el día siguiente. Se arregla guardando el
bucket en la zona del usuario (haría falta persistir su zona horaria) o agregando por rango de
`occurredAt` en vez de por día.

---

### 23. La forma del error P2002 depende del driver — [Datos / Seguridad]
Prisma 7 con el *driver adapter* de PostgreSQL **no** rellena `meta.target` en las violaciones de
unicidad: el nombre real del índice viaja en `meta.driverAdapterError.cause.constraint.index`.
Cualquier `catch` escrito contra `meta.target` (el patrón habitual y el que suele estar en los
ejemplos) no reconoce el conflicto y deja escapar un 500 sin mensaje. Se detectó al probar la
carrera de asignación contra la base real.

**Estado:** resuelto donde importaba con `services/shared/prisma-errors.ts`
(`isUniqueConstraintError`, que mira los dos caminos y siempre contra un nombre concreto), usado
en el alta de cuentas, el alta de profesor, la asignación alumno↔profesor y los slugs de curso y
autor. **Lo que queda:** usar ese helper —y no un `catch` a mano— en cualquier `catch` de P2002
que se añada en el futuro; conviene revisarlo si algún día se cambia de adaptador.

### 24. ~~Entrada de ejercicios por SAN escrito a mano~~ — RESUELTO (2026-09-04)
`exercise-move-picker.comp.tsx` monta el `GameViewer` sobre el PGN de la lección dentro del
formulario del ejercicio: se marca el inicio y el final de la línea sobre el tablero y de ahí salen
`afterSans` y `lineSans` (`sansAlongPath` en `lib/chess/pgn-tree.ts`, con tests). Los campos de
texto siguen ahí y se pueden teclear o corregir a mano —el tablero los rellena, no los sustituye—,
así que la acción del servidor no cambió. `afterSans` sigue sin precargarse al editar, pero ahora
se reconstruye en dos clics.

### 25. ~~El seed reescribe `frozenAt` y `pgnUpdatedAt` en cada ejecución~~ — RESUELTO (2026-09-04)
`prisma/seed.ts` cuelga todas sus fechas de `seedReferenceDate()` en vez de `new Date()`: el día en
curso a las 18:00 UTC, o lo que diga `SEED_NOW` (ISO) si se quiere reproducir una base igual byte a
byte. Dos pasadas del mismo día escriben exactamente lo mismo, y las fechas siguen al calendario
para que la «próxima clase» de la demo no nazca en el pasado. La hora no es medianoche porque de
ese instante salen horas de clase.

---

## Prioridad BAJA

### 26. El `<title>` de un panel ajeno se ve antes de la expulsión — [UX / Privacidad menor]
Al entrar por URL a `/teacher` o `/staff` sin el rol, Next evalúa el `export const metadata` de la
página antes de que el `redirect()` de `require*` surta efecto, así que la respuesta trae
`<title>Panel del profesor…</title>` aunque no se pinte ni un dato. Comprobado con las tres
cuentas demo: **no se filtra ningún dato**, sólo el texto estático del título.

**Cómo abordarlo:** si molesta, mover el título a `generateMetadata` y resolver ahí el rol (con
`cache()` no cuesta una consulta extra). Prioridad baja: es cosmético.

### 27. Las server actions no se pueden ejercitar por HTTP crudo — [DX / Pruebas]
La verificación de «POST directo con el rol equivocado» no se pudo completar desde un cliente HTTP
sintético: Next 16 rechaza las peticiones de server action que no vienen del runtime de cliente
(fallan con «Connection closed» y un 500 antes de entrar en la acción), tanto por el camino del
campo oculto `$ACTION_ID_` como por la cabecera `Next-Action`, con `Origin` correcto y todo. Lo
que sí se verificó: (a) que las 44 acciones de `/teacher` y `/staff` abren con
`requireTeacher()`/`requireStaff()` —dos lo hacen delegando en otra función que ya guarda—, y (b)
que esos mismos `require*` expulsan al rol equivocado a nivel HTTP en las 15 rutas de panel.

**Cómo abordarlo:** una prueba de extremo a extremo con un navegador real (Playwright) es la vía
natural para cerrar esta celda de la matriz de permisos.


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
*Mayormente resuelto con el punto 25:* el instante de referencia ya es estable dentro del día y se
puede fijar con `SEED_NOW`, así que re-sembrar no ensucia la base.

**Lo que queda:** las fechas siguen contándose desde «hoy», que es lo que se quiere para una demo
viva; si no se re-ejecuta en semanas, la «próxima clase» queda en el pasado. Sigue haciendo falta
`npm run db:seed` (idempotente) antes de una demo.

---

### 29. Página de «nueva partida» huérfana — [Deuda / Limpieza]
Al pasar la creación de partidas al modal de la ficha del estudio, `/estudios/[studyId]/partidas/nueva`
se quedó sin ningún enlace que apunte a ella. Sigue funcionando por URL directa y comparte
`game-fields.comp` con la edición, así que no estorba, pero es una segunda puerta a la misma acción
con validación duplicada.

**Cómo abordarlo:** decidir si se retira la ruta junto a `new-game.section.tsx` y
`platformRoutes.newStudyGame`, o si se conserva como enlace profundo. Si se conserva, conviene que
comparta el formulario con el modal en vez de mantener dos.

---

### 30. ~~`StudiesNavigation` conserva un tramo que ya nadie pinta~~ — RESUELTO (2026-09-04)
Retirada la prop `current` y su rama del JSX al desaparecer la ruta `/editar`.

## Resueltos (2026-08-30)

| # | Punto | Cómo se resolvió |
|---|---|---|
| 1 | Sin autenticación real | Login propio en la base de la plataforma (decisión: la identidad no se delega en Payload). `User.passwordHash` con **scrypt** y sus parámetros de coste dentro del hash; sesiones opacas en la tabla `Session`, de las que sólo se guarda el SHA-256 del token, con caducidad de 30 días y renovación deslizante. `getCurrentUser()` pasa a exigir sesión o redirigir; `proxy.ts` hace el rechazo optimista. Sin registro público: alta por `npm run user:create`. El login es una server action plana, para que funcione sin JavaScript. |
| 2 | Aislamiento de la zona privada | Cierra con el punto 1: las cinco rutas privadas devuelven 307 al login sin sesión (verificado ruta a ruta). Se mantienen `robots: { index: false }` en el layout y la exclusión en `app/robots.ts`, que ahora incluye `/login`. |
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

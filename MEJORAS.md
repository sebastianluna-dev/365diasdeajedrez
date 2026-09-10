# Mejoras pendientes

Backlog de deuda técnica y mejoras del proyecto. Cada punto lleva **área** y **prioridad**
(baja · media · alta · extrema) y una guía de cómo abordarlo.

> Última revisión: 2026-09-09. Auditoría completa del proyecto (auth y datos, frontend y CSS,
> pruebas y herramientas): entran los puntos 35 a 70. Lo que sigue abierto está arriba; lo que ya
> está resuelto se deja anotado con lo que se hizo, para no volver a abrirlo.

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

### 35. ~~`/lecciones` queda fuera de las rutas protegidas, del proxy y de `robots.txt`~~ — RESUELTO (2026-09-09)
`/lecciones` añadido a `PROTECTED_PATH_PREFIXES` y al matcher de `proxy.ts`; `app/robots.ts` ya
importa la constante en vez de copiarla. `proxy.test.ts` recorre todos los prefijos sin cookie y
comprueba que el matcher sea exactamente la constante más la portada, así que una ruta nueva que
se añada sólo en un sitio rompe la prueba.

### 36. ~~El seed crea una cuenta de administración con contraseña pública y sin guarda de entorno~~ — RESUELTO (2026-09-09)
`prisma/seed.ts` aborta si la base no es local (o `NODE_ENV=production`) y la contraseña demo es
la del repositorio: hay que definir `PLATFORM_DEMO_PASSWORD` propia o, para una base de pruebas
remota, `ALLOW_DEMO_SEED=1` (documentado en `.env.example`). En local no cambia nada.

### 37. Un ZIP de 57 MB versionado infla el repositorio a 365 MB — [DX / Repositorio]
`Academia de Ajedrez Landing.zip` (60 MB) está en `git ls-files` desde el commit `2e1af25`; `.git`
pesa 365 MB para 746 archivos. Cada clon y cada despliegue lo arrastran, y seguirá en el historial
aunque se borre del árbol.

**Cómo abordarlo:** borrarlo del árbol y añadir `*.zip` a `.gitignore`. Recuperar los 350 MB exige
reescribir el historial (`git filter-repo --path "Academia de Ajedrez Landing.zip" --invert-paths`),
decisión aparte porque invalida los clones existentes.

### 38. `server-only` no resuelve en Vitest: servicios y actions no se pueden ni importar — [Pruebas]
Diez módulos abren con `import "server-only"`, pero el paquete no está instalado: en la app lo
aliasa Next y `vitest.config.mts` no lo hace. Por eso `services/shared/form-data.ts` —la primera
línea de validación de todo formulario— y el resto de la capa de servidor no tienen ni una prueba.

**Cómo abordarlo:** alias `server-only` → módulo vacío en `vitest.config.mts` y empezar por
`form-data.ts`.

### 39. Nada verifica el código antes de llegar a `main`: sin CI, sin `typecheck`, prettier sin declarar — [DX]
No hay `.github/` ni hooks; `tsc --noEmit` sólo corre dentro de `next build`, que no ve `scripts/*`
ni `prisma/seed.ts`. `.prettierrc` existe pero `prettier` no está en `devDependencies` (llega como
transitiva de Payload) y no hay script `format`.

**Cómo abordarlo:** `typecheck` y `format:check` en `package.json`, `prettier` fijado en
`devDependencies`, y un workflow con `lint`, `typecheck` y `test` sobre Node 20.

### 40. El README describe rutas en inglés que ya no existen — [Docs]
`README.md` manda a `/login`, `/dashboard`, `/classes`, `/teacher/*`, `/staff/students/new` y a
`/api/graphql` (desactivado), cuando las rutas reales son `/iniciar-sesion`, `/inicio`, `/clases`,
`/profesor/*`, `/administracion/alumnos/nuevo` (`lib/platform-routes.ts`) y la jerarquía de cursos
es otra (`/cursos/[courseId]/[chapterOrder]` + `/lecciones/[lessonId]`). Conserva además el
boilerplate de `create-next-app` y omite `positions:index` y `collections:by-chapter`.

**Cómo abordarlo:** regenerar el mapa desde las tres constantes de rutas, borrar el boilerplate y
completar la tabla de scripts.

### 41. `(frontend)` y `(auth)` no tienen `not-found.tsx` ni `error.tsx` — [UX / Frontend]
Sólo `(platform)` los tiene. `blog/[slug]` y `mentor/[slug]` llaman a `notFound()`, así que un enlace
viejo desde Google aterriza en el 404 por defecto de Next: en inglés, sin cabecera ni pie ni paleta.
Tampoco hay `app/global-error.tsx`.

**Cómo abordarlo:** `not-found.tsx` y `error.tsx` en `(frontend)` con `Header`/`Footer`, y un
`global-error.tsx` mínimo.

### 42. `/blog` manda el contenido íntegro de todos los artículos al navegador y pagina sin URL — [Rendimiento / SEO]
`blog/page.tsx` pasa `getArticles()` completo —`Article.content` es el árbol Lexical entero— a
`BlogArticles`, que es `"use client"` y filtra y corta de 9 en 9 en `useState`. El payload crece con
cada artículo, y categoría y página no están en la URL: nada más allá del noveno es rastreable ni
enlazable.

**Cómo abordarlo:** una proyección sin `content` para las tarjetas, filtro y página por
`searchParams`, y `BlogArticles` de vuelta a Server Component con `<Link>`.

### 43. `/reloj-de-ajedrez` monta dos relojes a la vez y captura la barra espaciadora en `window` — [A11y / Rendimiento]
La página renderiza `ChessClockDesktop` y `ChessClockMobile` siempre y los oculta por CSS; cada uno
instancia `useChessClock`, con su `setInterval` de 100 ms y un `keydown` en `window` que hace
`preventDefault()` de `Space`. El reloj oculto también corre, y ningún botón de la página se puede
activar con la barra espaciadora.

**Cómo abordarlo:** elegir la variante en cliente con `matchMedia` para que sólo haya una instancia,
y no interceptar `Space` cuando el foco está en un control interactivo.

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

### 44. ~~Redirección abierta: `returnTo` llega crudo a `redirect()`~~ — RESUELTO (2026-09-09)
`safeReturnTo` vive ahora en `services/shared/safe-return-to.ts` (con tests) y la usan el login y
las dos actions de asignación (`assignStudent`, `endAssignment`); `withErrorParam` construye el
`?error=` respetando la query existente en los `fail()` de staff y profesor. La tercera action con
`returnTo`, `createTeacherPosition`, era huérfana y se borró (punto 45).

### 45. Exports sin ningún consumidor, tres de ellos server actions — [Calidad / Seguridad]
*Parcialmente resuelto (2026-09-09):* borradas las tres acciones de escritura sin interfaz
(`updateGamePgn`, `refreezeExercise`, `createTeacherPosition`) y los imports que sólo ellas usaban.

**Lo que queda:** los símbolos sueltos sin uso —`getStudentStudies`, `reindexGame`,
`formatOptionalDate`, `isNumericId`/`NUMERIC_ID_DIGITS`, `CLOCK_TIME_CONTROLS`,
`STUDENT_KINDS`/`TEACHER_KINDS`, `STAFF_ERROR_PARAM`, `STAFF_ACCOUNT_MESSAGES`,
`TEACHER_ERROR_PARAM`, y el `export` sobrante de `getStaffContext` y `PLATFORM_UPLOAD_FOLDER`—
(tarea mecánica, ver `todos.md`). `noUnusedLocals` (punto 62) evita la variante intra-archivo.

### 46. El entrenador sirve ejercicios de cursos no publicados — [Autorización]
`getTrainerSession` (`services/trainer/trainer.service.ts`) monta el `where` con `lessonId` o
`chapterId` tal cual llegan por `searchParams`, sin exigir curso publicado y sin `take`, cuando
`getTrainerData` y `getLessonView` sí lo exigen. Un alumno puede pedir `/entrenador?chapter=<uuid>`
de un curso en borrador. Lo mismo aceptan `touchLesson`, `completeLesson`, `toggleTrainerChapter` y
`recordTrainingAttempt`.

**Cómo abordarlo:** un helper `publishedLessonWhere()` encadenado en esas cinco consultas.

### 47. Transacciones de importación de hasta 500 partidas sin `timeout` — [Datos]
`importPgnGames`, `copyClassGamesToStudy` e `importChapterGames` abren `$transaction` interactivas y
dentro del bucle `indexGamePositions` hace `deleteMany` + `createMany` por partida. Ningún
`$transaction` del proyecto pasa opciones: el `timeout` por defecto es 5 s, así que el PGN de torneo
que el tope de 2 MB contempla revienta con P2028 y revierte todo con un mensaje genérico.

**Cómo abordarlo:** `{ timeout, maxWait }` acordes al tope, o lotes de N partidas.

### 48. La ficha de estudio carga el PGN de todas sus partidas sin paginar — [Datos / Rendimiento]
`studyDetailInclude.games` (`services/studies/studies.mapper.ts`) usa `include` sin `select` ni
`take`: trae `pgn` y `tags` de cada partida aunque `mapStudyGameItem` no los lea. Lo mismo paga la
vista de una partida (`siblings = study.games`) y cada reordenación sube todos los ids.
`listCollectionGames` (staff) lee el `pgn` entero sólo para contar jugadas.

**Cómo abordarlo:** `select` con los campos del mapper; paginación por `searchParams`; persistir el
número de jugadas al importar.

### 49. El dashboard lee el histórico completo de estadísticas y el catálogo entero — [Datos]
`getDailyStats` hace `userStatDaily.findMany({ where: { userId } })` sin fecha ni `take` para sumar
cuatro cifras en memoria, y «Continuar estudiando» pasa por `getUserCourses()`, que trae todos los
cursos con capítulos y lecciones y todo `LessonProgress`.

**Cómo abordarlo:** `groupBy` con `_sum` y filtro de `day`; una consulta dirigida a
`CourseProgress` (`orderBy updatedAt desc, take: 1`).

### 50. Ni un log en el servidor: los fallos se tragan en silencio — [Observabilidad]
No hay `console.*` ni logger en `app/`, `lib/`, `services/`. `lib/rate-limit.ts` hace
`catch { return true }` (un fallo de base apaga el límite de login sin rastro), los `warnings` de
PGN se descartan en `game-positions.service.ts`, `error.tsx` no registra el `digest`, y una veintena
de actions hacen `return` mudo ante throttle o validación.

**Cómo abordarlo:** `lib/logger.ts` (JSON a `stderr`) en esos `catch`; estado visible en las actions
mudas siguiendo el patrón `?error=<code>`.

### 51. La firma de subida a Cloudinary no acota formato ni tamaño — [Seguridad / Datos]
`signPlatformUpload` firma sólo `{ folder, timestamp }`; `IMAGE_MAX_BYTES` e `IMAGE_MIME_TYPES` se
comprueban sólo en el navegador, aunque el comentario de `upload.const.ts` afirme lo contrario. Con
una firma válida se puede subir cualquier archivo a la cuenta.

**Cómo abordarlo:** firmar también `allowed_formats` y `resource_type: "image"` (Cloudinary invalida
la firma si el cliente los cambia) y mandarlos desde el cliente; corregir el comentario.

### 52. Payload sin `sharp`, subidas sin tope y preview a medias — [CMS]
`payload.config.ts` no pasa `sharp`, así que `Media.width`/`height` quedan a `null` y el respaldo
`?? 1536` de la foto del maestro está siempre activo. `Media` no limita tamaño de archivo.
`Articles` tiene `versions.drafts` pero no hay `admin.preview` ni ruta; `PREVIEW_SECRET` está en
`.env.example` sin que nada lo lea.

**Cómo abordarlo:** instalar `sharp` y pasarlo a `buildConfig`; `upload.limits.fileSize`; decidir el
preview o retirar la variable.

### 53. Casi ningún formulario de la plataforma avisa de que se está enviando — [UX]
44 archivos con `<form>`; sólo el login y dos formularios de contraseña usan `useFormStatus` o
`useActionState`. El resto no deshabilita el botón: un segundo clic en una conexión lenta da de alta
dos veces.

**Cómo abordarlo:** `components/common/submit-button.comp.tsx` con `useFormStatus` y usarlo en
todos los formularios de escritura (tarea mecánica, ver `todos.md`).

### 54. `StaticDiagram` y el bloque de diagrama del blog son el mismo componente duplicado — [Frontend / CSS]
`static-diagram.comp.tsx` y `chess-diagram-block.comp.tsx` tienen el mismo JSX salvo el prefijo de
clase, y las dos hojas sólo divergen en el pie (ya desincronizado: `var(--platform-text-muted)`
frente a `#8a8175`, que no pasa el contraste).

**Cómo abordarlo:** un solo `StaticDiagram` con modificador de contexto y el bloque del blog como
adaptador.

### 55. `--platform-text-subtle` se usa como texto en 46 hojas y no llega al contraste mínimo — [A11y]
`#9a9189` sobre blanco da 3,09:1 (WCAG AA pide 4,5:1) y se usa en cabeceras de tabla, contadores y
pies a 14 px. `--platform-text-muted` (`#6e655c`, 5,7:1) ya es correcto.

**Cómo abordarlo:** oscurecer el token a ≥4,5:1 (`#7a7168` da 4,78:1) o reservarlo para lo que no se lee.

### 56. Sin estrategia de foco: ni `:focus-visible` global, `outline: none` en la notación y diálogos sin foco — [A11y]
No hay regla `:focus-visible` en `globals.css` ni `platform.css`; `chess-board.comp.css` pone
`outline: none` incondicional a los botones de notación; el selector de coronación es un
`role="dialog"` sin `aria-modal`, sin recibir el foco ni cerrar con Escape; el menú de opciones del
visor tampoco mueve el foco (`MoveContextMenu` sí lo hace: es el patrón a copiar).

**Cómo abordarlo:** `:focus-visible` global, quitar el `outline: none`, y foco + Escape en los dos
diálogos.

### 57. Menú móvil enfocable estando cerrado, desplegable sin ARIA y sin enlace de salto — [A11y]
El menú móvil cerrado es `opacity: 0` + `pointer-events: none`, que no lo saca del orden de
tabulación; el disparador del desplegable no lleva `aria-expanded` ni `aria-haspopup`; no hay
«Saltar al contenido» en ningún layout y los `<main>` no tienen `id`.

**Cómo abordarlo:** `visibility: hidden` en el menú cerrado, ARIA en el disparador, y un
`skip-link` a `#contenido` en los tres layouts.

### 58. `GameTable` reimplementa una tabla con `div`s existiendo `PlatformTable` — [Frontend / A11y]
La tabla de partidas del estudio (`game-table.comp.tsx`, 160 líneas de CSS de rejilla) usa `span` y
`div`, mientras la vista del profesor pinta los mismos datos con `PlatformTable` semántica. Un lector
de pantalla no asocia celda y columna.

**Cómo abordarlo:** montar las filas sobre `PlatformTable` conservando el tirador de reordenación
en la primera celda (tarea mecánica, ver `todos.md`).

### 59. Los colores del tablero y varios hex recurrentes no son tokens — [CSS]
`#eeeed2`/`#769656` están escritos en `chess-board.comp.css`, `static-diagram.comp.css`,
`chess-diagram-block.comp.css` y `board-export.ts`. Quedan además `#b4a99d` ×27, `#5c5348` ×19,
`#8a8175` ×10 y `#b8611f` ×8 sin token, y `globals.css` repite `#ff9143`/`#16110d` teniendo
`--color-primary`/`--color-dark`.

**Cómo abordarlo:** `--board-light`/`--board-dark` con constante compartida para JS; nombrar los
dos grises de texto secundario y barrer los usos (mecánico, ver `todos.md`).

### 60. Hojas CSS fuera de su raíz — [CSS]
`app/(frontend)/blog/blog.css` abre con un `a {}` global (copia de `globals.css`);
`mentor-page.css` tiene catorce selectores de primer nivel; `study-card.comp.css` declara la raíz
dos veces; `.new-game` es raíz de dos componentes distintos (`new-game.section.css` y
`new-game.comp.css`); `exercise-move-picker.comp.css` y `teacher.section.css` tienen bloques sueltos.

**Cómo abordarlo:** borrar el `a {}`, anidar `mentor-page.css` bajo `.mentor-page`, fusionar
`.study-card` y renombrar uno de los `.new-game`.

### 61. Vitest ciego a `.test.tsx`, sin cobertura, y módulos puros sin una sola prueba — [Pruebas]
`include: ["**/*.test.ts"]` y `environment: "node"`: un `.test.tsx` no correría nunca y los hooks
no son probables; no hay `@vitest/coverage-v8`. Sin pruebas quedan `lib/date-ranges.ts` (la
aritmética de semana del punto 14), `lib/format-spanish-date.ts`/`-time.ts` (~48 llamadas),
`services/shared/form-data.ts`, `lib/chess/legal-moves.ts`, `lib/numeric-id.ts`,
`lib/parse-fen-placement.ts`, `lib/generate-slug.ts` y 11 de 13 mappers. Las pruebas actuales son
deterministas: nada que corregir ahí.

**Cómo abordarlo:** `include` con `{ts,tsx}`, `test:coverage`, y empezar por `date-ranges`,
`form-data` y `studies.mapper`.

### 62. `tsconfig.json` con `target` ES2017 y sin los flags que atrapan bugs de índices — [DX]
`ES2017` obliga a transpilar `async/await` para un runtime que lo soporta nativo, y no están
`noUncheckedIndexedAccess` ni `noUnusedLocals`. `lib/chess/*` indexa arrays por ply constantemente
(el punto 30 es un bug de índices).

**Cómo abordarlo:** `ES2022` y `noUnusedLocals` ya; `noUncheckedIndexedAccess` en una tanda propia.

### 63. Dos bases en producción sin procedimiento de copia ni restauración — [Ops]
Ni README ni scripts mencionan `pg_dump`, retención ni prueba de restauración para
`DATABASE_URI` y `PLATFORM_DATABASE_URL`; 22 migraciones con SQL a mano y sin camino inverso. Es lo
único de la auditoría con pérdida irreversible posible.

**Cómo abordarlo:** documentar el volcado de las dos bases y el paso previo a `db:deploy`, y probar
una restauración una vez.

### 64. Librerías de ajedrez cargadas antes de que nadie las pida — [Rendimiento]
`game-tools.comp.tsx` importa `board-export` (y con él `gifenc`) estáticamente en todas las páginas
de partida; `mentor/[slug]` y el bloque de partida del blog usan `ChessBoard` directo para tableros
al final de la página, existiendo `ChessBoardLazy`.

**Cómo abordarlo:** `await import()` de la exportación en el manejador del botón y `ChessBoardLazy`
en las dos páginas públicas.

### 65. `.env.example` desfasado y `AGENTS.md` sin las convenciones del proyecto — [Docs]
`PREVIEW_SECRET` está documentado y nadie lo lee; faltan `PLATFORM_USER_PASSWORD`, `SEED_NOW` y
`ALLOW_DEMO_SEED`. `AGENTS.md` sólo contiene el bloque autogenerado por `next dev`: nada de la tríada
service/mapper/types, los sufijos de archivo, BEM ni los catálogos.

**Cómo abordarlo:** cuadrar `.env.example` con `grep process.env` y resumir en `AGENTS.md` las
convenciones que ya explica el README.

---

## Prioridad BAJA

### 30. `buildNotationRows` numera siempre desde la jugada 1 — [Ajedrez / Notación]
`parsePgnTree` ya saca el ply del FEN de partida, así que la notación de «Mis estudios» numera bien
una posición que arranca en la jugada 44. `lib/chess/notation.ts` no: `buildNotationRows` recibe una
lista plana de SAN, empieza a contar en 1 y da por hecho que la primera es de las blancas. Lo usan
`ChessBoard` (lecciones y bloques de clase) y el explorador por posición, los dos capaces de arrancar
de un FEN.

**Cómo abordarlo:** su `ply` NO es el número de jugada, es el índice dentro del array de posiciones
—`setPly(row.white.ply)` lo usa para mover el tablero—, así que no vale con desplazarlo: hay que
separar «índice» de «número que se enseña» y pasarle el ply inicial. Dos sitios que lo llaman.


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

### 31. ~~La portada se renderiza por petición por la cookie de sesión~~ — RESUELTO (2026-09-09)
`/` ya no lee cookies: se prerenderiza (ISR de una hora más `revalidatePath` desde los hooks del
CMS) y se sirve desde la CDN. El salto de quien ya entró lo hace `proxy.ts`: con cookie manda a
`/entrar`, un route handler que consulta la sesión real, reparte por rol y, si la cookie está
caducada, la borra y devuelve a la portada. Eso último era lo que impedía hacerlo antes: sin borrar
la cookie, quien la tuviera caducada no podía volver a ver la portada.

**Lo que queda:** con `cacheComponents` se podría decidir en el propio render (comprobación de
sesión dentro de un `<Suspense>` sobre un armazón prerenderizado) y ahorrarse el salto; y pasar los
servicios de `unstable_cache` a `"use cache"` + `cacheTag`. Revisar entonces el `force-dynamic` de
`app/(platform)/layout.tsx`.

### 32. El sitemap carga todos los artículos con `depth: 2` para leer el `slug` — [Datos]
`app/sitemap.ts` llama a `getArticles()` (`limit: 0`, `depth: 2`), que trae cada artículo con su
contenido, categoría, etiquetas y portada, cuando el sitemap sólo necesita `slug` y `updatedAt`. Con
pocas entradas no se nota; crecerá con el blog.

**Cómo abordarlo:** una consulta propia con `select: { slug: true, updatedAt: true }` y `depth: 0`,
y mandar `lastModified` en cada entrada, que hoy no va.

### 33. Cabeceras de seguridad (CSP, COOP, X-Frame-Options) — [Seguridad]
Lighthouse las lista como informativas: no pesan en la nota. Vercel añade HSTS por su cuenta; el
resto no está. Una CSP estricta choca con los scripts en línea de GA y Meta (hace falta `nonce`).

**Cómo abordarlo:** `headers()` en `next.config.ts` con `X-Frame-Options: DENY`,
`Cross-Origin-Opener-Policy: same-origin` y `Referrer-Policy: strict-origin-when-cross-origin`; la
CSP con nonce desde `proxy.ts` es un trabajo aparte. Comprobar que el panel de Payload (`/admin`)
sigue funcionando.

### 34. Los sonidos del tablero van sin licencia ni atribución — [Legal / Contenido]
`public/sounds/move.mp3` y `capture.mp3` salen del paquete «standard» de lichess (lila). Al reordenar
`public/` (2026-09-09) se retiraron los otros 63 ficheros de ese paquete, que nadie usaba, y estos
dos quedaron sin nota de procedencia en el repo, al contrario que Stockfish en `public/engine/`.

**Cómo abordarlo:** comprobar la licencia del paquete en el `COPYING.md` de lila y, si la exige,
dejar un `LICENSE` junto a los sonidos con la atribución.

### 66. ~~La tabla `Session` no se purga nunca~~ — RESUELTO (2026-09-09)
`readSessionUser` borra la fila en cuanto la detecta caducada y, una de cada cien lecturas, barre
todas las vencidas sin bloquear la respuesta (mismo patrón que `allowAction` con `RateLimit`).

### 67. ~~El techo de login por origen confía en `x-forwarded-for` sin dejarlo escrito~~ — RESUELTO (2026-09-09)
El supuesto queda escrito junto al código de `auth.actions.ts` (fiable en Vercel; en otro
despliegue hay que leer el último salto o la cabecera de la plataforma). Los clientes sin cabecera
ya caían en su propio cubo («desconocido») y el techo por cuenta sigue vigente igual.

### 68. Metadata pública sin `metadataBase`, canónica ni OG por defecto — [SEO]
`app/(frontend)/layout.tsx` no declara `metadataBase` (el `openGraph.images` relativo del blog se
resuelve mal), ninguna página lleva `alternates.canonical`, y la portada, `/nosotros` y
`/reloj-de-ajedrez` se comparten sin tarjeta.

**Cómo abordarlo:** `metadataBase` desde `NEXT_PUBLIC_SITE_URL`, imagen OG por defecto y canónica
por página.

### 69. Desfase horario calculado dos veces e índices compuestos que faltan — [Calidad / Datos]
`lib/timezone.ts` (`offsetMsAt`) y `lib/study-streak.ts` (`offsetMs`) implementan el mismo
algoritmo con `Intl.DateTimeFormat`. `Game` ordena por `order` dentro de `databaseId` sin índice
compuesto, y `Class` filtra por `teacherId` y ordena por `scheduledAt` con dos índices sueltos.

**Cómo abordarlo:** importar `offsetMsAt` desde `study-streak`; `@@index([databaseId, order])` y
`@@index([teacherId, scheduledAt])`.

### 70. Ocho hojas CSS bloqueantes en la portada — [Rendimiento]
El build de `/` enlaza 8 hojas (40 KB en total, la mayor de 15 KB) que Lighthouse simula en serie
sobre HTTP/1.1; es lo que queda del LCP tras el punto 31. Next 16 con Turbopack ofrece
`experimental.cssChunking: "graph"` para agruparlas por ruta.

**Cómo abordarlo:** probar `"graph"` en `next.config.ts`, contar hojas en `.next/server/app/index.html`
y medir 3 pasadas; conservar sólo si baja el LCP.

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

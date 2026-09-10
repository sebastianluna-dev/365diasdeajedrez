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
*Parcialmente resuelto (2026-09-09):* `Academia de Ajedrez Landing.zip` retirado del árbol y
`*.zip` en `.gitignore`.

**Lo que queda:** sigue en el historial (commit `2e1af25`), así que cada clon arrastra los 57 MB.
Recuperarlos exige reescribir el historial (`git filter-repo --path "Academia de Ajedrez Landing.zip"
--invert-paths`) y volver a clonar: decisión aparte, porque invalida los clones existentes.

### 38. ~~`server-only` no resuelve en Vitest: servicios y actions no se pueden ni importar~~ — RESUELTO (2026-09-09)
`vitest.config.mts` aliasa `server-only` a `lib/testing/server-only.stub.ts` (un módulo vacío). La
protección real —que no acabe en un Client Component— la sigue haciendo el bundler de Next.
Primera prueba de la capa de servidor: `services/shared/form-data.test.ts`.

### 39. Nada verifica el código antes de llegar a `main`: sin CI, sin `typecheck`, prettier sin declarar — [DX]
*Mayormente resuelto (2026-09-09):* `.github/workflows/ci.yml` corre `npm ci`, `db:generate`,
`lint`, `typecheck` y `test` sobre Node 20 (sin `next build`: la generación estática consulta
Payload). Scripts nuevos: `typecheck`, `test:coverage`, `format` y `format:check`; `prettier`
fijado en `devDependencies` (3.9.6, la que ya traía Payload como transitiva).

**Lo que queda:** `format:check` no está en CI porque hoy fallaría: Prettier cambiaría 135
archivos. Formatear el repo entero es un commit propio, sin lógica dentro (ver `todos.md`); hecho
eso, añadir el paso al workflow.

### 40. ~~El README describe rutas en inglés que ya no existen~~ — RESUELTO (2026-09-09)
Mapa de rutas regenerado desde `app/` y `lib/platform-routes.ts` (incluidos `/entrar`,
`/lecciones/[lessonId]`, `/estudios/clases` y `/explorador`), rutas de acceso y de las cuentas
demo corregidas, boilerplate de `create-next-app` borrado, y la tabla de comandos completa
(`positions:index`, `collections:by-chapter`, `typecheck`, `test:coverage`, `format`).

### 41. ~~`(frontend)` y `(auth)` no tienen `not-found.tsx` ni `error.tsx`~~ — RESUELTO (2026-09-09)
`app/(frontend)/not-found.tsx` (cabecera, pie y `SiteMessage`, la pantalla de aviso nueva en
`components/sections/common/site-message`) atiende los `notFound()` del blog y de los mentores;
`app/global-not-found.tsx` con `experimental.globalNotFound` cubre las URLs sin ruta, que con tres
root layouts no podían componerse desde un `not-found.tsx`; `app/(frontend)/error.tsx` y
`app/global-error.tsx` completan las fronteras. Todo en español y con la paleta del sitio.

### 42. ~~`/blog` manda el contenido íntegro de todos los artículos al navegador y pagina sin URL~~ — RESUELTO (2026-09-09)
`getArticleSummaries()` excluye `content` en la consulta (`select: { content: false }`) y se
cachea con `unstable_cache` y la etiqueta `articles`, que caducan los hooks `afterChange`/
`afterDelete` nuevos de `collections/Articles.ts`. Categoría y página viajan en la URL
(`/blog?categoria=…&pagina=…`, lógica pura en `services/articles/article-listing.ts`, con tests),
`BlogArticles` vuelve a ser Server Component y filtro y paginación son enlaces. La página pasa de
~74 KB a ~42 KB sin un solo nodo Lexical, y cada vista tiene su canónica.

### 43. ~~`/reloj-de-ajedrez` monta dos relojes a la vez y captura la barra espaciadora en `window`~~ — RESUELTO (2026-09-09)
`useChessClock({ enabled })` no arranca el intervalo ni escucha el teclado cuando está apagado, y
`ChessClock` (`chess-clock.comp.tsx`) enciende sólo la variante que corresponde al ancho con
`matchMedia` (las dos se siguen montando para que el servidor pinte ambas y el CSS decida). La barra
espaciadora ya no se intercepta con el foco en un botón o un enlace, ni con la tecla repetida.

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

### 46. ~~El entrenador sirve ejercicios de cursos no publicados~~ — RESUELTO (2026-09-09)
`services/shared/published-content.ts` define `publishedCourseWhere`/`publishedChapterWhere`/
`publishedLessonWhere`, encadenados en `getTrainerSession`, `recordTrainingAttempt`,
`toggleTrainerChapter` y en `getLessonContext` (que alimenta `touchLesson` y `completeLesson`).
`getTrainerData` usa el mismo `where`, así que ya no hay dos versiones de la regla.

### 47. ~~Transacciones de importación de hasta 500 partidas sin `timeout`~~ — RESUELTO (2026-09-09)
`PGN_IMPORT_TRANSACTION` (`content-limits.const.ts`: `maxWait` 5 s, `timeout` 120 s) acompaña a las
tres transacciones que guardan e indexan importaciones (`importPgnGames`, `copyClassGamesToStudy`,
`importChapterGames`). La atomicidad se conserva; sólo se le da el tiempo que el tope de 500
partidas necesita.

### 48. La ficha de estudio carga el PGN de todas sus partidas sin paginar — [Datos / Rendimiento]
*Mayormente resuelto (2026-09-09):* `studyDetailInclude.games` usa `select` con los diez campos que
lee el mapper (nunca `pgn` ni `tags`), y `listCollectionGames` cuenta las jugadas con
`_count.positions` del índice de posiciones en vez de leer y reproducir el PGN de la colección.

**Lo que queda:** paginar la lista por `searchParams` (y el aside de la partida) cuando un estudio
pase de unas decenas de partidas; hoy se pintan todas, ya sin el peso del PGN.

### 49. ~~El dashboard lee el histórico completo de estadísticas y el catálogo entero~~ — RESUELTO (2026-09-09)
Las estadísticas salen de cuatro `groupBy` con `_sum` (uno por rango de calendario) en
`dashboard.service.ts`, y el mapper sólo pone nombre y orden. «Continuar estudiando» usa
`getContinueStudyingCourse()` (`courses.service.ts`): localiza el progreso en curso con una consulta
dirigida y carga sólo ese curso, en vez de `getUserCourses()` con el catálogo entero.

### 50. Ni un log en el servidor: los fallos se tragan en silencio — [Observabilidad]
*Mayormente resuelto (2026-09-09):* `lib/logger.ts` (una línea JSON por evento en `stderr`, sin
"server-only" para que sirva al seed y a los scripts) e `instrumentation.ts` con `onRequestError`,
por donde pasa todo error que Next captura al servir una petición, con su `digest`. Registran
también el `catch` de `allowAction` (un límite que desaparece ya avisa), los barridos de
`RateLimit` y `Session`, los `warnings` del reproductor al indexar posiciones y un hash de
contraseña ilegible. El error boundary de la plataforma enseña el `digest` («Código del error»)
para poder cruzarlo con el registro.

**Lo que queda:** las actions que hacen `return` mudo ante throttle o validación
(`study-goal`, `trainer`, `courses`, `studies`, `game-explorer`) siguen sin decírselo al usuario;
convendría devolver un estado visible con el patrón `?error=<code>` de los paneles.

### 51. ~~La firma de subida a Cloudinary no acota formato ni tamaño~~ — RESUELTO (2026-09-09)
`signPlatformUpload` firma también `allowed_formats` (`IMAGE_ALLOWED_FORMATS`, los mismos cuatro
formatos que el `accept` del navegador) y `ImageUpload` lo reenvía tal cual: cambiarlo invalida la
firma. El peso no se puede firmar —la API de subida no tiene ese parámetro—, así que
`IMAGE_MAX_BYTES` sigue siendo del navegador y el techo real es el del plan o preset de la cuenta;
el comentario de `upload.const.ts` ya lo dice así.

### 52. Payload sin `sharp`, subidas sin tope y preview a medias — [CMS]
*Mayormente resuelto (2026-09-09):* `sharp` instalado y pasado a `buildConfig`, así que las
subidas nuevas rellenan `Media.width`/`height` (las existentes siguen a null hasta re-subirlas; el
respaldo de la foto del maestro se queda por eso). `upload.limits.fileSize` de 5 MB con
`abortOnLimit`, el mismo techo que la plataforma. `PREVIEW_SECRET` retirado de `.env.example` y del
README: nada lo leía.

**Lo que queda:** decidir si los borradores de `Articles` merecen `admin.preview` con una ruta de
previsualización; hoy sólo se ven dentro del formulario del admin.

### 53. Casi ningún formulario de la plataforma avisa de que se está enviando — [UX]
Sigue abierto: es una tarea mecánica sobre 40 formularios (T12 en `todos.md`): promover
`LoginSubmit` a `components/common/submit-button.comp.tsx` con `useFormStatus` y usarlo en todos los
formularios de escritura.

### 54. ~~`StaticDiagram` y el bloque de diagrama del blog son el mismo componente duplicado~~ — RESUELTO (2026-09-09)
`ChessDiagramBlockRenderer` es un adaptador de una línea sobre `StaticDiagram`, que gana la prop
`context="article"` (pie más pequeño y con un gris que contrasta). `chess-diagram-block.comp.css`
borrado.

### 55. ~~`--platform-text-subtle` se usa como texto en 46 hojas y no llega al contraste mínimo~~ — RESUELTO (2026-09-09)
El token pasa de `#9a9189` (3,1:1) a `#7a7168` (4,8:1 sobre blanco). El pie del diagrama del blog
usa el nuevo `--color-muted-on-light` en vez de `#8a8175`.

### 56. Sin estrategia de foco: ni `:focus-visible` global, `outline: none` en la notación y diálogos sin foco — [A11y]
*Mayormente resuelto (2026-09-09):* `:focus-visible` global en `globals.css` (naranja sobre el
fondo oscuro) y recoloreado en `platform.css` para el fondo claro; fuera el `outline: none` de la
notación; el selector de coronación lleva `aria-modal`, recibe el foco en la primera pieza y se
cierra con Escape.

**Lo que queda:** el menú de opciones del visor (`game-viewer.comp.tsx`) sigue sin mover el foco al
abrirse ni devolverlo al cerrar; `MoveContextMenu` ya lo hace y es el patrón a copiar.

### 57. ~~Menú móvil enfocable estando cerrado, desplegable sin ARIA y sin enlace de salto~~ — RESUELTO (2026-09-09)
El menú móvil cerrado lleva `visibility: hidden` (con la transición retrasada para no cortar el
fundido). `HeaderDropdown` es ahora un Client Component con `aria-haspopup`, `aria-expanded`,
`aria-controls`, cierre con Escape y con Tab al salir; con el ratón sigue abriéndose por CSS. Los
tres layouts arrancan con «Saltar al contenido» y cada `<main>` lleva `id="contenido"`.

### 58. `GameTable` reimplementa una tabla con `div`s existiendo `PlatformTable` — [Frontend / A11y]
Sigue abierto: tarea mecánica T13 en `todos.md` (montar las filas sobre `PlatformTable` conservando
el tirador de reordenación en la primera celda y borrar la rejilla de `game-table.comp.css`).

### 59. Los colores del tablero y varios hex recurrentes no son tokens — [CSS]
*Mayormente resuelto (2026-09-09):* `--board-light`/`--board-dark` en `globals.css`, usados por el
tablero y el diagrama, con su gemelo en `constants/chess-board-colors.const.ts` para la exportación
a canvas. Tokens nuevos `--color-muted-on-dark` (#b4a99d), `--color-muted-on-light` (#5c5348) y
`--color-primary-deep` (#b8611f); `globals.css` ya no repite `#ff9143`, `#16110d` ni `#b8611f`.

**Lo que queda:** barrer los usos sueltos de esos tres hex en `components/**` y `app/**` (T14 en
`todos.md`).

### 60. ~~Hojas CSS fuera de su raíz~~ — RESUELTO (2026-09-09)
Fuera el `a {}` global de `blog.css`; `mentor-page.css` anidado entero bajo `.mentor-page`;
`study-card.comp.css` con una sola raíz; la ruta huérfana usa el bloque `new-game-page` y ya no choca
con el modal; el botón y el aviso de `exercise-move-picker` cuelgan de la raíz con el modificador
`_state_closed`; `.teacher-game` tiene su propia hoja (`teacher-game.section.css`). Los helpers de
`blog.css` (`.blog-button`…) son globales a propósito y siguen así.

### 61. Vitest ciego a `.test.tsx`, sin cobertura, y módulos puros sin una sola prueba — [Pruebas]
*Mayormente resuelto (2026-09-09):* `include` con `{ts,tsx}`, `@vitest/coverage-v8` y
`npm run test:coverage` (con `include`/`exclude` acotados a `lib`, `services`, `constants` y
`hooks`). Pruebas nuevas (26) para `form-data`, `date-ranges`, `format-spanish-date`,
`format-spanish-time`, `numeric-id`, `parse-fen-placement`, `generate-slug`, `legal-moves` y
`studies.mapper` (escalera de nombres, citas en clase y reparto según quién mira).

**Lo que queda:** los demás mappers sin prueba (`classes`, `home`, `game-explorer`…) y los hooks
de temporizadores, que necesitan un proyecto de Vitest con `jsdom`.

### 62. `tsconfig.json` con `target` ES2017 y sin los flags que atrapan bugs de índices — [DX]
*Parcialmente resuelto (2026-09-09):* `target: ES2022` y `noUnusedLocals: true`, los dos sin un
solo error.

**Lo que queda:** `noUncheckedIndexedAccess` da 172 errores (los que más: `trainer-session.comp`,
`move-tree.comp`, `notation.ts`, `reorder.ts` y varias suites de `lib/chess`). Es una tanda propia:
casi todos son accesos legítimos a `array[i]` que hay que reescribir con una comprobación.

### 63. Dos bases en producción sin procedimiento de copia ni restauración — [Ops]
*Mayormente resuelto (2026-09-09):* sección «Copias de seguridad» en el README con el `pg_dump`
de las dos bases, el paso obligatorio antes de cada `db:deploy` y cómo restaurar.

**Lo que queda:** ensayar una restauración completa en una base aparte, anotar cuánto tarda y
documentar lo que ofrezca el proveedor (copias automáticas y retención).

### 64. ~~Librerías de ajedrez cargadas antes de que nadie las pida~~ — RESUELTO (2026-09-09)
`game-tools.comp.tsx` importa `board-export` (y `gifenc`) con `await import()` al pulsar exportar;
la ficha de mentor y el bloque de partida del blog usan `ChessBoardLazy`.

### 65. ~~`.env.example` desfasado y `AGENTS.md` sin las convenciones del proyecto~~ — RESUELTO (2026-09-09)
`.env.example` cuadra con `grep process.env`: fuera `PREVIEW_SECRET`, dentro `ALLOW_DEMO_SEED`,
`SEED_NOW` y `PLATFORM_USER_PASSWORD` (comentadas y explicadas). `AGENTS.md` lleva ahora un
resumen de las convenciones —capas, datos, auth, archivos, componentes, CSS, deuda y
verificación— fuera del bloque que regenera `next dev`.

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

### 32. ~~El sitemap carga todos los artículos con `depth: 2` para leer el `slug`~~ — RESUELTO (2026-09-09)
`getArticleLinks()` (`articles.service.ts`) pide sólo `slug` y `updatedAt` con `depth: 0`, cacheado
con la etiqueta `articles`; el sitemap manda además `lastModified`.

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

### 68. ~~Metadata pública sin `metadataBase`, canónica ni OG por defecto~~ — RESUELTO (2026-09-09)
`metadataBase` desde `lib/site-url.ts` (que ahora comparten sitemap y robots), `twitter.card`,
`openGraph.siteName`, imagen OG por defecto generada en el build con `ImageResponse`
(`app/(frontend)/opengraph-image.tsx`, heredada por todas las páginas públicas) y canónica en la
portada, `/blog` (con sus parámetros), `/nosotros`, `/reloj-de-ajedrez`, cada artículo y cada mentor.

### 69. ~~Desfase horario calculado dos veces e índices compuestos que faltan~~ — RESUELTO (2026-09-09)
`lib/study-streak.ts` importa `offsetMsAt` de `lib/timezone.ts`. `Game` pasa a
`@@index([databaseId, order])` y `Class` a `@@index([teacherId, scheduledAt])` (los simples que
cubren sobran); migración `20260909120000_composite_indexes`, generada con `prisma migrate diff`.
**Pendiente de aplicar con `npm run db:migrate`.**

### 70. Ocho hojas CSS bloqueantes en la portada — [Rendimiento]
*Probado y descartado (2026-09-09):* `experimental.cssChunking: "graph"` dejó la portada con las
mismas hojas (nueve, 47 KB); Turbopack ya las agrupa igual con el modo por defecto, así que se
retiró. La novena es la pantalla de aviso (`site-message.section.css`, 1,3 KB), que entra en el
árbol de `(frontend)` por `error.tsx`.

**Lo que queda:** menos archivos CSS en la ruta crítica de la portada sólo saldrá de fusionar hojas
de secciones que siempre se pintan juntas (hero, programa, planes…) en menos módulos.

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

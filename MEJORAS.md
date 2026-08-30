# Mejoras pendientes

Backlog de deuda técnica y mejoras detectadas mientras se construía la plataforma educativa (v1).
No es una auditoría exhaustiva: son hallazgos de contexto. Cada punto lleva **área** y **prioridad**
(baja · media · alta · extrema) y una guía de cómo abordarlo.

---

## Prioridad EXTREMA

### 1. La plataforma no tiene autenticación real — [Seguridad]
Todas las rutas de `app/(platform)/` (dashboard, cursos, clases, estudios, trainer) son públicas y
operan con un usuario demo fijo. Las server actions (`services/*/**.actions.ts`) escriben progreso
e intentos sin verificar identidad real.

**Cómo abordarlo:** implementar login de alumnos (opciones: colección de alumnos con `auth: true`
en Payload, o Auth.js). El único punto de swap es `lib/platform-auth/current-user.ts`
(`getCurrentUser()`): debe leer la sesión real y buscar/crear el `User` de Prisma vinculado.
Añadir `proxy.ts` en la raíz (Next 16 renombró `middleware.ts` → `proxy.ts`) con un matcher sobre
las rutas de plataforma para el check optimista, y mantener la verificación de verdad en el DAL.
NUNCA hacer el check de auth en `app/(platform)/layout.tsx` (la doc de Next 16 lo desaconseja
explícitamente: el layout no controla el render de los segmentos).

### 2. Indexación de la zona privada — [SEO / Seguridad]
Mientras no haya auth, `/dashboard` y compañía son indexables por buscadores con datos del alumno demo.

**Cómo abordarlo:** ya se añadió `robots: { index: false }` en el metadata del layout de plataforma;
al implementar auth real, verificar además con un `robots.txt`/middleware que la zona privada
devuelva contenido solo a sesiones válidas.

---

## Prioridad ALTA

### 3. Servicios que cargan colecciones completas y filtran en memoria — [Arquitectura / Rendimiento]
`services/articles/articles.service.ts` y `services/mentors/mentors.service.ts` hacen
`limit: 0, depth: 2` y buscan el slug con `.find()`. `services/courses/courses.service.ts`
(plataforma) carga todos los cursos publicados con su estructura completa en cada request para
resolver un solo curso/capítulo/lección.

**Cómo abordarlo:** consultas dirigidas (`where: { slug: { equals } }` en Payload;
`findUnique`/`findFirst` con `include` mínimo en Prisma) + `cache()` por argumento. Mantener la
firma pública de los servicios para no tocar la UI.

### 4. `UserStatDaily` existe pero no se alimenta — [Datos / Arquitectura]
El dashboard calcula estadísticas leyendo `UserActivity` completo por usuario. Correcto a esta
escala, no escala con historial largo.

**Cómo abordarlo:** al registrar actividad (en `courses.actions.ts` y `trainer.actions.ts`),
hacer upsert `+1` en `UserStatDaily` (userId, day, metricId, topicId). Ojo: el índice único usa
`NULLS NOT DISTINCT` (migración init), y el upsert tipado de Prisma no cubre topicId NULL — usar
`$executeRaw` con `ON CONFLICT` para ese caso. Después, cambiar el servicio de dashboard a
`SUM(value)` por rangos.

### 5. Ejercicios «stale» sin detectar — [Arquitectura / Datos]
`TrainingExercise` guarda `startFen`/`line` congelados; si un autor edita `Lesson.pgn`
(`pgnUpdatedAt` posterior al congelado), el ejercicio puede quedar desalineado con la lección.

**Cómo abordarlo:** guardar `frozenAt` en el ejercicio (o comparar contra `pgnUpdatedAt`) y
marcar/filtrar ejercicios stale en `trainer.service.ts`; revalidar la ruta (`path`) contra el
árbol de `lib/chess/pgn-tree.ts` al publicar.

### 6. No hay tests ni script de test — [Calidad]
`package.json` no tiene runner de tests. Lo más delicado (parseo PGN en `lib/chess/pgn-tree.ts`,
validación del trainer, mappers de servicios, seed) está sin cobertura.

**Cómo abordarlo:** añadir Vitest (compatible con TS/ESM sin fricción). Primeras suites de mayor
valor: `parsePgnTree` (variantes/comentarios/[%cal]/[%csl]/rutas), `nextPathOf`/`endPathOf`,
normalización SAN del trainer, y los mappers de courses/dashboard.

### 7. Server actions sin rate limit ni validación de esquema — [Seguridad]
`recordTrainingAttempt`, `completeLesson`, etc. validan existencia y clampan números, pero aceptan
llamadas ilimitadas (accesibles por POST directo).

**Cómo abordarlo:** cuando haya auth real, añadir validación con zod en la entrada de cada action
y un rate-limit sencillo (por usuario) en las de escritura.

---

## Prioridad MEDIA

### 8. Tokens CSS ignorados: hex hardcodeados por todo el CSS — [CSS]
`app/(frontend)/globals.css` define variables (`--color-primary`, etc.) pero las secciones usan
`#ff9143`, `#16110d`, `#b4a99d` literales. El CSS de plataforma nuevo definió sus propios tokens
(`platform.css`), pero el sitio público sigue con hex sueltos.

**Cómo abordarlo:** sweep de sustitución por `var(--color-*)` archivo por archivo (es mecánico);
consolidar los tokens de plataforma y del sitio público en una sola fuente si el rediseño lo permite.

### 9. Tailwind v4 instalado pero casi sin uso — [CSS / Arquitectura]
`globals.css` importa Tailwind y el root layout usa 4-5 clases utilitarias (`h-full`,
`bg-[#16110d]`...), todo lo demás es BEM manual. Dos sistemas a medias.

**Cómo abordarlo:** decidir: o quitar Tailwind (reemplazar esas clases por CSS propio, aligera el
build) o adoptarlo de verdad. La plataforma nueva es 100% BEM (por spec), así que lo coherente es
retirarlo.

### 10. Promoción de peón siempre a dama — [UX / Ajedrez]
`lib/chess/replay.ts` (`sanForMove`) auto-promociona a dama porque chessground base no trae diálogo
de promoción. Afecta al trainer con líneas de subpromoción.

**Cómo abordarlo:** implementar un mini diálogo de promoción en `ChessBoard` (overlay con 4 piezas)
y pasar la pieza elegida a `sanForMove`; en el trainer, comparar SAN incluida la promoción.

### 11. `replayGame` y `parsePgnTree` degradan en silencio ante SAN ilegal — [Arquitectura / Ajedrez]
Ambos cortan/descartan la rama sin avisar. Un PGN mal cargado en el CMS se vería «recortado» sin
error visible para el editor.

**Cómo abordarlo:** devolver también advertencias (`{ tree, warnings[] }`) y mostrarlas en
desarrollo/admin; validar el PGN al guardar contenido (hook de Payload o validación del futuro panel).

### 12. Zona horaria de clases — [Datos / UX]
`Class.scheduledAt` está en UTC y las vistas formatean con la TZ del servidor
(`lib/format-spanish-time.ts`). Alumnos en otras zonas verán horas equivocadas.

**Cómo abordarlo:** formatear en el cliente con la TZ del navegador (componente cliente pequeño que
reciba el ISO), o guardar/mostrar con `Intl.DateTimeFormat` + `timeZone` del usuario (el modelo
Teacher ya tiene `timezone`).

### 13. Metadata del sitio público incompleta — [SEO]
No hay `sitemap.ts` ni `robots.ts` en `app/`; los artículos tienen `generateMetadata` pero
conviene revisar canonical/OG en todas las rutas públicas. Además Next 16 deprecó `priority` de
`next/image` a favor de `preload` — revisar usos existentes.

**Cómo abordarlo:** añadir `app/sitemap.ts` (blog + páginas estáticas) y `app/robots.ts`
(excluyendo `/dashboard`, `/classes`, `/studies`, `/courses`, `/trainer`, `/admin`); grep de
`priority` en componentes con `next/image`.

### 14. Estadísticas «esta semana / este mes» son ventanas móviles — [Datos / UX]
El dashboard usa 7/30/365 días hacia atrás, no semana/mes/año calendario.

**Cómo abordarlo:** decidir la semántica de producto; si es calendario, calcular los cortes con la
TZ del usuario (lunes de la semana, día 1 del mes) en `services/dashboard/dashboard.mapper.ts`.

### 15. Falta gestión de contenido de la plataforma — [Arquitectura / Producto]
Cursos, lecciones y clases sólo pueden crearse vía seed. El panel del profesor (crear clases,
inscribir alumnos, marcar pagos) descrito en el diagrama no existe aún.

**Cómo abordarlo:** siguiente fase natural: rutas de panel para `Teacher` (la fila Teacher es la
llave, sin sistema de roles) y un editor mínimo de cursos, o integración de autoría vía
herramientas internas. No convertir catálogos en CRUDs: siguen siendo seed.

---

## Prioridad BAJA

### 16. Vulnerabilidades reportadas por npm audit — [DX / Seguridad]
`npm audit` reporta 21 (1 low, 11 moderate, 9 high) en dependencias transitivas.

**Cómo abordarlo:** `npm audit` para el detalle; subir versiones donde no haya breaking changes.
Revisar tras cada bump de Payload/Next.

### 17. Dev con webpack, build con Turbopack — [DX]
`dev: next dev --webpack` pero `build: next build` (Turbopack por defecto en Next 16). Diferencias
de bundler entre desarrollo y producción pueden esconder errores solo-de-build.

**Cómo abordarlo:** probar `next dev` sin `--webpack` (quitando la flag) y, si el motivo era una
incompatibilidad de Payload/Cloudinary, documentarla al lado de la flag en `package.json`.

### 18. `enums/chess-pieces.enum.ts` usa `enum` de TS — [Arquitectura / Convenciones]
La convención nueva del proyecto (y el spec de la plataforma) prefiere objetos `as const`
(ver `constants/platform/`).

**Cómo abordarlo:** migrar ese enum a `as const` y ajustar sus 1-2 usos (hero de Home).

### 19. Advertencia SSL del driver pg — [DX / Datos]
Al conectar a `db.prisma.io` con `sslmode=require`, pg avisa del cambio de semántica en pg v9.

**Cómo abordarlo:** cambiar a `sslmode=verify-full` en `PLATFORM_DATABASE_URL` (igual que ya hace
`DATABASE_URI` de Payload) cuando se rote la URL.

### 20. Fechas del seed relativas al momento de ejecución — [Datos / DX]
Las clases y la actividad demo se recalculan respecto a «ahora» en cada `db:seed`; si no se
re-ejecuta en semanas, la «próxima clase» queda en el pasado.

**Cómo abordarlo:** re-ejecutar `npm run db:seed` (es idempotente) antes de demos, o mover las
fechas demo a un cron/manual.

### 21b. Errores de lint preexistentes — [Calidad / DX]
`npm run lint` falla desde antes de la plataforma: `hooks/use-chess-clock.hook.ts` y
`hooks/use-countdown-timer.hook.ts` (regla `react-hooks/purity`: `Date.now()`/refs durante render),
`components/common/chess-board.comp.tsx` (asignación de ref durante render, patrón previo) y
`public/design-import/support.js` (`ReactDOM.render` deprecado, asignación a `module` — es un
script importado de diseño, valorar excluir `public/` del lint).

**Cómo abordarlo:** mover las inicializaciones impuras a `useEffect`/lazy init; añadir `public/**`
a los `ignores` del eslint config. Prioridad: baja.

### 21. `.landingPage` sin regla CSS — [CSS]
`app/(frontend)/landing-page.tsx` envuelve todo en `className="landingPage"` y no existe ninguna
regla para esa clase (además no sigue la convención kebab/BEM).

**Cómo abordarlo:** eliminar la clase o renombrarla a `landing-page` con estilos reales si se
necesita el hook de estilo.

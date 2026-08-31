# TODOs delegables

> **Estado: las diez tareas de esta tanda (T1–T10) están hechas** (2026-08-30). Se dejan
> registradas abajo con lo que acabó cambiando, para no repetirlas. Las mejoras que siguen
> abiertas viven en `MEJORAS.md`.
>
> **2026-08-31 — `PLAN-TEACHER-ADMIN.md` ejecutado por completo** (fases 1 a 7): panel del
> profesor (`/teacher`) y de administración (`/staff`). Lo verificado de verdad, fase a fase,
> está en la sección siguiente; lo que quedó pendiente se anotó en `MEJORAS.md` (puntos 23 a 27).

## Paneles de profesor y administración (2026-08-31)

Validado ejecutando cada comprobación, no por lectura del código:

- **F1 · Esquema y datos** — migración `add_teacher_staff_panels` aplicada sobre la base poblada
  (aditiva); `npm run db:seed` dos veces sin cambios; un segundo `INSERT` de asignación activa
  para el mismo alumno **falla en SQL** (P2002 del índice parcial `teacher_student_one_active`);
  los CHECK previos y el índice `NULLS NOT DISTINCT` intactos.
- **F2 · Autorización** — las 15 rutas de panel redirigen al login sin cookie; con sesión, el rol
  equivocado es expulsado sin que se pinte ningún dato (comprobado buscando marcadores de
  contenido en el HTML de las tres cuentas demo); el menú apila el grupo correcto por rol.
- **F3 · Profesor, sólo lectura** — el estudio y la partida de un alumno **no asignado** dan «no
  encontrado» por URL directa, sin filtrar su nombre; el `meetingUrl` lo ve siempre el profesor y
  el alumno sólo desde `meetingUrlVisibleFrom` (test unitario del mapper).
- **F4 · Clases y bloques** — reordenación probada contra PostgreSQL con 5 bloques: subir, bajar,
  extremos, cadena completa y borrado del tercero, siempre orden denso y **sin un solo P2002**;
  una partida de alumno no asignado se rechaza en el `where` del guard, y sigue rechazándose tras
  cerrar la asignación.
- **F5 · Staff** — reasignar conserva la fila anterior cerrada; reasignar al mismo profesor no
  crea fila; el email duplicado y la asignación duplicada dan mensaje amigable (hizo falta
  `services/shared/prisma-errors.ts`, ver MEJORAS #23); reiniciar la contraseña borra todas las
  sesiones de la cuenta.
- **F6 · Cursos** — `deriveExerciseData` extraída de `prisma/seed.ts` **moviendo el código, no
  reescribiéndolo**: tras el refactor el re-seed produce datos derivados idénticos campo a campo
  (`path`, `startPly`, `endPly`, `startFen`, `line`); un ejercicio creado por el staff **no nace
  desactualizado**, es entrenable, y se marca desactualizado al tocar el PGN de la lección; un
  curso en borrador da «no encontrado» en `/courses` por URL directa.
- **F7 · Transversal** — matriz de permisos recorrida celda a celda por HTTP con las tres cuentas
  demo; `npm run build` limpio; cero archivos de Payload tocados.

**Lo único que no se pudo cerrar como pedía el plan:** el POST directo de server actions con el
rol equivocado (MEJORAS #27) — Next 16 no acepta esas peticiones desde un cliente HTTP sintético.
En su lugar se auditó que las 44 acciones de `/teacher` y `/staff` abren con su `require*`.

Reglas del proyecto para cualquier tarea nueva que se añada aquí (no negociables):

- **CSS**: BEM estricto estilo Yandex (`bloque__elemento`, modificador `_clave_valor`, booleano `_abierto`),
  archivos kebab-case, cada archivo CSS anida TODAS sus reglas bajo su selector raíz con nesting nativo (`&`),
  media queries anidadas dentro del bloque, desktop-first (`max-width`). NO Tailwind (se retiró del proyecto),
  NO CSS-in-JS. Los colores usan los tokens de `app/(frontend)/globals.css` (`--color-*`) y, en la
  plataforma, los `--platform-*` de `app/(platform)/platform.css`.
- **Archivos**: kebab-case con sufijos `.comp.tsx`, `.section.tsx`, `.hook.ts`, `.const.ts`, etc.
  Named exports (default sólo en archivos de App Router). Sin barrels: imports con ruta completa `@/...`.
- **Componentes**: Server Components por defecto; `"use client"` sólo en la hoja que posee estado.
- **Datos**: la UI nunca llama Prisma directo; siempre `services/<dominio>/*.service.ts`.
- Al terminar cada tarea: `npx tsc --noEmit`, `npm run lint` y `npm test` deben pasar.

---

## Hechas

### T1 — Tokens CSS en lugar de hex · [CSS] ✅
110 sustituciones en 34 archivos de `components/sections/**` y `app/(frontend)/**`. Sólo se
sustituyeron los hex que coincidían exactamente con un token; el resto (`#b4a99d`, `#8a8175`,
`#1c1611`, `#5c5348`…) se dejó intacto porque no existe token equivalente.

### T2 — `app/sitemap.ts` y `app/robots.ts` · [SEO] ✅
Sitemap con `/`, `/blog`, `/nosotros`, `/reloj-de-ajedrez` y cada `/blog/<slug>`; robots bloquea
`/dashboard`, `/classes`, `/studies`, `/courses`, `/trainer`, `/admin` y `/api`. URL base desde
`NEXT_PUBLIC_SITE_URL` (añadida a `.env.example`).

### T3 — `enums/chess-pieces.enum.ts` → `as const` · [Arquitectura] ✅
Ahora `constants/chess-pieces.const.ts`; actualizados los usos del hero y eliminada la carpeta `enums/`.

### T4 — Clase `landingPage` · [CSS] ✅
Renombrada a `landing-page` en `app/(frontend)/landing-page.tsx`.

### T5 — `priority` → `preload` en `next/image` · [SEO / Next 16] ✅
Única aparición: el `<Image>` del hero.

### T6 — SAN en español en el MoveTree · [Ajedrez / UX] ✅
`sanToSpanish()` exportada desde `lib/chess/notation.ts` (traduce también la pieza de coronación,
`e8=Q` → `e8=D`, y respeta los enroques) y usada por `move-tree.comp.tsx`.

### T7 — Crear estudio e importar PGN · [Plataforma] ✅
`services/studies/studies.actions.ts` con `createStudy` e `importPgnGames`: valida el tipo contra el
catálogo, comprueba que la base es del alumno antes de escribir (nunca toca bases de curso), parsea
con `chessops/pgn` volcando cabeceras a columnas, y acota tamaño de PGN y número de partidas.
Formularios planos (server actions) en el listado y en el detalle de estudio.

### T8 — Vitest y primeras pruebas · [Calidad] ✅
`vitest.config.mts` + `npm test` / `npm run test:watch`. 33 pruebas en `lib/chess/pgn-tree.test.ts`,
`lib/chess/notation.test.ts` y `constants/platform/study-codes.test.ts`. Una de ellas documenta un
hueco real del parser (ver punto 11b de `MEJORAS.md`).

### T9 — README · [Docs] ✅
Sección en español con requisitos, puesta en marcha, tabla de scripts, usuario demo, mapa de rutas
y arquitectura.

### T10 — `loading.tsx` por sección · [UX] ✅
Uno en cada área de `app/(platform)/` reutilizando `LoadingPanel`.

# TODOs delegables

Tareas sencillas y autocontenidas para ejecutar por separado. Antes de tocar nada, respeta estas
reglas del proyecto (no negociables):

- **CSS**: BEM estricto estilo Yandex (`bloque__elemento`, modificador `_clave_valor`, booleano `_abierto`),
  archivos kebab-case, cada archivo CSS anida TODAS sus reglas bajo su selector raíz con nesting nativo (`&`),
  media queries anidadas dentro del bloque, desktop-first (`max-width`). NO Tailwind, NO CSS-in-JS.
- **Archivos**: kebab-case con sufijos `.comp.tsx`, `.section.tsx`, `.hook.ts`, `.const.ts`, etc.
  Named exports (default sólo en archivos de App Router). Sin barrels: imports con ruta completa `@/...`.
- **Componentes**: Server Components por defecto; `"use client"` sólo en la hoja que posee estado.
- **Datos**: la UI nunca llama Prisma directo; siempre `services/<dominio>/*.service.ts`.
- Al terminar cada tarea: `npx tsc --noEmit` y `npm run lint` deben pasar.

---

## T1 — Sustituir hex hardcodeados por tokens CSS (sitio público) · [CSS]
En `components/sections/**` y `app/(frontend)/**` hay colores literales (`#ff9143`, `#16110d`,
`#b4a99d`, `#f2ede7`, `#aca7a3`...) aunque `app/(frontend)/globals.css` define variables
(`--color-primary`, `--background`, `--foreground`, `--color-normal-gray`...).

- Reemplazar cada hex por su `var(--color-*)` equivalente SOLO cuando el valor coincida exactamente
  con un token existente; si no existe token, dejar el hex como está (no inventar tokens nuevos).
- No cambiar ningún valor visual: es una sustitución 1:1.

## T2 — `app/sitemap.ts` y `app/robots.ts` · [SEO]
- `robots.ts`: permitir todo excepto `/dashboard`, `/classes`, `/studies`, `/courses`, `/trainer`,
  `/admin`, `/api`.
- `sitemap.ts`: incluir `/`, `/blog`, `/nosotros`, `/reloj-de-ajedrez` y cada `/blog/[slug]`
  usando `getArticles()` de `services/articles/articles.service.ts` (campo `slug`).
- Base URL desde `process.env.NEXT_PUBLIC_SITE_URL` con fallback `https://365diasdeajedrez.com`;
  añadir la variable a `.env.example` con comentario en español.

## T3 — Migrar `enums/chess-pieces.enum.ts` a objeto `as const` · [Arquitectura]
El proyecto ya no usa enums de TS (ver `constants/platform/*.const.ts` como referencia de estilo).
- Convertir `ChessPieceUnicode` a `const CHESS_PIECE_UNICODE = { ... } as const` + tipo derivado,
  en un archivo nuevo `constants/chess-pieces.const.ts`.
- Actualizar los usos (buscar `chess-pieces.enum` — está en las secciones del hero de Home) y
  eliminar el archivo viejo.

## T4 — Limpiar la clase `landingPage` · [CSS]
`app/(frontend)/landing-page.tsx` envuelve todo en `className="landingPage"`, clase sin ninguna
regla CSS y fuera de la convención kebab/BEM. Renombrarla a `landing-page` (sin crear estilos).

## T5 — `priority` → `preload` en `next/image` · [SEO / Next 16]
Next 16 deprecó la prop `priority` de `next/image` en favor de `preload`. Buscar
`priority` en todos los `.tsx` que usen `next/image` y renombrar la prop. No tocar nada más.

## T6 — SAN en español en el MoveTree · [Ajedrez / UX]
`components/common/game-viewer/move-tree.comp.tsx` muestra SAN internacional (N, B, R, Q, K).
El resto de la plataforma usa letras españolas (C, A, T, D, R) — ver `SPANISH_LETTER` en
`lib/chess/notation.ts`.
- Exportar desde `lib/chess/notation.ts` una función `sanToSpanish(san: string): string` que
  reutilice esa lógica (cuidado con el enroque `O-O`/`O-O-O`: no se traduce).
- Usarla en `moveLabel()` de `move-tree.comp.tsx`.

## T7 — Crear estudio e importar PGN (v1 mínima) · [Plataforma / Funcionalidad]
En `/studies` faltan las acciones «Crear estudio» e «Importar partidas» (spec §8).
- Crear `services/studies/studies.actions.ts` (`"use server"`) con:
  - `createStudy(formData)`: lee `name`, `description`, `kindCode` (validar contra
    `DATABASE_KIND` de `constants/platform/study-codes.const.ts`); crea `GameDatabase` con
    `ownerType` USER (connect por code), `user` = `getCurrentUser()` (importar de
    `lib/platform-auth/current-user.ts`); `revalidatePath("/studies")`.
  - `importPgnGames(studyId, formData)`: lee un `textarea` con PGN; separar partidas con
    `parsePgn` de `chessops/pgn` (una fila `Game` por partida, cabeceras White/Black/Event/
    Site/Result/ECO a columnas — resultado con `GAME_RESULT_BY_PGN_TOKEN`); `source` = PGN_IMPORT;
    verificar que la base pertenece al usuario actual (userId) antes de escribir.
- UI: en `studies-list.section.tsx` un formulario plano de crear estudio (input + select de tipo +
  botón); en `study-detail.section.tsx` (solo si `!study.isCourseStudy`) un `<textarea>` para pegar
  PGN + botón importar. Estética mínima con las clases `.platform-button` / `.platform-card`.

## T8 — Setup de Vitest + primeras pruebas · [Calidad]
- Añadir `vitest` como devDependency y script `"test": "vitest run"`.
- Tests en `lib/chess/pgn-tree.test.ts`:
  1. PGN con variante y comentario (usar el de la lección «¿Qué es la Siciliana?» en
     `prisma/seed-data.ts`) → el árbol tiene la variante como `children[1]` del nodo correcto,
     el comentario limpio (sin `[%cal]`/`[%csl]`) y shapes con brush correcto.
  2. `nextPathOf`/`parentPathOf`/`endPathOf` sobre ese árbol.
  3. PGN con cabecera FEN (lección Lucena del seed) → `initialFen` respeta la cabecera.
  4. PGN vacío/basura → `parsePgnTree` devuelve null o árbol sin hijos, sin lanzar.
- Test de `lib/chess/notation.ts` (filas numeradas) y de `GAME_RESULT_BY_PGN_TOKEN`.

## T9 — README: sección de la plataforma · [Docs]
Añadir al README (o crearlo si no existe) una sección en español: requisitos
(`PLATFORM_DATABASE_URL` en `.env.local`, separada de la DB de Payload), comandos
(`npm run db:generate`, `db:migrate`, `db:seed`, `db:studio`), usuario demo
(`alumno.demo@365diasdeajedrez.com`), y el mapa de rutas de la plataforma
(`/dashboard`, `/classes`, `/studies`, `/courses`, `/trainer`).

## T10 — Estados `loading.tsx` por sección de plataforma · [UX]
Hoy sólo existe `app/(platform)/loading.tsx` global. Crear `loading.tsx` en
`app/(platform)/{dashboard,classes,studies,courses,trainer}/` reutilizando
`components/common/loading-panel.comp.tsx` (idéntico al global, 4 líneas cada uno), para que la
navegación interna muestre el spinner dentro del shell sin parpadear la página entera.

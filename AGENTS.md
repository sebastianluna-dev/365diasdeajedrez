<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Convenciones del proyecto

Resumen de lo que explica `README.md` («Arquitectura en breve»). Si algo de aquí y el código discrepan, manda el código.

- **Tres piezas en una app Next 16**: sitio público `app/(frontend)`, CMS Payload `app/(payload)` (`/admin`, base `DATABASE_URI`) y plataforma autenticada `app/(platform)` + `app/(auth)` (Prisma 7 sobre `PLATFORM_DATABASE_URL`, una base distinta y sin tablas compartidas).
- **Datos**: la UI nunca llama a Prisma; siempre `services/<dominio>/{service,mapper,types}.ts` (más `.actions.ts` para server actions). Catálogos con `code` en vez de enums. El PGN es la fuente del contenido ajedrecístico.
- **Auth**: `lib/platform-auth/current-user.ts` es el DAL; toda página y server action de la plataforma resuelve al usuario ahí, nunca desde el cliente. `requireTeacher()`/`requireStaff()` abren cada página y action de `/profesor` y `/administracion`. `proxy.ts` sólo mira si existe la cookie. Una ruta nueva de `app/(platform)` se añade a `PROTECTED_PATH_PREFIXES` y al matcher del proxy (`proxy.test.ts` lo vigila).
- **Archivos**: kebab-case con sufijos `.comp.tsx`, `.section.tsx`, `.hook.ts`, `.const.ts`; named exports (default sólo en archivos de App Router); sin barrels, imports `@/...`.
- **Componentes**: Server Components por defecto; `"use client"` sólo en la hoja que tiene el estado. Imágenes con `next/image`, nunca `<img>`. Copy en español.
- **CSS**: BEM estricto (`bloque__elemento`, modificador `_clave_valor`), un archivo por componente y TODAS sus reglas anidadas bajo el selector raíz con nesting nativo (`&`), media queries dentro del bloque, desktop-first. Tokens `--color-*` (`app/(frontend)/globals.css`) y `--platform-*` (`app/(platform)/platform.css`). Sin Tailwind ni CSS-in-JS.
- **Deuda**: lo que se encuentra y no se arregla va a `MEJORAS.md` (área, prioridad y cómo abordarlo); las tareas mecánicas, a `todos.md`.
- **Documentación**: la larga, en inglés, vive en `docs/` (sitio Nextra con su propio `package.json`; `cd docs && npm run dev`). Si un cambio altera algo que describe, se actualiza la página en el mismo commit. `README.md` sigue siendo la referencia rápida en español.
- **Antes de dar algo por terminado**: `npm run typecheck`, `npm run lint` y `npm test` en verde. Rendimiento, siempre contra `npm run build && npm run start`, nunca contra `next dev`.

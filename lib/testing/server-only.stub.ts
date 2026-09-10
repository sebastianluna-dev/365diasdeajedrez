// Sustituto de "server-only" para Vitest.
//
// En la app, `import "server-only"` lo resuelve Next (y lanza si el módulo
// acaba en un Client Component). Vitest no conoce ese alias y el paquete no
// está instalado, así que sin este archivo vacío ningún módulo de la capa de
// servidor —`services/shared/form-data.ts`, `lib/rate-limit.ts`…— se podía ni
// importar desde una prueba. Ver `vitest.config.mts`.

export {};

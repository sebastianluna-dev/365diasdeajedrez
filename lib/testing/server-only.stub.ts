// Stand-in for "server-only" in Vitest.
//
// In the app, `import "server-only"` is resolved by Next (and throws if the
// module ends up in a Client Component). Vitest does not know that alias and the
// package is not installed, so without this empty file no server-layer module
// — `services/shared/form-schema.ts`, `lib/rate-limit.ts`… — could even be
// imported from a test. See `vitest.config.mts`.

export {};

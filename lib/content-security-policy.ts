import { LOGIN_PATH, PROTECTED_PATH_PREFIXES } from "../constants/platform/auth.const";

// The Content-Security-Policy of the three products, written in one place.
//
// - The PLATFORM (its private area and its door, the login page) is rendered
//   per request, so it gets a nonce: `proxy.ts` makes a fresh one for every
//   request and Next puts it on its own scripts, and `'strict-dynamic'` lets
//   those load the chunks they import. An injected `<script>` has no nonce
//   and does not run.
// - The public SITE is prerendered, and a nonce would make every page
//   dynamic (and lose the CDN's cache): its policy, sent by `next.config.ts`,
//   allows inline scripts — Google Analytics' and the Meta Pixel's snippets —
//   and names the hosts its scripts, images and beacons come from.
// - Payload's panel (`/admin`) is the site's policy plus the CDN its code
//   editor (Monaco) loads itself from.
//
// Pure module, imported with relative paths: `next.config.ts` and
// `proxy.ts` use it, and so do the tests.

export type PolicyTarget = "platform" | "site" | "admin";

interface PolicyOptions {
  target: PolicyTarget;
  /** The request's nonce: the platform's policy requires one, the others take none. */
  nonce?: string;
  /** `next dev`: React needs `eval` for its debugging stacks, and the page is served over plain http. */
  isDev: boolean;
}

/** Cloudinary: the images (`res`) and the browser's signed uploads (`api`, `use-image-upload.hook.ts`). */
const CLOUDINARY_IMAGES = "https://res.cloudinary.com";
const CLOUDINARY_UPLOADS = "https://api.cloudinary.com";

/** Google Analytics 4 (`google-analytics.comp.tsx`): the script, and where it sends its hits. */
const GOOGLE_ANALYTICS = {
  scripts: ["https://www.googletagmanager.com"],
  connect: ["https://www.googletagmanager.com", "https://*.google-analytics.com", "https://*.analytics.google.com"],
  images: ["https://www.googletagmanager.com", "https://*.google-analytics.com"],
};

/** The Meta Pixel (`meta-pixel.comp.tsx`): its script, its beacons, and the `<noscript>` image. */
const META_PIXEL = {
  scripts: ["https://connect.facebook.net"],
  connect: ["https://www.facebook.com", "https://connect.facebook.net"],
  images: ["https://www.facebook.com"],
};

/** Where Payload's code editor loads Monaco from (`@monaco-editor/loader`'s default), for the JSON fields. */
const MONACO_CDN = "https://cdn.jsdelivr.net";

/**
 * The policy as one header value. Every target shares the base: nothing from
 * another origin unless named, no plugins, no `<base>`, forms only to this
 * origin, never framed (as `X-Frame-Options: DENY` already says), and
 * `'wasm-unsafe-eval'` for the engine, which compiles WebAssembly. Styles
 * allow inline ones in every target: React writes `style` attributes, which a
 * nonce cannot cover.
 */
export function contentSecurityPolicy({ target, nonce, isDev }: PolicyOptions): string {
  if (target === "platform" && !nonce) throw new Error("The platform's policy needs the request's nonce.");
  if (target !== "platform" && nonce) throw new Error(`The ${target}'s policy is static and takes no nonce.`);

  const devEval = isDev ? ["'unsafe-eval'"] : [];
  // Development tools that talk to the page over a local websocket of their
  // own (VS Code's Console Ninja, for one); `next dev`'s own is 'self'.
  const devSockets = isDev ? ["ws://127.0.0.1:*", "ws://localhost:*"] : [];
  const admin = target === "admin" ? [MONACO_CDN] : [];
  const tracks = target === "platform" ? [] : [GOOGLE_ANALYTICS, META_PIXEL];

  const scripts =
    target === "platform"
      ? ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", "'wasm-unsafe-eval'", ...devEval]
      : [
          "'self'",
          "'unsafe-inline'",
          "'wasm-unsafe-eval'",
          ...devEval,
          ...tracks.flatMap((track) => track.scripts),
          ...admin,
        ];

  const directives: [string, string[]][] = [
    ["default-src", ["'self'"]],
    ["script-src", scripts],
    ["style-src", ["'self'", "'unsafe-inline'", ...admin]],
    ["img-src", ["'self'", "data:", "blob:", CLOUDINARY_IMAGES, ...tracks.flatMap((track) => track.images)]],
    ["font-src", ["'self'", "data:", ...admin]],
    ["connect-src", ["'self'", CLOUDINARY_UPLOADS, ...tracks.flatMap((track) => track.connect), ...devSockets]],
    ["worker-src", ["'self'", "blob:"]],
    ["object-src", ["'none'"]],
    ["base-uri", ["'self'"]],
    ["form-action", ["'self'"]],
    ["frame-ancestors", ["'none'"]],
  ];
  // Over plain http in development it would send every request to an https
  // that `next dev` does not serve.
  if (!isDev) directives.push(["upgrade-insecure-requests", []]);

  return directives.map(([name, sources]) => [name, ...sources].join(" ")).join("; ");
}

/** The paths whose pages carry the platform's policy, with a nonce, set by `proxy.ts`. */
export const NONCE_PATH_PREFIXES: readonly string[] = [...PROTECTED_PATH_PREFIXES, LOGIN_PATH];

/** Payload's panel. */
export const ADMIN_PATH_PREFIX = "/admin";

/**
 * The `source` of `next.config.ts`'s rule for the site's policy: every path
 * but the platform's, which `proxy.ts` answers, and the panel's, which has its
 * own rule. A path is left out only when its first segment is one of them, so
 * `/cursos-de-ajedrez` would still be the site's.
 */
export function sitePolicySource(): string {
  const segments = [...NONCE_PATH_PREFIXES, ADMIN_PATH_PREFIX].map((prefix) => prefix.slice(1)).join("|");
  return `/((?!(?:${segments})(?:/|$)).*)`;
}

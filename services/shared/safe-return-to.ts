// Return destination arriving from the client (a `?next=` or a hidden
// `returnTo` field). Only internal paths are accepted: without this,
// `redirect()` from a trusted origin becomes a phishing springboard towards
// `https://another-site`. `//host` and `/\\host` are absolute URLs for the
// browser, hence the second check.
//
// Pure module and without "server-only" so the actions and their tests share it.

export function safeReturnTo(raw: string, fallback: string): string {
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  return raw;
}

/** Adds `?error=<code>` to an internal path respecting the query it already carries. */
export function withErrorParam(path: string, code: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}error=${encodeURIComponent(code)}`;
}

import { IMPORT_REPORT_PARAM } from "@/constants/platform/pgn-import-messages.const";

// What a server action leaves in the address it redirects to, for the page to
// say how it went: the code of a refusal (`?error=throttled`, written by
// `withErrorParam`) and the result of a PGN import (`?importadas=12.1.0`,
// written by `withImportReport`). Both are said once. The page draws them from
// the address on the server, so for as long as they stayed in it every later
// render said them again — the one an action that only revalidates asks for, a
// refresh, going back to the page — over a screen where they were no longer
// true. The platform's shell takes them out once the page has drawn them
// (`ClearResultParams`).
//
// Pure module and without "server-only": the shell's client leaf, the actions
// and their tests share it.

/** The parameter the code of a refused action travels in. */
export const ERROR_PARAM = "error";

/** Every parameter that tells the result of an action. */
export const RESULT_PARAMS: readonly string[] = [ERROR_PARAM, IMPORT_REPORT_PARAM];

/**
 * The address without the result of an action — path, the rest of the query
 * as it was written, and the anchor — or null when it carries none, so there
 * is nothing to rewrite.
 */
export function withoutResultParams(location: Pick<Location, "pathname" | "search" | "hash">): string | null {
  const pairs = location.search.replace(/^\?/, "").split("&").filter(Boolean);
  // The name of each pair is read by URLSearchParams, which decodes it the way
  // the page will (`%65rror` is `error`) and never throws on a bad escape.
  const kept = pairs.filter((pair) => !RESULT_PARAMS.includes([...new URLSearchParams(pair).keys()][0] ?? ""));
  if (kept.length === pairs.length) return null;
  return `${location.pathname}${kept.length > 0 ? `?${kept.join("&")}` : ""}${location.hash}`;
}

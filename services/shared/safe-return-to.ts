// Return destination arriving from the client (a `?next=` or a hidden
// `returnTo` field). Only internal paths are accepted: without this,
// `redirect()` from a trusted origin becomes a phishing springboard towards
// `https://another-site`. `//host` and `/\\host` are absolute URLs for the
// browser, hence the second check.
//
// Pure module and without "server-only" so the actions and their tests share it.

import { z } from "zod";
import { ERROR_PARAM, NOTICE_PARAM } from "@/lib/result-params";
import { formReturnTo, parseForm } from "@/services/shared/form-schema";

const RETURN_TO_SCHEMA = z.object({ returnTo: formReturnTo() });

/** The page the form sits on, still to be checked by `safeReturnTo`. */
export function readReturnTo(formData: FormData): string {
  const parsed = parseForm(RETURN_TO_SCHEMA, formData);
  return parsed.ok ? parsed.data.returnTo : "";
}

export function safeReturnTo(raw: string, fallback: string): string {
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  return raw;
}

/**
 * Adds `?error=<code>` to an internal path respecting the query it already
 * carries. The address keeps it only until the page has drawn it: see
 * `lib/result-params.ts`.
 */
export function withErrorParam(path: string, code: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${ERROR_PARAM}=${encodeURIComponent(code)}`;
}

/** An argument a notice may carry: a whole number or an id (a uuid, or the eight characters of a study's or a game's). */
const NOTICE_ARG = /^(?:\d+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[A-Za-z0-9]{8})$/;

/**
 * Adds `?aviso=<code>[.arg…]` to an internal path: a success the page says
 * once (`readNotice`, `constants/platform/class-messages.const.ts`). The
 * arguments are numbers or ids, never a name — a name in the address would
 * stay in the history and the logs —, and one that is neither throws, so no
 * action can slip one in.
 */
export function withNoticeParam(path: string, code: string, args: readonly (number | string)[] = []): string {
  for (const arg of args) {
    if (!NOTICE_ARG.test(String(arg))) throw new Error(`A notice carries numbers or ids, not «${String(arg)}».`);
  }
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${NOTICE_PARAM}=${encodeURIComponent([code, ...args.map(String)].join("."))}`;
}

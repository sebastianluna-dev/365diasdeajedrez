"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { withoutResultParams } from "@/lib/result-params";

/**
 * Takes the result of an action — `?error=`, `?importadas=` — out of the
 * address once the page has drawn it.
 *
 * The notice was drawn on the server from the address, and it stays on screen:
 * rewriting the address with `history.replaceState` moves the router's URL and
 * nothing else, no request and no render. What changes is the NEXT render of
 * the page — the one an action that only revalidates asks for, a refresh,
 * coming back to it — which reads an address without the result and no longer
 * says it. Before, «Se importaron 12 partidas.» stayed over a list one of them
 * had just been removed from, and an error over a form already put right,
 * until the person went to another page.
 *
 * It draws nothing. It sits in the platform's shell, so every page has it, and
 * it runs again whenever the query changes: an action that redirects with a
 * new result lands on the same page.
 */
export function ClearResultParams(): null {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Not now, but once the effects of this commit have run. On the first load
    // this effect runs before the router's own (a parent's effects run after
    // its children's), and the router follows only the `replaceState` calls
    // made after it has hooked them: one made earlier moves the address bar but
    // not the router, which posts the next action to the old address and puts
    // the result back in it (tried in a built app, 2026-10-02).
    const timer = window.setTimeout(() => {
      const clean = withoutResultParams(window.location);
      if (clean !== null) window.history.replaceState(null, "", clean);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [searchParams]);

  return null;
}

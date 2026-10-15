"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { meetingRefreshDelay } from "./meeting-refresh";

/** While a class runs, the page asks again this often, so the words follow the clock. */
const LIVE_REFRESH_MS = 60_000;

interface RefreshAtInstantsOptions {
  /** The class is running: refresh every minute as well. */
  live?: boolean;
  /**
   * The link should be here by now and is not (the browser's clock is ahead of
   * the server's): ask again, waiting longer each time (`meetingRefreshDelay`).
   */
  retry?: boolean;
}

/**
 * Asks the server for the page again at each instant the class changes
 * phase (`classPhaseInstants`): when the link opens, when the class starts,
 * when it ends, when the link closes. The link never reaches the browser
 * ahead of time, so the refresh is how the button appears; the words of the
 * countdown change on their own.
 */
export function useRefreshAtInstants(instantsIso: readonly string[], options: RefreshAtInstantsOptions = {}) {
  const router = useRouter();
  const key = instantsIso.join("|");

  useEffect(() => {
    const now = Date.now();
    const timers = key
      .split("|")
      .filter(Boolean)
      .map((iso) => Date.parse(iso) - now + 500)
      .filter((delay) => delay > 0 && delay < 2_147_000_000)
      .map((delay) => setTimeout(() => router.refresh(), delay));
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [key, router]);

  useEffect(() => {
    if (!options.live) return;
    const timer = setInterval(() => router.refresh(), LIVE_REFRESH_MS);
    return () => clearInterval(timer);
  }, [options.live, router]);

  useEffect(() => {
    if (!options.retry) return;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const again = () => {
      router.refresh();
      attempt += 1;
      timer = setTimeout(again, meetingRefreshDelay(attempt));
    };
    timer = setTimeout(again, meetingRefreshDelay(0));
    return () => clearTimeout(timer);
  }, [options.retry, router]);
}

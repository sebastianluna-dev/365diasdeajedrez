import { useEffect, useState } from "react";

/** How long a closed popup stays mounted for its exit animation. Matches the stylesheets. */
export const POPUP_EXIT_MS = 120;

/**
 * Keeps a popup's value around for `exitMs` after it is closed, so the host
 * can render it once more with a closing modifier and let the exit play.
 *
 * `value` is what the host renders the popup from (its target, or `true` for
 * a menu with no data), `null` when it is closed. The result is what to
 * render: the value itself while open, the LAST value with `closing` set
 * while the exit runs, and `null` once it is over. Reopening during an exit
 * cancels it. Under reduced motion the stylesheets show nothing for those
 * milliseconds, which reads as an immediate close.
 */
export function useLingering<T>(value: T | null, exitMs = POPUP_EXIT_MS): { value: T | null; closing: boolean } {
  const [shown, setShown] = useState(value);

  // Adjusted during render, not in an effect, so an opening never paints a
  // frame with the previous state. `closing` is derived, not stored: it is
  // exactly "closed by the host, still shown here".
  if (value !== null && value !== shown) setShown(value);
  const closing = value === null && shown !== null;

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => setShown(null), exitMs);
    return () => window.clearTimeout(timer);
  }, [closing, exitMs]);

  return { value: shown, closing };
}

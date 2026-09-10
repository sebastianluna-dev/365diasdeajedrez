"use client";

// Viewer preference that lives in each person's browser: it is not account
// data, it does not travel to the server and it is not worth a database.
//
// It is exposed as an external store (`useSyncExternalStore`) and not as
// state filled by an effect, for two reasons: on the server there is no
// `localStorage`, so the first paint has to give the default value or
// hydration does not match; and several viewers on the same page share the
// setting, so muting one tells all of them.
//
// The access is wrapped: in a private window, or with site cookies blocked,
// `localStorage` does not fail by returning null but by THROWING.

export interface ViewerPreferences {
  sound: boolean;
}

export const DEFAULT_VIEWER_PREFERENCES: ViewerPreferences = { sound: true };

const STORAGE_KEY = "365-viewer-preferences";

/**
 * `getSnapshot` has to return ALWAYS the same reference while nothing
 * changes: if it built a new object on every call, React would read it as a
 * perpetual change and keep re-rendering non-stop.
 */
let cached: ViewerPreferences | null = null;
const listeners = new Set<() => void>();

function parse(raw: string | null): ViewerPreferences {
  if (!raw) return DEFAULT_VIEWER_PREFERENCES;
  try {
    const parsed = JSON.parse(raw) as Partial<ViewerPreferences>;
    return { sound: typeof parsed.sound === "boolean" ? parsed.sound : DEFAULT_VIEWER_PREFERENCES.sound };
  } catch {
    return DEFAULT_VIEWER_PREFERENCES;
  }
}

export function subscribeToViewerPreferences(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getViewerPreferences(): ViewerPreferences {
  if (cached) return cached;
  try {
    cached = parse(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    cached = DEFAULT_VIEWER_PREFERENCES;
  }
  return cached;
}

/** On the server there is nowhere to read from: always the default value. */
export function getServerViewerPreferences(): ViewerPreferences {
  return DEFAULT_VIEWER_PREFERENCES;
}

export function setViewerPreferences(preferences: ViewerPreferences): void {
  cached = preferences;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // With nowhere to store it, the preference lasts as long as the tab. That
    // is acceptable: muting the board is not important data.
  }
  for (const listener of listeners) listener();
}

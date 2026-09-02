"use client";

// Preferencias del visor que viven en el navegador de cada quien: no son datos
// de la cuenta, no viajan al servidor y no valen la pena en base de datos.
//
// Se expone como almacén externo (`useSyncExternalStore`) y no como estado con
// un efecto que lo rellena, por dos razones: en el servidor no hay
// `localStorage`, así que la primera pintada tiene que dar los valores por
// defecto o la hidratación no cuadra; y varios visores en la misma página
// comparten estas opciones, así que al cambiarlas en uno se enteran todos.
//
// Todo acceso va envuelto: en una ventana privada, o con las cookies de sitio
// bloqueadas, `localStorage` no falla devolviendo null sino LANZANDO.

export interface ViewerPreferences {
  sound: boolean;
  coordinates: boolean;
  animation: boolean;
}

export const DEFAULT_VIEWER_PREFERENCES: ViewerPreferences = {
  sound: true,
  coordinates: true,
  animation: true,
};

const STORAGE_KEY = "365-viewer-preferences";

/**
 * `getSnapshot` tiene que devolver SIEMPRE la misma referencia mientras no
 * cambie nada: si construyera un objeto nuevo en cada llamada, React lo leería
 * como un cambio perpetuo y se quedaría redibujando sin parar.
 */
let cached: ViewerPreferences | null = null;
const listeners = new Set<() => void>();

function parse(raw: string | null): ViewerPreferences {
  if (!raw) return DEFAULT_VIEWER_PREFERENCES;
  try {
    const parsed = JSON.parse(raw) as Partial<ViewerPreferences>;
    return {
      sound: typeof parsed.sound === "boolean" ? parsed.sound : DEFAULT_VIEWER_PREFERENCES.sound,
      coordinates:
        typeof parsed.coordinates === "boolean" ? parsed.coordinates : DEFAULT_VIEWER_PREFERENCES.coordinates,
      animation: typeof parsed.animation === "boolean" ? parsed.animation : DEFAULT_VIEWER_PREFERENCES.animation,
    };
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

/** En el servidor no hay dónde leer: siempre los valores por defecto. */
export function getServerViewerPreferences(): ViewerPreferences {
  return DEFAULT_VIEWER_PREFERENCES;
}

export function setViewerPreferences(preferences: ViewerPreferences): void {
  cached = preferences;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Sin sitio donde guardar, la preferencia dura lo que la pestaña. Es
    // aceptable: ninguna de estas opciones es importante.
  }
  for (const listener of listeners) listener();
}

"use client";

// Preferencia del visor que vive en el navegador de cada quien: no es un dato
// de la cuenta, no viaja al servidor y no vale la pena en base de datos.
//
// Se expone como almacén externo (`useSyncExternalStore`) y no como estado con
// un efecto que lo rellena, por dos razones: en el servidor no hay
// `localStorage`, así que la primera pintada tiene que dar el valor por
// defecto o la hidratación no cuadra; y varios visores en la misma página
// comparten el ajuste, así que al silenciar uno se enteran todos.
//
// El acceso va envuelto: en una ventana privada, o con las cookies de sitio
// bloqueadas, `localStorage` no falla devolviendo null sino LANZANDO.

export interface ViewerPreferences {
  sound: boolean;
}

export const DEFAULT_VIEWER_PREFERENCES: ViewerPreferences = { sound: true };

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

/** En el servidor no hay dónde leer: siempre el valor por defecto. */
export function getServerViewerPreferences(): ViewerPreferences {
  return DEFAULT_VIEWER_PREFERENCES;
}

export function setViewerPreferences(preferences: ViewerPreferences): void {
  cached = preferences;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Sin sitio donde guardar, la preferencia dura lo que la pestaña. Es
    // aceptable: silenciar el tablero no es un dato importante.
  }
  for (const listener of listeners) listener();
}

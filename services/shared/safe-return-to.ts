// Destino de vuelta que llega del cliente (un `?next=` o un campo oculto
// `returnTo`). Sólo se aceptan rutas internas: sin esto, `redirect()` desde un
// origen de confianza se convierte en un trampolín de phishing hacia
// `https://otro-sitio`. `//host` y `/\\host` son URLs absolutas para el
// navegador, de ahí la segunda comprobación.
//
// Módulo puro y sin "server-only" para que lo compartan las actions y sus
// pruebas.

export function safeReturnTo(raw: string, fallback: string): string {
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  return raw;
}

/** Añade `?error=<code>` a una ruta interna respetando la query que ya traiga. */
export function withErrorParam(path: string, code: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}error=${encodeURIComponent(code)}`;
}

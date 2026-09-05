// Reencuadre de una imagen de Cloudinary, escribiendo en su URL.
//
// Cloudinary recorta al vuelo con lo que se le ponga entre `/upload/` y el
// identificador del archivo, así que cambiar el encuadre NO exige volver a
// subir nada: se reescribe la URL y ya. Por eso vive aquí, en un módulo puro,
// y no en el componente.
//
// El recorte es siempre `c_fill` a la proporción pedida: la portada se enseña
// en 21:9 y una imagen que no lo sea se vería con bandas o deformada. `g_auto`
// deja que Cloudinary elija qué parte conservar.
//
// OJO con lo que esto NO puede hacer: si la imagen ya viene en la proporción de
// destino, `c_fill` no recorta nada y la gravedad da igual —comprobado: las
// tres portadas del catálogo son 21:9 exactos y los cuatro encuadres devuelven
// el MISMO archivo—. Reencuadrar de verdad exige acercar la imagen y elegir la
// región, que es otro asunto.

/** Por dónde se queda la imagen al recortarla. Sólo se usa el automático. */
type CropGravity = "auto";

/**
 * Un tramo de transformaciones de Cloudinary son parámetros `x_y` separados por
 * comas: `c_fill,ar_21:9,g_auto`. Se distingue así del identificador del
 * archivo y de la versión (`v1788629615`), que es lo que suele venir después.
 */
function isTransformSegment(segment: string): boolean {
  if (/^v\d+$/.test(segment)) return false;
  return segment.split(",").every((part) => /^[a-z]+_[^,]+$/.test(part));
}

/**
 * La misma URL con el encuadre pedido.
 *
 * Devuelve la URL tal cual si no es de Cloudinary: quien la guardó a mano —o
 * quien tenga una imagen antigua— no debería ver cómo se la estropeamos.
 */
export function withCoverCrop(url: string, gravity: CropGravity, aspectRatio = "21:9"): string {
  const marker = "/upload/";
  const at = url.indexOf(marker);
  if (!url.includes("res.cloudinary.com") || at === -1) return url;

  const head = url.slice(0, at + marker.length);
  const rest = url.slice(at + marker.length);
  const [first, ...tail] = rest.split("/");

  // Si ya había transformaciones se sustituyen enteras: acumularlas dejaría
  // recortes encadenados y cada reencuadre se aplicaría sobre el anterior.
  const body = isTransformSegment(first) ? tail.join("/") : rest;
  return `${head}c_fill,ar_${aspectRatio},g_${gravity}/${body}`;
}

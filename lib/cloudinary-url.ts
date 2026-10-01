// Reframing a Cloudinary image by writing in its URL.
//
// Cloudinary crops on the fly with whatever is put between `/upload/` and the
// file identifier, so changing the framing does NOT require uploading anything
// again: the URL is rewritten and that is that. Which is why it lives here, in
// a pure module, and not in the component.
//
// The crop is always `c_fill` to the requested ratio: the cover is shown in
// 21:9 and an image that is not would be seen with bands or distorted. `g_auto`
// lets Cloudinary choose which part to keep.
//
// MIND what this CANNOT do: if the image already comes in the target ratio,
// `c_fill` crops nothing and the gravity makes no difference — verified: the
// catalog's three covers are exactly 21:9 and the four framings return the SAME
// file. Really reframing requires zooming in and choosing the region, which is
// another matter.

/**
 * The folder every platform upload goes to. It is repeated here, and not
 * imported from `lib/cloudinary.ts`, because that module is `server-only` and
 * this one is pure: what tells a platform asset from the site's media — which
 * Payload owns, one folder above — must be checkable in a test.
 */
const PLATFORM_FOLDER = "365-ajedrez/plataforma/";

/** Which part of the image is kept when cropping. Only the automatic one is used. */
type CropGravity = "auto";

/**
 * A stretch of Cloudinary transformations is `x_y` parameters separated by
 * commas: `c_fill,ar_21:9,g_auto`. That is how it is told apart from the file
 * identifier and the version (`v1788629615`), which is what usually comes next.
 */
function isTransformSegment(segment: string): boolean {
  if (/^v\d+$/.test(segment)) return false;
  return segment.split(",").every((part) => /^[a-z]+_[^,]+$/.test(part));
}

/**
 * The same URL with the requested framing.
 *
 * It returns the URL as is when it is not Cloudinary's: whoever stored it by
 * hand — or whoever has an old image — should not see us spoil it.
 */
export function withCoverCrop(url: string, gravity: CropGravity, aspectRatio = "21:9"): string {
  const marker = "/upload/";
  const at = url.indexOf(marker);
  if (!url.includes("res.cloudinary.com") || at === -1) return url;

  const head = url.slice(0, at + marker.length);
  const rest = url.slice(at + marker.length);
  const [first, ...tail] = rest.split("/");

  // If there were already transformations they are replaced whole: accumulating
  // them would leave chained crops and each reframing would apply over the previous one.
  const body = first !== undefined && isTransformSegment(first) ? tail.join("/") : rest;
  return `${head}c_fill,ar_${aspectRatio},g_${gravity}/${body}`;
}

/**
 * The public id of a platform image, from the URL that is stored: the part
 * Cloudinary names the asset by, which is NOT the whole path after `/upload/`.
 * A stored URL carries a transformation and a version before it
 * (`…/upload/c_fill,ar_21:9,g_auto/v1788629615/365-ajedrez/plataforma/x.jpg`)
 * and the id carries no extension.
 *
 * It returns nothing — and nothing is deleted — for anything that is not an
 * image of the platform's folder: a URL typed by hand, another host's, or the
 * site's media, which lives one folder above and belongs to Payload. This is
 * the guard that keeps a delete from reaching what we did not upload.
 */
export function platformPublicId(url: string): string | undefined {
  const marker = "/upload/";
  const at = url.indexOf(marker);
  if (!url.startsWith("https://res.cloudinary.com/") || at === -1) return undefined;

  const segments = url.slice(at + marker.length).split("/");
  // The transformation, if there is one, and the version, if there is one: both
  // are said by their shape, never by their position.
  while (segments.length > 0 && (isTransformSegment(segments[0] ?? "") || /^v\d+$/.test(segments[0] ?? ""))) {
    segments.shift();
  }

  const path = segments.join("/");
  if (!path.startsWith(PLATFORM_FOLDER)) return undefined;

  // The extension is not part of the id: with it, Cloudinary answers that
  // nothing was deleted.
  const withoutExtension = path.replace(/\.[a-z0-9]+$/i, "");
  return withoutExtension.length > PLATFORM_FOLDER.length ? withoutExtension : undefined;
}

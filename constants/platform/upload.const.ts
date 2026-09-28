// Limits of the images the staff uploads (course covers, and whatever comes).
//
// In a file apart because both sides check them: the browser before sending
// the file — to say so instantly instead of after the upload — and the
// server's signature, which fixes the admitted formats (`allowed_formats` is
// signed, so the browser cannot change it without invalidating it).
//
// The SIZE does not travel in the signature: Cloudinary's upload API has no
// maximum-weight parameter per request, so `IMAGE_MAX_BYTES` is only applied
// by the browser and the real ceiling is the account's plan/preset.

/** 5 MB. A well-exported cover does not exceed one or two. */
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/** What Cloudinary serves well and browsers display without surprises. */
export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

/** The same four, as Cloudinary names them in `allowed_formats`. */
export const IMAGE_ALLOWED_FORMATS = "jpg,png,webp,avif";

/** For the file picker's `accept`. */
export const IMAGE_ACCEPT = IMAGE_MIME_TYPES.join(",");

/** The figure the person is told, not the bytes. */
export const IMAGE_MAX_MB = Math.round(IMAGE_MAX_BYTES / (1024 * 1024));

/**
 * The limits as whoever uploads an image reads them, so no screen words them
 * on its own and they cannot drift from what is checked here.
 *
 * The four formats are `IMAGE_MIME_TYPES`', written out instead of derived
 * from them: "WebP" is a spelling, not something a `toUpperCase` gets right.
 */
export const IMAGE_LIMITS_TEXT = `JPG, PNG, WebP o AVIF, hasta ${IMAGE_MAX_MB} MB.`;

export function isAllowedImageType(type: string): boolean {
  return (IMAGE_MIME_TYPES as readonly string[]).includes(type);
}

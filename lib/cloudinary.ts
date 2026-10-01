import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { IMAGE_ALLOWED_FORMATS } from "@/constants/platform/upload.const";
import { platformPublicId } from "@/lib/cloudinary-url";
import { logError } from "@/lib/logger";

// Cloudinary for the AUTHENTICATED AREA (course covers, and whatever comes).
//
// The public site uploads through Payload, which brings its own adapter
// (lib/payload/cloudinary-adapter.ts) and configures the SDK on its own. Here
// one cannot depend on that having been loaded — they are two different entry
// points of the application — so it is configured again and said so.
//
// The credentials do NOT leave here. What travels to the browser is a SIGNATURE:
// an expiring string that authorises one specific upload to one specific folder.
// The file goes from the browser to Cloudinary without passing through our
// server, which besides dodges the body size cap of server actions — 3 MB
// here (`next.config.ts`, for the PGN import), less than many photos.

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

/** Where the platform's images land, kept apart from the site's. */
const PLATFORM_UPLOAD_FOLDER = "365-ajedrez/plataforma";

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  folder: string;
  /** Formats the signature admits; the browser forwards them as is. */
  allowedFormats: string;
  /** Seconds since the epoch; Cloudinary rejects an old signature. */
  timestamp: number;
  signature: string;
}

/**
 * Signs an upload to the platform's folder.
 *
 * Returns `null` when credentials are missing, instead of throwing: without
 * them the screen has to be able to go on showing the manual URL field, not
 * break.
 *
 * Exactly what is sent is signed: `folder`, `timestamp` and `allowed_formats`.
 * Cloudinary checks that the signature covers ALL the parameters that reach it
 * (except the file and the key), so the browser cannot add anything on its own
 * — neither change folder nor sneak in a video or a PDF — without invalidating
 * it. The maximum weight cannot be signed (the API has no such parameter): that
 * ceiling is the account's plan or preset.
 */
export function signPlatformUpload(): UploadSignature | null {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) return null;

  cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET, secure: true });

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { folder: PLATFORM_UPLOAD_FOLDER, timestamp, allowed_formats: IMAGE_ALLOWED_FORMATS },
    API_SECRET,
  );

  return {
    cloudName: CLOUD_NAME,
    apiKey: API_KEY,
    folder: PLATFORM_UPLOAD_FOLDER,
    allowedFormats: IMAGE_ALLOWED_FORMATS,
    timestamp,
    signature,
  };
}

/**
 * Deletes a platform image from Cloudinary. It is what is called when one is
 * replaced or taken away: until this, every change of mind left the old file
 * there for ever, paid for and pointed at by nobody.
 *
 * It does nothing — and says nothing — when the URL does not name an image of
 * the platform's folder (`platformPublicId` refuses another host, a URL typed
 * by hand and the site's media, which belong to Payload), and it NEVER throws:
 * the image was already saved when this runs, and failing here would turn a
 * finished save into an error in front of whoever saved it. A failure is a
 * warning in the log and one orphan asset, which is where we were before.
 */
export async function destroyPlatformAsset(url: string | null | undefined): Promise<void> {
  if (!url) return;
  const publicId = platformPublicId(url);
  if (!publicId || !CLOUD_NAME || !API_KEY || !API_SECRET) return;

  try {
    cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET, secure: true });
    await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
  } catch (error) {
    logError("cloudinary", "No se pudo borrar la imagen reemplazada", error, { publicId });
  }
}

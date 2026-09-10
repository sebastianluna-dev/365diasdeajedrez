"use server";

import { signPlatformUpload, type UploadSignature } from "@/lib/cloudinary";
import { requireStaff } from "@/lib/platform-auth/roles";
import { allowAction } from "@/lib/rate-limit";

/**
 * Signs an image upload to Cloudinary.
 *
 * Staff only: the signature AUTHORISES writing into our account, so it is
 * handed out by the same criterion as entering the panel. With a rate limit
 * because every signature is a potential upload.
 *
 * It returns `null` when credentials are missing or too many signatures have
 * been requested in a row. The component then falls back to asking for the URL
 * by hand, which is how it used to work: a cover that cannot be uploaded should
 * not prevent saving the rest of the form.
 *
 * To whoever is not staff it returns nothing: `requireStaff` redirects, just
 * like in the rest of the panel.
 */
export async function createUploadSignature(): Promise<UploadSignature | null> {
  const staff = await requireStaff();
  if (!(await allowAction(`${staff.user.id}:upload-sign`, 60, 60_000))) return null;

  return signPlatformUpload();
}

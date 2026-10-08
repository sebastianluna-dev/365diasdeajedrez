"use server";

import { destroyPlatformAsset, signPlatformUpload, type UploadSignature } from "@/lib/cloudinary";
import { requireStaff } from "@/lib/platform-auth/roles";
import { allowAction } from "@/lib/rate-limit";
import { isPlatformImageInUse } from "./media.service";

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

/**
 * Deletes from Cloudinary an image uploaded by a form that will not store it:
 * replaced or taken away before saving, or left behind when the form was
 * closed. The replaced image of a SAVED record is not this: the action that
 * saves it deletes it (`destroyReplaced`).
 *
 * The browser only says which image it uploaded; whether it is anybody's is
 * decided here, against every column that holds one, so an image a row points
 * at is never deleted — neither the one a form that was saved leaves behind
 * nor one a forged call names. Nothing comes back: a failure is one orphan
 * asset, which is where things were before.
 *
 * A form closed while its save is still on its way sends this after it, and
 * it is the save that runs first: the client dispatches server actions one at
 * a time (Next's «Mutating data» calls it an implementation detail), so by
 * then the row already points at the image.
 */
export async function discardUnsavedImage(url: string): Promise<void> {
  const staff = await requireStaff();
  if (typeof url !== "string") return;
  if (!(await allowAction(`${staff.user.id}:upload-discard`, 60, 60_000))) return;
  if (await isPlatformImageInUse(url)) return;

  await destroyPlatformAsset(url);
}

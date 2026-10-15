"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes, staffRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { z } from "zod";
import { transitionClassStatus } from "@/services/shared/class-status.service";
import { formOptionalUrl, formText, parseForm } from "@/services/shared/form-schema";
import { withErrorParam } from "@/services/shared/safe-return-to";

// The staff does NOT own the classes: exactly two support actions and nothing
// else. Blocks, attendance, metadata and participants belong to the teacher —
// if any of those appeared here, two roles would be editing the same thing
// without either being responsible.
//
// These are the OLD screens, kept until phase 6 retires them. The status is
// written only by `transitionClassStatus`; `setRecordingUrl` writes the
// recording directly, a documented exception that phase 5 removes.

const RECORDING_SCHEMA = z.object({ recordingUrl: formOptionalUrl(2000) });
const CANCEL_SCHEMA = z.object({ note: formText(300) });

function fail(path: string, code: string): never {
  redirect(withErrorParam(path, code));
}

/** Adds or corrects the recording's link. */
export async function setRecordingUrl(classId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.staffClassDetail(classId);
  if (!(await allowAction(`${staff.user.id}:class-recording`, 60, 60_000))) fail(detailPath, "throttled");

  const parsed = parseForm(RECORDING_SCHEMA, formData);
  if (!parsed.ok) fail(detailPath, "invalid");
  const { recordingUrl } = parsed.data;

  await getPlatformDb().class.update({ where: { id: classId }, data: { recordingUrl } });

  revalidatePath(detailPath);
  revalidatePath(platformRoutes.classDetail(classId));
}

/**
 * Cancels a class from support. It requires a note, kept as the cancellation's
 * reason (`cancelReason`, with who and when): the trace that the cancellation
 * did not come from the teacher, without touching the summary, which is theirs.
 * Cancelling is a class's deletion — there is no physical delete. A class that
 * is already finished or cancelled is not written (`written: false`).
 */
export async function cancelClassAsStaff(classId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.staffClassDetail(classId);
  if (!(await allowAction(`${staff.user.id}:class-cancel`, 60, 60_000))) fail(detailPath, "throttled");

  const parsed = parseForm(CANCEL_SCHEMA, formData);
  if (!parsed.ok) fail(detailPath, "invalid");
  const { note } = parsed.data;

  const { written } = await transitionClassStatus(getPlatformDb(), {
    classId,
    to: CLASS_STATUS.CANCELLED,
    actor: { userId: staff.user.id, role: "staff" },
    now: new Date(),
    cancel: { reason: note, note: null },
  });
  if (!written) fail(detailPath, "status");

  revalidatePath(detailPath);
  revalidatePath(staffRoutes.classes);
  revalidatePath(platformRoutes.classDetail(classId));
}

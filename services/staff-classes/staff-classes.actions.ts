"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes, staffRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { readText, readUrl } from "@/services/shared/form-data";

// The staff does NOT own the classes: exactly two support actions and nothing
// else. Blocks, attendance, metadata and participants belong to the teacher —
// if any of those appeared here, two roles would be editing the same thing
// without either being responsible.

const NOTE_MAX_LENGTH = 300;

function fail(path: string, code: string): never {
  redirect(`${path}?error=${code}`);
}

/** Adds or corrects the recording's link. */
export async function setRecordingUrl(classId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.staffClassDetail(classId);
  if (!(await allowAction(`${staff.user.id}:class-recording`, 60, 60_000))) fail(detailPath, "throttled");

  const raw = readText(formData, "recordingUrl");
  const recordingUrl = raw.length > 0 ? readUrl(formData, "recordingUrl") : null;
  if (raw.length > 0 && recordingUrl === null) fail(detailPath, "invalid");

  await getPlatformDb().class.update({ where: { id: classId }, data: { recordingUrl } });

  revalidatePath(detailPath);
  revalidatePath(platformRoutes.classDetail(classId));
}

/**
 * Cancels a class from support. It requires a note, which is prepended to the
 * summary with a date stamp: that way there is a trace that the cancellation did
 * not come from the teacher. Cancelling is a class's deletion — there is no
 * physical delete.
 */
export async function cancelClassAsStaff(classId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.staffClassDetail(classId);
  if (!(await allowAction(`${staff.user.id}:class-cancel`, 60, 60_000))) fail(detailPath, "throttled");

  const note = readText(formData, "note").slice(0, NOTE_MAX_LENGTH);
  if (note.length === 0) fail(detailPath, "invalid");

  const db = getPlatformDb();
  const current = await db.class.findUnique({
    where: { id: classId },
    select: { summary: true, status: { select: { code: true } } },
  });
  if (!current) fail(detailPath, "invalid");
  if (current.status.code === CLASS_STATUS.CANCELLED) fail(detailPath, "status");

  const stamp = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
  const trace = `[Soporte ${stamp}] ${note}`;

  await db.class.update({
    where: { id: classId },
    data: {
      status: { connect: { code: CLASS_STATUS.CANCELLED } },
      // The note is prepended and never replaces what the teacher may have written:
      // the summary is theirs.
      summary: current.summary ? `${trace}\n\n${current.summary}` : trace,
    },
  });

  revalidatePath(detailPath);
  revalidatePath(staffRoutes.classes);
  revalidatePath(platformRoutes.classDetail(classId));
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes, staffRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { readText, readUrl } from "@/services/shared/form-data";

// El staff NO es dueño de las clases: exactamente dos acciones de soporte y
// nada más. Bloques, asistencia, metadatos y participantes son del profesor —
// si alguna de esas apareciera aquí, dos roles estarían editando lo mismo sin
// que ninguno sea responsable.

const NOTE_MAX_LENGTH = 300;

function fail(path: string, code: string): never {
  redirect(`${path}?error=${code}`);
}

/** Añade o corrige el enlace de la grabación. */
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
 * Cancela una clase desde soporte. Exige una nota, que se antepone al resumen
 * con marca de fecha: así queda rastro de que la cancelación no vino del
 * profesor. Cancelar es el borrado de una clase — no hay borrado físico.
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
      // La nota se antepone y nunca sustituye a lo que hubiera escrito el
      // profesor: el resumen es suyo.
      summary: current.summary ? `${trace}\n\n${current.summary}` : trace,
    },
  });

  revalidatePath(detailPath);
  revalidatePath(staffRoutes.classes);
  revalidatePath(platformRoutes.classDetail(classId));
}

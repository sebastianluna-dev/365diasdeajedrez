"use server";

import { revalidatePath } from "next/cache";
import { isGoalOption } from "@/constants/platform/study-goal.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { readText } from "@/services/shared/form-data";

/**
 * Cambia el objetivo diario del alumno.
 *
 * El valor se comprueba contra la lista de opciones y no contra un rango: una
 * server action es alcanzable por POST directo, y aceptar «7 minutos» o
 * «100000» dejaría una barra que no se puede llenar o que se llena sola. Un
 * valor que no esté en la lista sale sin escribir, igual que el resto de las
 * actions del proyecto.
 */
export async function updateDailyGoal(formData: FormData): Promise<void> {
  const minutes = Number.parseInt(readText(formData, "goalMinutes"), 10);
  if (!Number.isInteger(minutes) || !isGoalOption(minutes)) return;

  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:daily-goal`, 20, 60_000))) return;

  await getPlatformDb().user.update({ where: { id: user.id }, data: { dailyGoalMinutes: minutes } });

  revalidatePath(platformRoutes.courses);
}

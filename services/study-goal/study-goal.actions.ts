"use server";

import { revalidatePath } from "next/cache";
import { isGoalOption } from "@/constants/platform/study-goal.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { readText } from "@/services/shared/form-data";

/**
 * Changes the student's daily goal.
 *
 * The value is checked against the list of options and not against a range: a
 * server action is reachable by direct POST, and accepting "7 minutes" or
 * "100000" would leave a bar that cannot be filled or that fills itself. A value
 * that is not in the list comes out without writing, like the rest of the
 * project's actions.
 */
export async function updateDailyGoal(formData: FormData): Promise<void> {
  const minutes = Number.parseInt(readText(formData, "goalMinutes"), 10);
  if (!Number.isInteger(minutes) || !isGoalOption(minutes)) return;

  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:daily-goal`, 20, 60_000))) return;

  await getPlatformDb().user.update({ where: { id: user.id }, data: { dailyGoalMinutes: minutes } });

  revalidatePath(platformRoutes.courses);
}

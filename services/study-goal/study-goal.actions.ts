"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isGoalOption } from "@/constants/platform/study-goal.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { z } from "zod";
import { formInt, parseForm } from "@/services/shared/form-schema";
import { withErrorParam } from "@/services/shared/safe-return-to";

/**
 * Changes the student's daily goal.
 *
 * The value is checked against the list of options and not against a range: a
 * server action is reachable by direct POST, and accepting "7 minutes" or
 * "100000" would leave a bar that cannot be filled or that fills itself. A value
 * that is not in the list comes out without writing, and the page says so.
 */
const GOAL_SCHEMA = z.object({ goalMinutes: formInt(1, 100_000).refine(isGoalOption) });

export async function updateDailyGoal(formData: FormData): Promise<void> {
  const parsed = parseForm(GOAL_SCHEMA, formData);
  if (!parsed.ok) redirect(withErrorParam(platformRoutes.courses, "goal"));
  const minutes = parsed.data.goalMinutes;

  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:daily-goal`, 20, 60_000)))
    redirect(withErrorParam(platformRoutes.courses, "throttled"));

  await getPlatformDb().user.update({ where: { id: user.id }, data: { dailyGoalMinutes: minutes } });

  revalidatePath(platformRoutes.courses);
}

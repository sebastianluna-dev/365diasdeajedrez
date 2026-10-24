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
import { readReturnTo, safeReturnTo, withErrorParam } from "@/services/shared/safe-return-to";
import { getStudyGoal } from "./study-goal.service";
import type { StudyGoal } from "./study-goal.types";

/**
 * The day's figures, for whoever asks for them from the browser.
 *
 * The menu of the bar shows them, and the bar is drawn on every page of the
 * platform: read in the shell they would cost three queries on every single
 * one, and — the shell being a layout — they would then go stale until a full
 * reload. Asked for when the menu is opened they cost nothing until someone
 * looks, and what they say is true at the moment of looking.
 */
export async function readStudyGoal(): Promise<StudyGoal> {
  return getStudyGoal();
}

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
  // The goal is set in «Ajustes» (the home page only shows it, since its move
  // to the new design system); the form still says where it came from, so a
  // failure goes back to the page that is on screen.
  const returnTo = safeReturnTo(readReturnTo(formData), platformRoutes.dashboard);

  const parsed = parseForm(GOAL_SCHEMA, formData);
  if (!parsed.ok) redirect(withErrorParam(returnTo, "goal"));
  const minutes = parsed.data.goalMinutes;

  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:daily-goal`, 20, 60_000))) redirect(withErrorParam(returnTo, "throttled"));

  await getPlatformDb().user.update({ where: { id: user.id }, data: { dailyGoalMinutes: minutes } });

  revalidatePath(platformRoutes.dashboard);
  revalidatePath(platformRoutes.settings);
}

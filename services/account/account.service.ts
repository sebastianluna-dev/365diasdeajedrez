import { formatSpanishDate } from "@/lib/format-spanish-date";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import type { AccountSettings } from "./account.types";

/**
 * The account, for its own page.
 *
 * It is not `getUserDashboard()`, which carries the whole dashboard: what
 * «Ajustes» shows is the person and the goal, and that is one row of `User`.
 */
export async function getAccountSettings(): Promise<AccountSettings> {
  const user = await getCurrentUser();
  const row = await getPlatformDb().user.findUniqueOrThrow({
    where: { id: user.id },
    select: { displayName: true, email: true, createdAt: true, dailyGoalMinutes: true },
  });

  return {
    displayName: row.displayName,
    email: row.email,
    memberSinceLabel: formatSpanishDate(row.createdAt),
    goalMinutes: row.dailyGoalMinutes,
  };
}

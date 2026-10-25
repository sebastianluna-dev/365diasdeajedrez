import type { Metadata } from "next";
import { AccountSettingsSection } from "@/components/platform/sections/account/account-settings.section";
import { cookies } from "next/headers";
import { THEME_COOKIE_NAME, themeOf } from "@/constants/platform/theme.const";
import { getAccountSettings } from "@/services/account/account.service";
import { getStudyGoal } from "@/services/study-goal/study-goal.service";

export const metadata: Metadata = { title: "Ajustes" };

interface SettingsPageProps {
  searchParams: Promise<{ error?: string }>;
}

/**
 * «Ajustes», in the new design system (2026-10-25, the owner's «Ajustes A ·
 * Todo a la vista»): the page takes the window and bleeds onto the canvas;
 * the section draws the workspace — «Ver mi perfil» and the page's anchors
 * in the side column, the four cards in the panel.
 */
export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  // Border of the private area: both reads resolve the session in the DAL.
  const [account, goal, { error }, store] = await Promise.all([
    getAccountSettings(),
    getStudyGoal(),
    searchParams,
    cookies(),
  ]);
  const theme = themeOf(store.get(THEME_COOKIE_NAME)?.value);

  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed">
      <AccountSettingsSection account={account} goal={goal} theme={theme} errorCode={error} />
    </div>
  );
}

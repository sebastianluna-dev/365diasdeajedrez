import type { Metadata } from "next";
import { AccountSettingsSection } from "@/components/platform/sections/account/account-settings.section";
import { cookies } from "next/headers";
import { THEME_COOKIE_NAME, themeOf } from "@/constants/platform/theme.const";
import { getAccountSettings } from "@/services/account/account.service";

export const metadata: Metadata = { title: "Ajustes" };

interface SettingsPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const [account, { error }, store] = await Promise.all([getAccountSettings(), searchParams, cookies()]);
  const theme = themeOf(store.get(THEME_COOKIE_NAME)?.value);

  return (
    <div className="platform-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Ajustes</h1>
        <p className="platform-page__subtitle">Tu cuenta y cómo quieres estudiar.</p>
      </header>

      <AccountSettingsSection account={account} theme={theme} errorCode={error} />
    </div>
  );
}

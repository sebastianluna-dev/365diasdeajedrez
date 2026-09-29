import type { Metadata } from "next";
import { AccountSettingsSection } from "@/components/platform/sections/account/account-settings.section";
import { getAccountSettings } from "@/services/account/account.service";

export const metadata: Metadata = { title: "Ajustes" };

interface SettingsPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const [account, { error }] = await Promise.all([getAccountSettings(), searchParams]);

  return (
    <div className="platform-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Ajustes</h1>
        <p className="platform-page__subtitle">Tu cuenta y cómo quieres estudiar.</p>
      </header>

      <AccountSettingsSection account={account} errorCode={error} />
    </div>
  );
}

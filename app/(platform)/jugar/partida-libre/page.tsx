import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlayLobbySection } from "@/components/platform/sections/play/lobby/play-lobby.section";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { PLAY_ENABLED } from "@/constants/platform/features.const";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";

export const metadata: Metadata = {
  title: "Partida libre",
};

interface FreePlayPageProps {
  /** `?rival=<slug>` opens that bot's popup; `?error=` is what an action bounced back with. */
  searchParams: Promise<{ rival?: string; error?: string }>;
}

export default async function FreePlayPage({ searchParams }: FreePlayPageProps) {
  // The switch before anything else: switched off, not even a seeded game opens by URL.
  if (!PLAY_ENABLED) notFound();
  await getCurrentUser();
  const { rival, error } = await searchParams;
  const errorMessage = studentErrorMessage(error);

  return (
    <div className="platform-page platform-page_width_wide">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Partida libre</h1>
        <p className="platform-page__subtitle">
          Elige un rival. Cada bot juega con la fuerza aproximada de su Elo; sin reloj, y nada de esto cuenta para tu
          racha.
        </p>
      </header>

      {errorMessage && <PlatformNotice message={errorMessage} />}

      <PlayLobbySection rival={rival ?? null} />
    </div>
  );
}

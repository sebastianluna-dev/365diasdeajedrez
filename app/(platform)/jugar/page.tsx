import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdventureCoverSection } from "@/components/adventure/cover/adventure-cover/adventure-cover.section";
import { PlayLobbySection } from "@/components/platform/sections/play/lobby/play-lobby.section";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { ADVENTURE_ENABLED, PLAY_ENABLED } from "@/constants/platform/features.const";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";

export const metadata: Metadata = {
  title: "Jugar",
};

interface PlayPageProps {
  /**
   * `?rival=<slug>` opens that bot's popup; `?error=` is what an action bounced back with.
   * Both are the gallery's: with the adventure on, the cover has no popup, and
   * the address of the gallery is `/jugar/partida-libre`.
   */
  searchParams: Promise<{ rival?: string; error?: string }>;
}

export default async function PlayPage({ searchParams }: PlayPageProps) {
  // The switch before anything else: switched off, not even a seeded game opens by URL.
  if (!PLAY_ENABLED) notFound();
  await getCurrentUser();
  const { rival, error } = await searchParams;
  const errorMessage = studentErrorMessage(error);

  // The cover of «Jugar»: the adventure's notebook and two tickets. Without the
  // adventure, this address stays what it has been, the gallery of bots.
  if (ADVENTURE_ENABLED) {
    return (
      <div className="platform-page platform-page_width_full platform-page_height_screen platform-page_frame_bleed">
        {errorMessage && <PlatformNotice message={errorMessage} />}
        <AdventureCoverSection />
      </div>
    );
  }

  return (
    <div className="platform-page platform-page_width_wide">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Jugar</h1>
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

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImportGameSection } from "@/components/platform/sections/tools/import-game/import-game.section";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { ANALYSIS_BOARD_ENABLED } from "@/constants/platform/features.const";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getOwnStudyOptions } from "@/services/studies/studies.service";

export const metadata: Metadata = {
  title: "Importar partida",
};

export default async function ImportGamePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!ANALYSIS_BOARD_ENABLED) notFound();
  await getCurrentUser();
  const [studies, { error }] = await Promise.all([getOwnStudyOptions(), searchParams]);
  const errorMessage = studentErrorMessage(error);

  return (
    <div className="platform-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Importar partida</h1>
        <p className="platform-page__subtitle">Pega un PGN y elige el estudio donde guardarlo.</p>
      </header>
      {errorMessage && <PlatformNotice message={errorMessage} />}
      <ImportGameSection studies={studies} />
    </div>
  );
}

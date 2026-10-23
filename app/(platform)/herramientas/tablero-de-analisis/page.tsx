import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnalysisBoardSection } from "@/components/platform/sections/tools/analysis-board/analysis-board.section";
import { ANALYSIS_BOARD_ENABLED } from "@/constants/platform/features.const";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { resolveAnalysisSource } from "@/services/analysis/analysis.service";
import { saveAnalysisToStudy } from "@/services/studies/studies.actions";
import { getOwnStudyOptions } from "@/services/studies/studies.service";

export const metadata: Metadata = {
  title: "Tablero de análisis",
};

interface AnalysisBoardPageProps {
  /** `?fen=`, `?partida=` (a played game) or `?estudio=&partida=` (a study's game); `?error=` from an action. */
  searchParams: Promise<{ fen?: string; partida?: string; estudio?: string; error?: string }>;
}

/**
 * The analysis board: a workbench that persists nothing. It opens on what
 * the URL names — through that source's own visibility rule, so a game the
 * person may not see opens an empty board — or on what the tab kept. In the
 * new design system (2026-10-23): the page takes the window and bleeds onto
 * the canvas, and the section draws the workspace; its name and drawing are
 * the bar's.
 */
export default async function AnalysisBoardPage({ searchParams }: AnalysisBoardPageProps) {
  if (!ANALYSIS_BOARD_ENABLED) notFound();
  await getCurrentUser();
  const query = await searchParams;
  const [source, studies] = await Promise.all([resolveAnalysisSource(query), getOwnStudyOptions()]);
  const errorMessage = studentErrorMessage(query.error);

  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed">
      <AnalysisBoardSection
        source={source}
        studies={studies}
        saveAction={saveAnalysisToStudy}
        errorMessage={errorMessage ?? undefined}
      />
    </div>
  );
}

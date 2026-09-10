import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewGameSection } from "@/components/platform/sections/studies/new-game/new-game.section";
import { getStudyById, getGameResultOptions } from "@/services/studies/studies.service";

interface NewGamePageProps {
  params: Promise<{ studyId: string }>;
  searchParams: Promise<{ error?: string }>;
}

export const metadata: Metadata = { title: "Nueva partida" };

export default async function NewGamePage({ params, searchParams }: NewGamePageProps) {
  const { studyId } = await params;
  const [study, results, { error }] = await Promise.all([
    getStudyById(studyId),
    getGameResultOptions(),
    searchParams,
  ]);
  // Nothing is written in a course study: it is the course's material, not the student's.
  if (!study || study.isCourseStudy) notFound();

  return (
    <div className="platform-page">
      <NewGameSection study={study} results={results} errorCode={error} />
    </div>
  );
}

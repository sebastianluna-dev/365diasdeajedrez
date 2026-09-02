import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudiesNavigation } from "@/components/common/studies-navigation.comp";
import { StudyDetailSection } from "@/components/sections/platform/studies/study-detail/study-detail.section";
import { getClassGames, getGameResultOptions, getStudyById, getStudyKinds } from "@/services/studies/studies.service";
import "./study-page.css";

interface StudyPageProps {
  params: Promise<{ studyId: string }>;
  searchParams: Promise<{ error?: string }>;
}

export async function generateMetadata({ params }: StudyPageProps): Promise<Metadata> {
  const { studyId } = await params;
  const study = await getStudyById(studyId);
  return study ? { title: study.name } : {};
}

export default async function StudyPage({ params, searchParams }: StudyPageProps) {
  const { studyId } = await params;
  // `getStudyById` pasa por el DAL, así que este primer await hace de frontera
  // de sesión además de traer los datos.
  const [study, { error }] = await Promise.all([getStudyById(studyId), searchParams]);
  if (!study) notFound();

  // Sólo hacen falta para el modal de nueva partida, que no sale en las bases
  // de curso: allí no se pide nada.
  const [kinds, results, classGames] = study.isCourseStudy
    ? [[], [], []]
    : await Promise.all([getStudyKinds(), getGameResultOptions(), getClassGames()]);

  return (
    <div className="platform-page study-page">
      <StudiesNavigation studyName={study.name} />
      <StudyDetailSection
        study={study}
        kinds={kinds}
        results={results}
        classGames={classGames}
        errorCode={error}
      />
    </div>
  );
}

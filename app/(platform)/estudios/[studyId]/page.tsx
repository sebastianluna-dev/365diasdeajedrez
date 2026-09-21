import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudiesNavigation } from "@/components/platform/shared/studies-navigation.comp";
import { StudyDetailSection } from "@/components/platform/sections/studies/study-detail/study-detail.section";
import {
  getClassGames,
  getGameResultOptions,
  getShareableStudents,
  getStudyById,
  getStudyKinds,
} from "@/services/studies/studies.service";
import "./study-page.css";

interface StudyPageProps {
  params: Promise<{ studyId: string }>;
  searchParams: Promise<{ error?: string; pagina?: string }>;
}

export async function generateMetadata({ params }: StudyPageProps): Promise<Metadata> {
  const { studyId } = await params;
  const study = await getStudyById(studyId);
  return study ? { title: study.name } : {};
}

export default async function StudyPage({ params, searchParams }: StudyPageProps) {
  const { studyId } = await params;
  // `getStudyById` goes through the DAL, so that await acts as the session
  // border as well as fetching the data.
  const { error, pagina } = await searchParams;
  const study = await getStudyById(studyId, Number.parseInt(pagina ?? "1", 10));
  if (!study) notFound();

  // All of this feeds forms that only exist when writing is allowed, so for
  // what arrives ready-made — course databases, shared collections — nothing
  // is queried.
  const [kinds, results, classGames, students] = study.permissions.canEditGames
    ? await Promise.all([getStudyKinds(), getGameResultOptions(), getClassGames(), getShareableStudents()])
    : [[], [], [], []];

  return (
    <div className="platform-page study-page">
      <StudiesNavigation studyName={study.name} />
      <StudyDetailSection
        study={study}
        kinds={kinds}
        results={results}
        classGames={classGames}
        students={students}
        errorCode={error}
      />
    </div>
  );
}

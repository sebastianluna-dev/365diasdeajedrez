import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { StudiesNavigation } from "@/components/platform/shared/studies-navigation.comp";
import { StudyDetailSection } from "@/components/platform/sections/studies/study-detail/study-detail.section";
import { platformRoutes } from "@/lib/platform-routes";
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
  searchParams: Promise<{ error?: string }>;
}

export async function generateMetadata({ params }: StudyPageProps): Promise<Metadata> {
  const { studyId } = await params;
  const study = await getStudyById(studyId);
  return study ? { title: study.name } : {};
}

/**
 * A study is read on its game page, so this URL only sends there: to the
 * first game, carrying along whatever a server action bounced with. It stays a
 * page — and not a redirect alone — for the study that has no game to go to,
 * which is where it is named and, by its owner, filled or deleted.
 */
export default async function StudyPage({ params, searchParams }: StudyPageProps) {
  const { studyId } = await params;
  // `getStudyById` goes through the DAL, so that await acts as the session
  // border as well as fetching the data.
  const { error } = await searchParams;
  const study = await getStudyById(studyId);
  if (!study) notFound();

  const first = study.games[0];
  if (first) {
    const target = platformRoutes.gameDetail(studyId, first.id);
    redirect(error ? `${target}?error=${encodeURIComponent(error)}` : target);
  }

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

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudiesNavigation } from "@/components/common/studies-navigation.comp";
import { StudyDetailSection } from "@/components/sections/platform/studies/study-detail/study-detail.section";
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

export default async function StudyPage({ params, searchParams }: StudyPageProps) {
  const { studyId } = await params;
  // `getStudyById` pasa por el DAL, así que este primer await hace de frontera
  // de sesión además de traer los datos.
  const [study, { error }] = await Promise.all([getStudyById(studyId), searchParams]);
  if (!study) notFound();

  // Todo esto alimenta formularios que sólo existen si se puede escribir, así
  // que en lo que llega hecho —bases de curso, colecciones repartidas— no se
  // consulta nada.
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

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudyDetailSection } from "@/components/sections/platform/studies/study-detail/study-detail.section";
import { getStudyById } from "@/services/studies/studies.service";
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
  const [study, { error }] = await Promise.all([getStudyById(studyId), searchParams]);
  if (!study) notFound();

  return (
    <div className="platform-page study-page">
      <StudyDetailSection study={study} errorCode={error} />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudyDetailSection } from "@/components/sections/platform/studies/study-detail/study-detail.section";
import { getStudyById } from "@/services/studies/studies.service";
import "./study-page.css";

interface StudyPageProps {
  params: Promise<{ studyId: string }>;
}

export async function generateMetadata({ params }: StudyPageProps): Promise<Metadata> {
  const { studyId } = await params;
  const study = await getStudyById(studyId);
  return study ? { title: study.name } : {};
}

export default async function StudyPage({ params }: StudyPageProps) {
  const { studyId } = await params;
  const study = await getStudyById(studyId);
  if (!study) notFound();

  return (
    <div className="platform-page study-page">
      <StudyDetailSection study={study} />
    </div>
  );
}

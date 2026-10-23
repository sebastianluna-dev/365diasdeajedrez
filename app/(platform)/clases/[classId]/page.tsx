import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClassNotebookSection } from "@/components/platform/sections/classes/class-notebook/class-notebook.section";
import { readNotice } from "@/constants/platform/class-messages.const";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { getClassById } from "@/services/classes/classes.service";

interface ClassPageProps {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ aviso?: string; error?: string }>;
}

export async function generateMetadata({ params }: ClassPageProps): Promise<Metadata> {
  const { classId } = await params;
  const classDetail = await getClassById(classId);
  return classDetail ? { title: classDetail.title } : {};
}

/**
 * The student's class page as a notebook (2026-10-19): one article to read,
 * before the class with the way in, after it with the summary and the
 * recording. It took the place of the access card (ALU-2) and the review
 * (ALU-3), whose sections stay for the stories while the notebook is
 * front-only. In the new design system since 2026-10-23: the page takes the
 * window and bleeds onto the canvas; the section draws the workspace.
 */
export default async function ClassPage({ params, searchParams }: ClassPageProps) {
  const { classId } = await params;
  const [classDetail, { aviso, error }] = await Promise.all([getClassById(classId), searchParams]);
  if (!classDetail) notFound();

  const errorMessage = studentErrorMessage(error);
  const notice = readNotice(aviso);

  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed">
      <ClassNotebookSection classDetail={classDetail} notice={notice?.text ?? undefined} errorMessage={errorMessage} />
    </div>
  );
}

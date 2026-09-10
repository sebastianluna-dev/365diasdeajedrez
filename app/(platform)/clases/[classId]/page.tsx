import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClassDetailSection } from "@/components/platform/sections/classes/class-detail/class-detail.section";
import { getClassById } from "@/services/classes/classes.service";
import "./class-page.css";

interface ClassPageProps {
  params: Promise<{ classId: string }>;
}

export async function generateMetadata({ params }: ClassPageProps): Promise<Metadata> {
  const { classId } = await params;
  const classDetail = await getClassById(classId);
  return classDetail ? { title: classDetail.title } : {};
}

export default async function ClassPage({ params }: ClassPageProps) {
  const { classId } = await params;
  const classDetail = await getClassById(classId);
  if (!classDetail) notFound();

  return (
    <div className="platform-page class-page">
      <ClassDetailSection classDetail={classDetail} />
    </div>
  );
}

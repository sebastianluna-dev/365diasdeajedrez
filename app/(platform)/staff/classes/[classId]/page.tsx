import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StaffClassDetailSection } from "@/components/sections/platform/staff/classes/staff-class-detail.section";
import { getClassAdminDetail } from "@/services/staff-classes/staff-classes.service";

interface StaffClassPageProps {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ error?: string }>;
}

export async function generateMetadata({ params }: StaffClassPageProps): Promise<Metadata> {
  const { classId } = await params;
  const classDetail = await getClassAdminDetail(classId);
  return classDetail ? { title: classDetail.title } : {};
}

export default async function StaffClassPage({ params, searchParams }: StaffClassPageProps) {
  const { classId } = await params;
  // El servicio abre con requireStaff(): es la frontera del panel.
  const classDetail = await getClassAdminDetail(classId);
  if (!classDetail) notFound();

  const { error } = await searchParams;

  return (
    <div className="platform-page staff-class-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">{classDetail.title}</h1>
        <p className="platform-page__subtitle">
          {classDetail.teacherName} · {classDetail.dateLabel} · {classDetail.timeLabel}
        </p>
      </header>

      <StaffClassDetailSection classDetail={classDetail} errorCode={error} />
    </div>
  );
}

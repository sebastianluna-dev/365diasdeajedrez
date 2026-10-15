import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudentPaymentsSection } from "@/components/platform/sections/staff/payments/student-payments.section";
import { readNotice } from "@/constants/platform/class-messages.const";
import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { suggestRhythm } from "@/services/shared/class-schedule-rules";
import { listActiveTeacherOptions, listOpenGroupClasses } from "@/services/staff-classes/staff-classes.service";
import { getPaymentContext, getStudentPayments } from "@/services/staff-payments/staff-payments.service";
import { getStudentAdminDetail } from "@/services/staff-students/staff-students.service";

interface StudentPaymentsPageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ error?: string; aviso?: string }>;
}

export async function generateMetadata({ params }: StudentPaymentsPageProps): Promise<Metadata> {
  const { userId } = await params;
  const student = await getStudentAdminDetail(userId);
  return student ? { title: `Pagos y clases · ${student.displayName}` } : {};
}

/** «Pagos y clases»: the second page of a student's record. */
export default async function StudentPaymentsPage({ params, searchParams }: StudentPaymentsPageProps) {
  const { userId } = await params;
  const now = new Date();
  const [view, teachers, groupClasses, context, { error, aviso }] = await Promise.all([
    getStudentPayments(userId),
    listActiveTeacherOptions(),
    listOpenGroupClasses(now, userId),
    getPaymentContext(userId, now),
    searchParams,
  ]);
  if (!view) notFound();

  const rhythm = context?.rhythm ?? {
    teacherId: view.student.teacherId,
    ...suggestRhythm(null, now, STUDY_DAY_TIMEZONE),
  };
  const notice = readNotice(aviso);

  return (
    <StudentPaymentsSection
      view={view}
      teachers={teachers}
      groupClasses={groupClasses}
      rhythm={rhythm}
      notice={notice?.text ?? undefined}
      errorCode={error}
    />
  );
}

import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { StudentRecordHead } from "@/components/platform/sections/staff/students/student-record-head.comp";
import { listActiveTeacherOptions, listOpenGroupClasses } from "@/services/staff-classes/staff-classes.service";
import { getStudentAdminDetail } from "@/services/staff-students/staff-students.service";

interface StudentRecordLayoutProps {
  children: ReactNode;
  params: Promise<{ userId: string }>;
}

/**
 * The frame of a student's record: the name, the email, the actions and the
 * tabs, above whichever of its pages one is on — «Cuenta», «Pagos y
 * clases». A layout, so the pages cannot drift apart and the head is not
 * rendered again on the way. The student read here is the one the page
 * reads: `getStudentAdminDetail` is wrapped in React's `cache`.
 */
export default async function StudentRecordLayout({ children, params }: StudentRecordLayoutProps) {
  const { userId } = await params;
  // The service opens with requireStaff(): it is the panel's border.
  const student = await getStudentAdminDetail(userId);
  if (!student) notFound();
  const [teachers, groupClasses] = await Promise.all([
    listActiveTeacherOptions(),
    listOpenGroupClasses(new Date(), userId),
  ]);

  return (
    <div className="platform-page staff-student-page">
      <StudentRecordHead student={student} teachers={teachers} groupClasses={groupClasses} />
      {children}
    </div>
  );
}

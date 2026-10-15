import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { NewClassSection } from "@/components/platform/sections/staff/classes/new-class.section";
import { CLASS_FORMAT } from "@/constants/platform/class-codes.const";
import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { staffRoutes } from "@/lib/platform-routes";
import { suggestRhythm } from "@/services/shared/class-schedule-rules";
import {
  getClassDuplicate,
  listActiveTeacherOptions,
  listSchedulableStudents,
} from "@/services/staff-classes/staff-classes.service";
import type { NewClassDefaults } from "@/services/staff-classes/staff-classes.types";
import { getPaymentContext } from "@/services/staff-payments/staff-payments.service";

export async function generateMetadata(): Promise<Metadata> {
  await requireStaff();
  return { title: "Crear clase" };
}

interface NewClassPageProps {
  searchParams: Promise<{ formato?: string; alumno?: string; duplicar?: string }>;
}

/**
 * «Crear clase» (ADM-3). `?formato=grupal` opens on «Grupal»; `?alumno=`
 * chooses the student, their teacher, their rhythm and their last link
 * (O2); `?duplicar=` copies a class a week later, without its students.
 */
export default async function NewClassPage({ searchParams }: NewClassPageProps) {
  await requireStaff();
  const { formato, alumno, duplicar } = await searchParams;
  const now = new Date();

  const [teachers, students, duplicate, context] = await Promise.all([
    listActiveTeacherOptions(),
    listSchedulableStudents(),
    duplicar ? getClassDuplicate(duplicar) : null,
    alumno ? getPaymentContext(alumno, now) : null,
  ]);

  const rhythm = context?.rhythm ?? suggestRhythm(null, now, STUDY_DAY_TIMEZONE);
  const defaults: NewClassDefaults = duplicate ?? {
    format: formato === "grupal" ? CLASS_FORMAT.GROUP : CLASS_FORMAT.INDIVIDUAL,
    capacity: formato === "grupal" ? 6 : null,
    title: "",
    description: "",
    teacherId: context?.student.teacherId ?? (teachers.length === 1 ? (teachers[0]?.id ?? null) : null),
    date: rhythm.firstDate,
    time: rhythm.time,
    durationMin: rhythm.durationMin,
    meetingUrl: context?.lastMeetingUrl ?? "",
    studentId: context?.student.id ?? null,
    duplicateOf: null,
  };

  return (
    <div className="platform-page platform-page_width_wide">
      <header className="platform-page__head">
        <Link href={staffRoutes.classes} className="platform-page__back">
          <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
          Clases
        </Link>
        <h1 className="platform-page__title">Crear clase</h1>
        <p className="platform-page__subtitle">
          {defaults.duplicateOf ??
            "Individual o grupal; cada alumno entra con su pago, con el pago pendiente o gratis."}
        </p>
      </header>

      <NewClassSection
        defaults={defaults}
        teachers={teachers}
        students={students}
        timeZone={STUDY_DAY_TIMEZONE}
        nowIso={now.toISOString()}
      />
    </div>
  );
}

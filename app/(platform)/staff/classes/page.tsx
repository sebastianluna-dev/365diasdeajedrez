import type { Metadata } from "next";
import { StaffClassesSection } from "@/components/sections/platform/staff/classes/staff-classes.section";
import { CLASS_STATUS, type ClassStatusCode } from "@/constants/platform/class-codes.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { listAllClasses, listTeacherFilterOptions } from "@/services/staff-classes/staff-classes.service";

export const metadata: Metadata = {
  title: "Clases",
};

interface StaffClassesPageProps {
  searchParams: Promise<{ teacherId?: string; status?: string; from?: string; to?: string; q?: string }>;
}

function toStatusCode(value: string | undefined): ClassStatusCode | undefined {
  return value && (Object.values(CLASS_STATUS) as string[]).includes(value) ? (value as ClassStatusCode) : undefined;
}

/** "YYYY-MM-DD" → instante, o undefined si la fecha no es válida. */
function toDate(value: string | undefined, endOfDay = false): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function StaffClassesPage({ searchParams }: StaffClassesPageProps) {
  await requireStaff();
  const raw = await searchParams;

  const filters = {
    teacherId: raw.teacherId || undefined,
    statusCode: toStatusCode(raw.status),
    from: toDate(raw.from),
    to: toDate(raw.to, true),
    q: raw.q,
  };

  const [classes, teachers] = await Promise.all([listAllClasses(filters), listTeacherFilterOptions()]);

  return (
    <div className="platform-page staff-classes-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Clases</h1>
        <p className="platform-page__subtitle">
          Vista global de lectura. Desde aquí sólo se corrige la grabación o se cancela una clase.
        </p>
      </header>

      <StaffClassesSection classes={classes} teachers={teachers} filters={filters} rawFilters={raw} />
    </div>
  );
}

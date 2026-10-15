import type { Metadata } from "next";
import { TeacherClassesSection } from "@/components/platform/sections/teacher/classes/teacher-classes.section";
import { CLASS_FIELD_ERRORS, readNotice } from "@/constants/platform/class-messages.const";
import { TEACHER_ERROR_MESSAGES } from "@/constants/platform/teacher-messages.const";
import { requireTeacher } from "@/lib/platform-auth/roles";
import { getTeacherClasses } from "@/services/teacher-classes/teacher-classes.service";
import type { TeacherClassesTab } from "@/services/teacher-classes/teacher-classes.types";

// The title is resolved with the role, like the page itself: without it the
// response carries not even the panel's name (IMPROVEMENTS #26).
export async function generateMetadata(): Promise<Metadata> {
  await requireTeacher();
  return { title: "Clases que imparto" };
}

interface TeacherClassesPageProps {
  searchParams: Promise<{ vista?: string; q?: string; pagina?: string; aviso?: string; error?: string }>;
}

const TABS: TeacherClassesTab[] = ["proximas", "por-finalizar", "pasadas", "canceladas"];

/** «Clases que imparto». */
export default async function TeacherClassesPage({ searchParams }: TeacherClassesPageProps) {
  await requireTeacher();
  const raw = await searchParams;
  const view = await getTeacherClasses({
    vista: TABS.includes(raw.vista as TeacherClassesTab) ? (raw.vista as TeacherClassesTab) : "proximas",
    q: raw.q?.trim() || undefined,
    pagina: Math.max(1, Number.parseInt(raw.pagina ?? "1", 10) || 1),
  });
  const notice = readNotice(raw.aviso);
  const noticeText = notice?.text ?? (notice?.code === "classFinalized" ? "Clase finalizada." : undefined);
  const errorMessage = raw.error
    ? (CLASS_FIELD_ERRORS[raw.error] ?? TEACHER_ERROR_MESSAGES[raw.error] ?? TEACHER_ERROR_MESSAGES.invalid)
    : undefined;

  return (
    <div className="platform-page teacher-classes-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Clases que imparto</h1>
        <p className="platform-page__subtitle">
          Las clases que te asigna administración. Tú preparas el contenido y finalizas cada una al terminar.
        </p>
      </header>
      <TeacherClassesSection view={view} notice={noticeText} errorMessage={errorMessage} />
    </div>
  );
}

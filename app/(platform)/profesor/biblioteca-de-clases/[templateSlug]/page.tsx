import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { ClassTemplateSection } from "@/components/platform/sections/teacher/class-templates/class-template.section";
import { classTemplateBySlug } from "@/components/platform/sections/teacher/class-templates/class-templates.sample";
import { requireTeacher } from "@/lib/platform-auth/roles";
import { teacherRoutes } from "@/lib/platform-routes";

interface ClassTemplatePageProps {
  params: Promise<{ templateSlug: string }>;
}

export async function generateMetadata({ params }: ClassTemplatePageProps): Promise<Metadata> {
  const template = classTemplateBySlug((await params).templateSlug);
  return template ? { title: template.title } : {};
}

/** One ready-made class (2026-10-19, front-only), opened in the class editor. */
export default async function ClassTemplatePage({ params }: ClassTemplatePageProps) {
  await requireTeacher();
  const template = classTemplateBySlug((await params).templateSlug);
  if (!template) notFound();

  return (
    <div className="platform-page platform-page_width_wide">
      <header className="platform-page__head">
        <Link href={teacherRoutes.classTemplates} className="platform-page__back">
          <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
          Clases prediseñadas
        </Link>
        <h1 className="platform-page__title">{template.title}</h1>
        <p className="platform-page__subtitle">
          {template.course} · {template.level} · {template.durationMin} min
        </p>
      </header>
      <ClassTemplateSection template={template} />
    </div>
  );
}

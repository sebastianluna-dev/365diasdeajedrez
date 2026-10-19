import type { Metadata } from "next";
import { ClassTemplatesSection } from "@/components/platform/sections/teacher/class-templates/class-templates.section";
import { CLASS_TEMPLATES } from "@/components/platform/sections/teacher/class-templates/class-templates.sample";
import { requireTeacher } from "@/lib/platform-auth/roles";

export const metadata: Metadata = { title: "Clases prediseñadas" };

/** «Clases prediseñadas» (2026-10-19, front-only): the academy's ready-made classes. */
export default async function ClassTemplatesPage() {
  await requireTeacher();
  return (
    <div className="platform-page platform-page_width_wide">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Clases prediseñadas</h1>
        <p className="platform-page__subtitle">
          Clases ya escritas por la academia: el texto, los diagramas y las preguntas. Ábrelas para leerlas como tu
          alumno o para probar cambios en el editor.
        </p>
      </header>
      <ClassTemplatesSection templates={CLASS_TEMPLATES} />
    </div>
  );
}

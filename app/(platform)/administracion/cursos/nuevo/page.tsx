import type { Metadata } from "next";
import { FormField } from "@/components/platform/shared/form-field.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { StaffEditorHead } from "@/components/platform/sections/staff/courses/staff-editor.comp";
import { StaffPanel } from "@/components/platform/sections/staff/courses/staff-panel.comp";
import { requireStaff } from "@/lib/platform-auth/roles";
import { staffRoutes } from "@/lib/platform-routes";
import { createCourse } from "@/services/staff-courses/staff-courses.actions";
import { listCourseTypes } from "@/services/staff-courses/staff-courses.service";
import "./new-course-page.css";

export const metadata: Metadata = {
  title: "Nuevo curso",
};

interface NewCoursePageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewCoursePage({ searchParams }: NewCoursePageProps) {
  await requireStaff();
  const [types, { error }] = await Promise.all([listCourseTypes(), searchParams]);
  const errorMessage = error ? (STAFF_ERROR_MESSAGES[error] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;

  return (
    <div className="platform-page new-course-page">
      <StaffEditorHead
        crumbs={[{ label: "Cursos", href: staffRoutes.courses }]}
        title="Nuevo curso"
        description="Sólo lo imprescindible: el resto se edita en la ficha del curso."
      />

      {errorMessage && <PlatformNotice message={errorMessage} />}

      <div className="new-course-page__panel">
        <StaffPanel title="Datos del curso">
          <form className="new-course-page__form" action={createCourse}>
            <FormField label="Nombre">
              <input type="text" name="name" maxLength={160} required />
            </FormField>

            <FormField label="Identificador (slug)" hint="Minúsculas, números y guiones. Aparece en la URL.">
              <input type="text" name="slug" maxLength={160} pattern="[a-z0-9]+(-[a-z0-9]+)*" required />
            </FormField>

            <FormField label="Tipo">
              <select name="typeCode" defaultValue={types[0]?.code}>
                {types.map((type) => (
                  <option key={type.code} value={type.code}>
                    {type.label}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="new-course-page__submit">
              <button type="submit" className="platform-button">
                Crear curso en borrador
              </button>
            </div>
          </form>
        </StaffPanel>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { FormField } from "@/components/common/form-field.comp";
import { PlatformNotice } from "@/components/common/platform-notice.comp";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { requireStaff } from "@/lib/platform-auth/roles";
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
      <header className="platform-page__head">
        <h1 className="platform-page__title">Nuevo curso</h1>
        <p className="platform-page__subtitle">Sólo lo imprescindible: el resto se edita en la ficha del curso.</p>
      </header>

      {errorMessage && <PlatformNotice message={errorMessage} />}

      <form className="new-course-page__form platform-card" action={createCourse}>
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

        <button type="submit" className="platform-button">
          Crear curso en borrador
        </button>
      </form>
    </div>
  );
}

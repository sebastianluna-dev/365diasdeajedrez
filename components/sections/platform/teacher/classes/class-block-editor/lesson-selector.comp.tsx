"use client";

import { FormField } from "@/components/common/form-field.comp";
import type { LessonRefOption } from "@/services/teacher-classes/teacher-classes.types";

interface LessonSelectorProps {
  lessons: LessonRefOption[];
  value: string;
  onChange: (lessonId: string) => void;
}

/** Sólo lecciones de cursos publicados: el alumno tiene que poder abrirlas. */
export function LessonSelector({ lessons, value, onChange }: LessonSelectorProps) {
  return (
    <FormField
      label="Lección"
      hint={lessons.length === 0 ? "No hay lecciones de cursos publicados todavía." : undefined}
    >
      <select name="lessonId" value={value} onChange={(event) => onChange(event.target.value)} required>
        <option value="">Elige una lección…</option>
        {lessons.map((lesson) => (
          <option key={lesson.id} value={lesson.id}>
            {lesson.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

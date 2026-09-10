"use client";

import { FormField } from "@/components/common/form-field.comp";

interface LessonReferenceFieldProps {
  value: string;
  onChange: (lessonId: string) => void;
}

/**
 * The lesson is referenced by typing its id, not by choosing it from a list.
 *
 * No need to validate here: the viewer right below (`MovePathPicker`) loads
 * the lesson as soon as the id works, so the preview IS the check. If nothing
 * appears, the id is no good. The real decision is the server's, which also
 * requires its course to be published.
 */
export function LessonReferenceField({ value, onChange }: LessonReferenceFieldProps) {
  return (
    <FormField
      label="Id de la lección"
      hint="Está en la dirección de la lección: /lecciones/20000004 → 20000004. Debajo aparecerá su contenido para comprobar que es la que quieres."
    >
      <input
        type="text"
        name="lessonId"
        value={value}
        onChange={(event) => onChange(event.target.value.trim())}
        inputMode="numeric"
        maxLength={40}
        placeholder="20000004"
        required
      />
    </FormField>
  );
}

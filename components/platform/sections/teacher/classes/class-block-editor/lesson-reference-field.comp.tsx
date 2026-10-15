"use client";

import { PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";

interface LessonReferenceFieldProps {
  defaultValue?: string;
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
export function LessonReferenceField({ defaultValue, onChange }: LessonReferenceFieldProps) {
  return (
    <PlatformFormField
      name="lessonId"
      label="Id de la lección"
      hint="Es lo último de la dirección de la lección: /cursos/00020212/1/20000004 → 20000004. Debajo aparecerá su contenido para comprobar que es la que quieres."
    >
      <input
        type="text"
        defaultValue={defaultValue}
        onChange={(event) => onChange(event.target.value.trim())}
        inputMode="numeric"
        maxLength={40}
        placeholder="20000004"
        required
      />
    </PlatformFormField>
  );
}

"use client";

import { FormField } from "@/components/common/form-field.comp";

interface LessonReferenceFieldProps {
  value: string;
  onChange: (lessonId: string) => void;
}

/**
 * La lección se referencia escribiendo su id, no eligiéndola de una lista.
 *
 * No hace falta validar aquí: el visor que va justo debajo (`MovePathPicker`)
 * carga la lección en cuanto el id sirve, así que la previsualización ES la
 * comprobación. Si no aparece nada, el id no vale. Quien decide de verdad es el
 * servidor, que además exige que su curso esté publicado.
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

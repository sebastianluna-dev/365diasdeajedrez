"use client";

import { FormField } from "@/components/common/form-field.comp";
import type { PositionOption } from "@/services/teacher-classes/teacher-classes.types";

interface PositionSelectorProps {
  positions: PositionOption[];
  value: string;
  onChange: (positionId: string) => void;
}

/** Diagramas guardados del propio profesor (Position con propietario TEACHER). */
export function PositionSelector({ positions, value, onChange }: PositionSelectorProps) {
  return (
    <FormField
      label="Posición guardada"
      hint={positions.length === 0 ? "Todavía no has guardado ninguna posición." : undefined}
    >
      <select name="positionId" value={value} onChange={(event) => onChange(event.target.value)} required>
        <option value="">Elige una posición…</option>
        {positions.map((position) => (
          <option key={position.id} value={position.id}>
            {position.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

"use client";

import { FormField } from "@/components/platform/shared/form-field.comp";
import type { PositionOption } from "@/services/teacher-classes/teacher-classes.types";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";

interface PositionSelectorProps {
  positions: PositionOption[];
  value: string;
  onChange: (positionId: string) => void;
}

/** The teacher's own saved diagrams (Position with owner TEACHER). */
export function PositionSelector({ positions, value, onChange }: PositionSelectorProps) {
  return (
    <FormField
      label="Posición guardada"
      hint={positions.length === 0 ? "Todavía no has guardado ninguna posición." : undefined}
    >
      <PlatformSelect
        name="positionId"
        value={value}
        onValueChange={onChange}
        required
        placeholder="Elige una posición…"
        options={positions.map((position) => ({ value: position.id, label: position.label }))}
        size="compact"
      />
    </FormField>
  );
}

"use client";

import { PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
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
    <PlatformFormField
      name="positionId"
      label="Posición guardada"
      hint={positions.length === 0 ? "Todavía no has guardado ninguna posición." : undefined}
    >
      <PlatformSelect
        value={value}
        onValueChange={onChange}
        required
        placeholder="Elige una posición…"
        options={positions.map((position) => ({ value: position.id, label: position.label }))}
      />
    </PlatformFormField>
  );
}

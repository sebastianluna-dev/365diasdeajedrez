"use client";

import { FormField } from "@/components/platform/shared/form-field.comp";
import type { ReferenceableGameGroup } from "@/services/teacher-classes/teacher-classes.types";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";

interface GameSelectorProps {
  groups: ReferenceableGameGroup[];
  value: string;
  onChange: (gameId: string) => void;
}

/**
 * Games the teacher can reference, grouped by owner (their own and those of
 * their active students). Only id and label: PGNs are requested one at a time
 * when a preview is needed.
 */
export function GameSelector({ groups, value, onChange }: GameSelectorProps) {
  return (
    <FormField label="Partida" hint={groups.length === 0 ? "No hay partidas disponibles todavía." : undefined}>
      <PlatformSelect
        name="gameId"
        value={value}
        onValueChange={onChange}
        required
        placeholder="Elige una partida…"
        groups={groups.map((group) => ({
          label: `${group.ownerLabel} · ${group.studyName}`,
          options: group.games.map((game) => ({ value: game.id, label: game.label })),
        }))}
        size="compact"
      />
    </FormField>
  );
}

"use client";

import { FormField } from "@/components/platform/shared/form-field.comp";
import type { ReferenceableGameGroup } from "@/services/teacher-classes/teacher-classes.types";

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
    <FormField
      label="Partida"
      hint={groups.length === 0 ? "No hay partidas disponibles todavía." : undefined}
    >
      <select name="gameId" value={value} onChange={(event) => onChange(event.target.value)} required>
        <option value="">Elige una partida…</option>
        {groups.map((group) => (
          <optgroup key={`${group.ownerLabel}-${group.studyName}`} label={`${group.ownerLabel} · ${group.studyName}`}>
            {group.games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </FormField>
  );
}

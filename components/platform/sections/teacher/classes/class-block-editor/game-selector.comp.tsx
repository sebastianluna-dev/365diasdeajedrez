"use client";

import { PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import type { ReferenceableGameGroup } from "@/services/teacher-classes/teacher-classes.types";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";

interface GameSelectorProps {
  groups: ReferenceableGameGroup[];
  /** What it opens with: the select keeps its own value, and says each change. */
  defaultValue?: string;
  onChange: (gameId: string) => void;
}

/**
 * Games the teacher can reference, grouped by owner (their own and those of
 * their active students). Only id and label: PGNs are requested one at a time
 * when a preview is needed.
 */
export function GameSelector({ groups, defaultValue, onChange }: GameSelectorProps) {
  return (
    <PlatformFormField
      name="gameId"
      label="Partida"
      hint={groups.length === 0 ? "No hay partidas disponibles todavía." : undefined}
    >
      <PlatformSelect
        defaultValue={defaultValue}
        onValueChange={onChange}
        required
        placeholder="Elige una partida…"
        groups={groups.map((group) => ({
          label: `${group.ownerLabel} · ${group.studyName}`,
          options: group.games.map((game) => ({ value: game.id, label: game.label })),
        }))}
      />
    </PlatformFormField>
  );
}

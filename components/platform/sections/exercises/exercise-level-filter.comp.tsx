"use client";

import { useRouter } from "next/navigation";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { PracticeLevelOption } from "@/services/exercises/practice.types";

interface ExerciseLevelFilterProps {
  /** The active levels, by the Level catalog's bands. */
  levels: PracticeLevelOption[];
  /** The level in the address (`nivel`), or every level. */
  value: string | null;
  /** The topic in the address, which a change of level keeps. */
  topicCode: string | null;
}

/**
 * The level the trainer deals from, in the toolbar of «Ejercicios»: every
 * level, or one band of the Level catalog. A filter, not a form: a change
 * replaces the address at once and the next exercise is dealt from it
 * (`tras` is dropped: the one on the board is no longer the last of the
 * choice), the topic kept. Never a message.
 */
export function ExerciseLevelFilter({ levels, value, topicCode }: ExerciseLevelFilterProps) {
  const router = useRouter();
  return (
    <PlatformSelect
      aria-label="Nivel"
      tone="accent"
      emptyOption="Todos los niveles"
      options={levels.map((level) => ({ value: level.slug, label: level.name }))}
      value={value ?? ""}
      onValueChange={(next) =>
        router.replace(platformRoutes.exerciseTrainer({ tema: topicCode ?? undefined, nivel: next || undefined }))
      }
      className="exercises-toolbar__level"
    />
  );
}

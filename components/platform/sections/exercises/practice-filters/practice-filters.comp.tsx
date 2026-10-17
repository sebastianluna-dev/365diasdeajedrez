"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AngleRightIcon } from "@/components/icons/angle-right-icon.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { PracticeChoice, PracticeFilters as PracticeFiltersData } from "@/services/exercises/practice.types";
import "./practice-filters.comp.css";

export interface PracticeFiltersProps {
  filters: PracticeFiltersData;
  /** The choice in the address, or nothing chosen. */
  choice: PracticeChoice;
  /**
   * On the home's card (`home`) the choice is kept here and «Empezar» opens
   * the practice page with it; on the practice page (`page`) a change pushes
   * the address at once and the next exercise loads.
   */
  variant: "home" | "page";
  /** The home's card: whether «Empezar» is the screen's accent (nothing else is). */
  accent?: boolean;
}

/**
 * The two choices of «Práctica libre» (D18, D32): the topic — the first
 * level, with each parent's children under its heading — and the level, by
 * the Level catalog's bands. A filter, not a form: `PlatformSelect` in the
 * accent's tone, never a message. With the library empty, it says so.
 */
export function PracticeFilters({ filters, choice, variant, accent = false }: PracticeFiltersProps) {
  const router = useRouter();
  const [topic, setTopic] = useState(choice.topicCode ?? "");
  const [level, setLevel] = useState(choice.levelSlug ?? "");
  const roots = filters.topics.filter((candidate) => candidate.parentCode === null);
  const groups = roots
    .map((root) => ({
      label: root.label,
      options: filters.topics
        .filter((candidate) => candidate.parentCode === root.code)
        .map((candidate) => ({ value: candidate.code, label: candidate.label })),
    }))
    .filter((group) => group.options.length > 0);
  const ready = topic !== "" && level !== "";
  const href = platformRoutes.exercisePractice({ tema: topic, nivel: level });

  const choose = (next: { topic?: string; level?: string }) => {
    const nextTopic = next.topic ?? topic;
    const nextLevel = next.level ?? level;
    setTopic(nextTopic);
    setLevel(nextLevel);
    if (variant === "page" && nextTopic && nextLevel) {
      router.replace(platformRoutes.exercisePractice({ tema: nextTopic, nivel: nextLevel }));
    }
  };

  if (filters.libraryEmpty) {
    return <p className="practice-filters__empty">Todavía no hay ejercicios en la biblioteca para practicar.</p>;
  }

  return (
    <div className={`practice-filters practice-filters_variant_${variant}`}>
      <PlatformSelect
        aria-label="Tema"
        tone="accent"
        placeholder="Tema"
        options={roots.map((root) => ({ value: root.code, label: root.label }))}
        groups={groups}
        value={topic}
        onValueChange={(value) => choose({ topic: value })}
      />
      <PlatformSelect
        aria-label="Nivel"
        tone="accent"
        placeholder="Nivel"
        options={filters.levels.map((option) => ({ value: option.slug, label: `${option.name} · ${option.range}` }))}
        value={level}
        onValueChange={(value) => choose({ level: value })}
      />
      {variant === "home" &&
        (ready ? (
          <Link href={href} className={`platform-button${accent ? " platform-button_variant_accent" : ""}`}>
            Empezar
            <AngleRightIcon variant="classic-solid" className="platform-button__icon" />
          </Link>
        ) : (
          <button type="button" className="platform-button" disabled>
            Empezar
            <AngleRightIcon variant="classic-solid" className="platform-button__icon" />
          </button>
        ))}
    </div>
  );
}

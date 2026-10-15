"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PlatformSearchField } from "@/components/platform/shared/platform-search-field/platform-search-field.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { staffRoutes } from "@/lib/platform-routes";
import type { StaffAgendaFilters } from "@/services/staff-classes/staff-classes.types";

interface AgendaFiltersProps {
  filters: StaffAgendaFilters;
  teachers: { id: string; displayName: string }[];
}

const SEARCH_DELAY_MS = 300;

/**
 * The teacher and the text the agenda keeps: a select and a search box that
 * push the address, so the filters can be shared and the back button undoes
 * them. A filter, not a form: the accent's focus, never a message. The text
 * travels after a short pause, not on every key.
 */
export function AgendaFilters({ filters, teachers }: AgendaFiltersProps) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const go = (next: Partial<StaffAgendaFilters>) =>
    router.replace(
      staffRoutes.classesFiltered({
        vista: filters.vista,
        profesor: next.teacherId ?? filters.teacherId,
        q: next.q ?? filters.q,
        hasta: filters.vista === "proximas" ? filters.hasta : undefined,
      }),
    );

  return (
    <div className="agenda-filters">
      <PlatformSelect
        aria-label="Profesor"
        tone="accent"
        emptyOption="Todos los profesores"
        options={teachers.map((teacher) => ({ value: teacher.id, label: teacher.displayName }))}
        value={filters.teacherId ?? ""}
        onValueChange={(value) => go({ teacherId: value })}
      />
      <PlatformSearchField
        label="Buscar clase"
        placeholder="Tema o alumno"
        defaultValue={filters.q}
        onValueChange={(value) => {
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => go({ q: value.trim() }), SEARCH_DELAY_MS);
        }}
      />
    </div>
  );
}

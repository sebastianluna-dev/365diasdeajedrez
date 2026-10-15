"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PlatformSearchField } from "@/components/platform/shared/platform-search-field/platform-search-field.comp";
import { teacherRoutes } from "@/lib/platform-routes";
import type { TeacherClassesFilters } from "@/services/teacher-classes/teacher-classes.types";

const SEARCH_DELAY_MS = 300;

/** The text «Clases que imparto» keeps: a search box that replaces the address after a pause. A filter, not a form. */
export function TeacherClassesSearch({ filters }: { filters: TeacherClassesFilters }) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <PlatformSearchField
      label="Buscar clase"
      placeholder="Tema o alumno"
      defaultValue={filters.q}
      onValueChange={(value) => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(
          () => router.replace(teacherRoutes.classesFiltered({ vista: filters.vista, q: value.trim() })),
          SEARCH_DELAY_MS,
        );
      }}
    />
  );
}

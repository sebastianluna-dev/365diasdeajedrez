"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  clearSolveHistory,
  isSolvePath,
} from "@/components/platform/shared/exercise-session-history/exercise-solve-history.store";

/**
 * Empties the visit's history (`ExerciseSessionHistory`) when the student
 * leaves the solve pages: on a page of «Ejercicios» that is not one, and when
 * «Ejercicios» is left altogether. Draws nothing.
 */
export function ExerciseSessionReset() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isSolvePath(pathname)) clearSolveHistory();
  }, [pathname]);

  // Only on unmount: moving between two exercises must keep it.
  useEffect(() => () => clearSolveHistory(), []);

  return null;
}

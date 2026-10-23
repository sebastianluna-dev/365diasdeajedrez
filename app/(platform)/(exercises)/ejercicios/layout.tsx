import type { ReactNode } from "react";
import { ExerciseSessionReset } from "@/components/platform/shared/exercise-session-reset/exercise-session-reset.comp";

interface ExercisesLayoutProps {
  children: ReactNode;
}

/**
 * What every page of «Ejercicios» shares: the end of the visit's history of
 * solved exercises (the solve page's «Esta sesión») when one leaves the
 * solve pages. It draws nothing of its own.
 */
export default function ExercisesLayout({ children }: ExercisesLayoutProps) {
  return (
    <>
      <ExerciseSessionReset />
      {children}
    </>
  );
}

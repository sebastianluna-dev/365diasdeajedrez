import { Suspense, type ReactNode } from "react";
import { ExercisesSideSection } from "./exercises-side.section";
import { ExercisesSideSkeleton } from "./exercises-side-skeleton.comp";

interface ExercisesWorkspaceProps {
  /** The page: its `.platform-workspace__panel`, or the loading skeleton of one. */
  children: ReactNode;
}

/**
 * The frame of «Ejercicios» and «Puzzle Rush» in the new design system
 * (2026-10-23), drawn ONCE by the layout they share
 * (`app/(platform)/(exercises)/layout.tsx`), so moving between a topic, a
 * series, the history and the rush keeps the side column in place and only
 * the panel changes, as Gmail's labels do. A container: its job is to place
 * the panel. The bar carries no search: none of the page's would find more
 * than the column already lists.
 *
 * It waits for nothing: the side column's data streams in behind
 * `ExercisesSideSkeleton` and the page behind its own `loading.tsx`, so the
 * frame is on screen from the first paint, the canvas under the bar with it.
 */
export function ExercisesWorkspace({ children }: ExercisesWorkspaceProps) {
  return (
    <div className="platform-workspace">
      <div className="platform-workspace__side">
        <Suspense fallback={<ExercisesSideSkeleton />}>
          <ExercisesSideSection />
        </Suspense>
      </div>

      {children}
    </div>
  );
}

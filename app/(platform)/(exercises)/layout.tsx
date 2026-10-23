import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ExercisesWorkspace } from "@/components/platform/sections/exercises/exercises-workspace.comp";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";

/**
 * «Ejercicios» (`/ejercicios` and every page under it) and «Puzzle Rush»
 * (`/puzzle-rush`) share this layout, in the new design system
 * (2026-10-23), so the frame — the canvas and the side column — is drawn
 * once and stays while the student moves between a topic, a series, the
 * history and the rush; only the page, the panel, is drawn again, with its
 * `loading.tsx` in its place meanwhile. It awaits nothing, so the frame
 * paints at once: the side column's data streams in behind its own skeleton
 * (`ExercisesWorkspace`), and every page under it resolves the student
 * through its data services. Switched off, none of it exists.
 */
export default function ExercisesGroupLayout({ children }: { children: ReactNode }) {
  if (!EXERCISES_ENABLED) notFound();
  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed">
      <ExercisesWorkspace>{children}</ExercisesWorkspace>
    </div>
  );
}

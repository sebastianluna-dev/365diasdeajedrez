import type { ReactNode } from "react";
import { CoursesWorkspace } from "@/components/platform/sections/courses/courses-workspace.comp";

/**
 * «Mis cursos» (`/cursos`) and the catalog (`/cursos/catalogo`) share this
 * layout, so the frame — the canvas, the side column and the bar's search —
 * is drawn once and stays while the student moves between views; only the
 * page, the panel, is drawn again, with its `loading.tsx` in its place
 * meanwhile. It awaits nothing, so the frame paints at once: the side
 * column's data streams in behind its own skeleton (`CoursesWorkspace`), and
 * every page under it resolves the user through its data services.
 */
export default function CoursesListLayout({ children }: { children: ReactNode }) {
  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed courses-page">
      <CoursesWorkspace>{children}</CoursesWorkspace>
    </div>
  );
}

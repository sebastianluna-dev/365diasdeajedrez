import type { Metadata } from "next";
import { ToolsLauncherSection } from "@/components/platform/sections/tools/launcher/tools-launcher.section";
import { buildPlatformApps, needsStudentExerciseAccess } from "@/constants/platform/nav-items.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getSessionRoles } from "@/lib/platform-auth/roles";
import { getStudentExerciseAccess } from "@/services/exercises/exercises.service";

export const metadata: Metadata = {
  title: "Herramientas",
};

/**
 * «Herramientas», every tool of the role with what each one does, in the new
 * design system (2026-10-25, the owner's «Herramientas A · Lanzador»): the
 * page takes the window and bleeds onto the canvas, with no side column.
 * Until then the address only redirected to the analysis board, which keeps
 * its own at `/herramientas/tablero-de-analisis`.
 *
 * Its tools are the menu's: composed by role and switches exactly as the
 * shell composes them (`buildPlatformApps`), so a teacher or the staff see
 * here what their menu lists.
 */
export default async function ToolsPage() {
  // Border of the private area: the DAL first.
  await getCurrentUser();
  const roles = await getSessionRoles();
  const hasExerciseSource = needsStudentExerciseAccess(roles) ? await getStudentExerciseAccess() : false;
  const apps = buildPlatformApps({ ...roles, hasExerciseSource });

  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed">
      <div className="platform-workspace platform-workspace_side_none">
        <ToolsLauncherSection apps={apps} />
      </div>
    </div>
  );
}

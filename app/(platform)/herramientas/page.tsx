import { notFound, redirect } from "next/navigation";
import { ANALYSIS_BOARD_ENABLED } from "@/constants/platform/features.const";
import { platformRoutes } from "@/lib/platform-routes";

/** «Herramientas» has no page of its own: its first tool is the analysis board. */
export default function ToolsPage() {
  if (!ANALYSIS_BOARD_ENABLED) notFound();
  redirect(platformRoutes.analysisBoard());
}

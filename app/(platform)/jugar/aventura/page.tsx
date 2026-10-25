import { redirect } from "next/navigation";
import { platformRoutes } from "@/lib/platform-routes";

/**
 * The adventure's shelf. Since 2026-10-25 it is the lower half of «Jugar»
 * (`/jugar#cuadernos`): every game against a bot is an encounter, so «Jugar»
 * is the adventure's page, and one page holds the notebook the person is in
 * and the others. The address is kept for old links (`?error=` from an old
 * form is dropped: the notice would have nothing to say there).
 */
export default function AdventureShelfPage() {
  redirect(`${platformRoutes.play}#cuadernos`);
}

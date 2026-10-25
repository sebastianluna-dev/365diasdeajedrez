import { redirect } from "next/navigation";
import { platformRoutes } from "@/lib/platform-routes";

/**
 * «Partida libre», the old gallery of bots. Since 2026-10-25 every game
 * against a bot is an encounter of an adventure, so the gallery is gone; its
 * address (and `?rival=<slug>`, which opened a bot's popup) is kept for old
 * links and lands on «Jugar», which answers 404 itself when it is off.
 */
export default function FreePlayPage() {
  redirect(platformRoutes.play);
}

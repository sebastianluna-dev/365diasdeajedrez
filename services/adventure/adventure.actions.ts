"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { ADVENTURE_ENABLED, PLAY_ENABLED } from "@/constants/platform/features.const";
import { adventureBotSlug, adventureOf } from "@/lib/adventure/adventures";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { openGame } from "@/services/play/open-game";
import { formCheckbox, formCode, formInt, formText, parseForm } from "@/services/shared/form-schema";
import { withErrorParam } from "@/services/shared/safe-return-to";
import { canStartEncounter } from "./adventure-rules";
import { getAdventureProgress } from "./adventure.service";

// What a person does in an adventure. The action takes the house's order:
// both switches, the user from the DAL, the rate, zod, and only then what the
// story allows — the SERVER enforces the story, so a form posted for a locked
// page is bounced, whatever the screen drew. It is the ONLY way a game against
// a bot is opened (2026-10-25: there is no free game any more); the game itself
// is opened by `openGame` (services/play/open-game.ts), which writes through
// `writePlayedGameRecord` — and with `replace` closes any open game against a
// bot first, an old free one among them. Nothing here writes to the activity log:
// playing never counts toward the streak (services/play/no-activity.test.ts).

const START_SCHEMA = z.object({
  adventure: formText(60),
  encounter: formInt(1, 12),
  color: formCode(["white", "black", "random"]),
  /** Close the open game against a bot (abandoned, or aborted) and start this one. */
  replace: formCheckbox(),
});

/**
 * «Empezar» (the available rival) and «Volver a retar» (a beaten one): opens a
 * game against that encounter's bot. A locked encounter bounces back to the
 * map with `?error=encounterLocked`. Another open game is replaced only with
 * `replace`, which the sheet asks for after warning the person.
 */
export async function startAdventureEncounter(formData: FormData): Promise<void> {
  if (!PLAY_ENABLED || !ADVENTURE_ENABLED) notFound();
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:play-start`, 20, 60_000)))
    redirect(withErrorParam(platformRoutes.play, "throttled"));

  const form = parseForm(START_SCHEMA, formData);
  const adventure = form.ok ? adventureOf(form.data.adventure) : undefined;
  if (!form.ok || !adventure) redirect(withErrorParam(platformRoutes.play, "invalid"));
  const back = platformRoutes.adventureMap(adventure.slug);

  const encounter = adventure.encounters.find((candidate) => candidate.order === form.data.encounter);
  if (!encounter) redirect(withErrorParam(back, "invalid"));

  const progress = await getAdventureProgress(adventure.slug);
  if (!progress || !canStartEncounter(progress.encounters, encounter.order))
    redirect(withErrorParam(back, "encounterLocked"));

  const bot = await getPlatformDb().bot.findFirst({
    where: {
      slug: adventureBotSlug(adventure.slug, encounter.slug),
      isActive: true,
      group: { code: adventure.botGroup },
    },
    select: { id: true, name: true, elo: true },
  });
  if (!bot) redirect(withErrorParam(back, "botNotFound"));

  const color = form.data.color === "random" ? (randomInt(2) === 0 ? "white" : "black") : form.data.color;
  const gameId = await openGame(user.id, user.displayName, bot, color, form.data.replace);

  revalidatePath(back);
  revalidatePath(platformRoutes.play);
  redirect(platformRoutes.playedGame(gameId));
}

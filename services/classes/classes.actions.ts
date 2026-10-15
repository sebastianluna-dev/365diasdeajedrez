"use server";

import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { CLASS_PHASE } from "@/constants/platform/class-codes.const";
import { GAME_RESULT, GAME_RESULT_BY_PGN_TOKEN, GAME_SOURCE } from "@/constants/platform/study-codes.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { formOptionalText, formText, parseForm } from "@/services/shared/form-schema";
import { indexGamePositions } from "@/services/game-positions/game-positions.service";
import { withErrorParam, withNoticeParam } from "@/services/shared/safe-return-to";
import { getClassById } from "./classes.service";

// The student's one write about a class: keeping a game seen in it. The copy
// goes to a study of their own, as `copyPlayedGameToStudy` does with a played
// game; the class and the teacher's game stay where they were.

const SAVE_SCHEMA = z.object({
  study: formText(20),
  title: formOptionalText(120),
});

/**
 * «Guardar en un estudio»: a COPY of a game block's game into one of the
 * student's studies. The student must have a seat in the class, the class
 * must not be cancelled and the block must be one they can see now. Back to
 * the class with `?aviso=gameSaved.<studyId>.<gameId>`.
 */
export async function saveClassGameToStudy(classId: string, blockId: string, formData: FormData): Promise<void> {
  const back = platformRoutes.classDetail(classId);
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:create-game`, 30, 60_000))) redirect(withErrorParam(back, "throttled"));

  const form = parseForm(SAVE_SCHEMA, formData);
  if (!form.ok) redirect(withErrorParam(back, "invalid"));

  const classDetail = await getClassById(classId);
  if (!classDetail) notFound();
  if (classDetail.phase === CLASS_PHASE.CANCELLED) redirect(withErrorParam(back, "invalid"));
  const block = classDetail.blocks.find((candidate) => candidate.id === blockId);
  if (!block || block.kind !== "GAME_REF") redirect(withErrorParam(back, "invalid"));

  const db = getPlatformDb();
  const study = await db.gameDatabase.findFirst({
    where: { id: form.data.study, userId: user.id },
    select: { id: true },
  });
  if (!study) redirect(withErrorParam(back, "invalid"));

  const { game } = block;
  const white = game.players?.white.name ?? "Blancas";
  const black = game.players?.black.name ?? "Negras";
  const created = await db.$transaction(async (tx) => {
    const last = await tx.game.aggregate({ where: { databaseId: study.id }, _max: { order: true } });
    const row = await tx.game.create({
      data: {
        database: { connect: { id: study.id } },
        order: (last._max.order ?? 0) + 1,
        title: form.data.title ?? game.label,
        white,
        black,
        whiteElo: game.players?.white.elo ?? null,
        blackElo: game.players?.black.elo ?? null,
        whiteTitle: game.players?.white.title ?? null,
        blackTitle: game.players?.black.title ?? null,
        whiteCountry: game.players?.white.country ?? null,
        blackCountry: game.players?.black.country ?? null,
        result: { connect: { code: GAME_RESULT_BY_PGN_TOKEN[game.result ?? "*"] ?? GAME_RESULT.ONGOING } },
        event: `Clase «${classDetail.title}»`,
        pgn: game.pgn,
        source: { connect: { code: GAME_SOURCE.MANUAL } },
        isOwnGame: false,
      },
      select: { id: true },
    });
    await indexGamePositions(tx, { gameId: row.id, databaseId: study.id, pgn: game.pgn });
    return row;
  });

  redirect(withNoticeParam(back, "gameSaved", [study.id, created.id]));
}

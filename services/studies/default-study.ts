import "server-only";
import { OWNER_TYPE } from "@/constants/platform/shared-codes.const";
import { DATABASE_KIND } from "@/constants/platform/study-codes.const";
import type { Prisma } from "@/lib/platform-db/generated/client";

// «Mis partidas»: el estudio que existe automáticamente para cada alumno y
// donde van a parar las partidas que no pertenecen a ningún torneo.
//
// Se crea al dar de alta la cuenta y no se crea en ningún otro sitio: el alumno
// no lo pide y la interfaz no lo ofrece. La unicidad no depende de que este
// código se llame una sola vez —dos altas a la vez pasarían las dos cualquier
// comprobación— sino del índice único parcial `game_database_one_default_per_user`
// (SQL manual en la migración 20260904190000, igual que el de asignaciones
// activas de TeacherStudent).
//
// Las cuentas anteriores a esto quedaron cubiertas por el relleno de la misma
// migración, así que no hace falta crearlo perezosamente al entrar: no puede
// faltarle a nadie.

export const DEFAULT_STUDY_NAME = "Mis partidas";

/**
 * Crea «Mis partidas» para un alumno recién dado de alta.
 *
 * @param db cliente o transacción: la alta puede querer que la cuenta y su
 *   estudio entren juntos o ninguno.
 */
export async function createDefaultStudy(db: Prisma.TransactionClient, userId: string): Promise<void> {
  await db.gameDatabase.create({
    data: {
      ownerType: { connect: { code: OWNER_TYPE.USER } },
      user: { connect: { id: userId } },
      kind: { connect: { code: DATABASE_KIND.MY_GAMES } },
      name: DEFAULT_STUDY_NAME,
      description: "Tus partidas que no pertenecen a ningún torneo.",
      isDefault: true,
      order: 0,
    },
  });
}

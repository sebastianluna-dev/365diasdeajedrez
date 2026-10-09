// Prints the SQL of «Jugar»'s catalogs and bots, generated from
// lib/chess/bots/roster.ts and constants/platform/play-codes.const.ts:
//
//   npm run bots:sql > /tmp/bots.sql
//
// It touches no database. Paste the block into a NEW migration whenever the
// roster changes (a bot relabelled by the calibration, one switched off); the
// test of prisma/play-catalog-sql.ts fails until the latest migration carries
// what this prints.

import { playCatalogSql } from "../prisma/play-catalog-sql";

console.log(playCatalogSql());

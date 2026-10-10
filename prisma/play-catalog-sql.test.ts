import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BOT_GROUP } from "../constants/platform/play-codes.const";
import { allBotSeeds } from "../lib/adventure/adventure-bots";
import { BOT_ROSTER } from "../lib/chess/bots/roster";
import { PLAY_CATALOG_BEGIN, PLAY_CATALOG_END, playCatalogSql } from "./play-catalog-sql";

const MIGRATIONS = new URL("./migrations/", import.meta.url);

/** The block of the latest migration that carries one, as written there. */
function latestCatalogBlock(): { migration: string; block: string } | null {
  const folders = readdirSync(MIGRATIONS, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  for (const folder of folders.reverse()) {
    const sql = readFileSync(new URL(`${folder}/migration.sql`, MIGRATIONS), "utf8");
    const begin = sql.indexOf(PLAY_CATALOG_BEGIN);
    if (begin === -1) continue;
    const end = sql.indexOf(PLAY_CATALOG_END, begin);
    return { migration: folder, block: sql.slice(begin, end + PLAY_CATALOG_END.length) };
  }
  return null;
}

describe("playCatalogSql", () => {
  it("is what the latest migration carrying the catalogs has: run `npm run bots:sql` into a new migration", () => {
    const latest = latestCatalogBlock();
    expect(latest, "no migration carries the play catalogs").not.toBeNull();
    expect(latest!.block, latest!.migration).toBe(playCatalogSql());
  });

  it("upserts every bot by slug and never touches an id or a bot's group", () => {
    const sql = playCatalogSql();
    for (const bot of BOT_ROSTER) expect(sql).toContain(`('${bot.slug}', `);
    expect(sql).toContain('ON CONFLICT ("slug") DO UPDATE SET');
    const botUpdate = sql.slice(sql.lastIndexOf("ON CONFLICT"));
    expect(botUpdate).not.toContain('"groupId" = EXCLUDED');
    expect(sql).not.toMatch(/"id" = EXCLUDED/);
  });

  it("writes the hidden group of the adventure unlisted, with the others listed", () => {
    const sql = playCatalogSql();
    const groups = sql.slice(sql.indexOf('INSERT INTO "BotGroup"'), sql.indexOf('INSERT INTO "TimeControl"'));
    expect(groups).toContain(`('${BOT_GROUP.ADVENTURE_CUADERNO}', 'El cuaderno del viajero', 'NONE', 6, FALSE)`);
    expect(groups).toContain("('CHARACTERS', 'Personajes', 'NONE', 0, TRUE)");
    expect(groups.match(/FALSE\)/g)).toHaveLength(1);
    expect(groups).toContain('"isListed" = EXCLUDED."isListed"');
  });

  it("writes an adventure's rival as a bot of the hidden group, with the label it borrows", () => {
    const rival = allBotSeeds().find((bot) => bot.slug === "cuaderno-del-viajero-don-chema")!;
    expect(rival.elo).toBe(412);
    const sql = playCatalogSql();
    const row = sql.split("\n").find((line) => line.startsWith(`  ('${rival.slug}', `))!;
    expect(row).toContain(`'${rival.name}', 412, `);
    expect(row).toContain(`WHERE "code" = '${BOT_GROUP.ADVENTURE_CUADERNO}'`);
  });

  it("writes every bot of the roster and of the adventures once", () => {
    const sql = playCatalogSql();
    for (const bot of allBotSeeds()) expect(sql.split(`  ('${bot.slug}', `)).toHaveLength(2);
  });

  it("escapes quotes in the copy", () => {
    expect(playCatalogSql()).not.toMatch(/[^']'[^',)\s:]+'[^',)\s:]/u);
  });
});

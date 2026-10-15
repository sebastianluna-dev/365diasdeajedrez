import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CATALOG_VALUES } from "./seed-data";

// The migration that brought payments, seats and the attendance log is
// hand-written (docs/ → Platform → Data model → Migrations): Prisma's diff
// gives the structure and the rest — the guard, the catalog rows, the
// backfills, the CHECKs — is added by hand. Pure test, no database: it reads
// the SQL and the schema and checks what a hand can forget.

const MIGRATION = new URL("./migrations/20261014120000_class_payments_and_roles/migration.sql", import.meta.url);
const sql = readFileSync(MIGRATION, "utf8");
const schema = readFileSync(new URL("./schema.prisma", import.meta.url), "utf8");

const CHECKS = [
  "class_payment_amount_positive",
  "class_payment_class_count_range",
  "class_capacity_range",
  "class_duration_positive",
  "class_ends_at_derived",
  "class_participant_free_has_no_payment",
  "class_participant_moved_was_absent",
];

describe("the class_payments_and_roles migration", () => {
  it("inserts every row of the three new catalogs", () => {
    for (const [table, key] of [
      ["Currency", "currency"],
      ["ClassFormat", "classFormat"],
      ["ClassBlockVisibility", "classBlockVisibility"],
    ] as const) {
      const insert = sql.slice(sql.indexOf(`INSERT INTO "${table}"`));
      const block = insert.slice(0, insert.indexOf("ON CONFLICT"));
      for (const [code, label] of CATALOG_VALUES[key]) {
        expect(block, `${table} ${code}`).toContain(`('${code}', '${label}'`);
      }
    }
  });

  it("writes the seven CHECKs by name, with the moved-seat one spelled IS FALSE", () => {
    for (const name of CHECKS) expect(sql, name).toContain(`CONSTRAINT "${name}" CHECK`);
    expect(sql).toContain(`"class_participant_moved_was_absent" CHECK ("seatMovedAt" IS NULL OR "attended" IS FALSE)`);
  });

  it("guards the old payment columns before changing anything", () => {
    const guard = sql.indexOf("RAISE EXCEPTION");
    const firstChange = Math.min(...["ALTER TABLE", "CREATE TABLE", "DROP"].map((word) => sql.indexOf(word)));
    expect(guard).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(firstChange);
  });

  it("every foreign key cascades on update, as Prisma's diff writes them", () => {
    const keys = sql.split("\n").filter((line) => line.includes("FOREIGN KEY"));
    expect(keys.length).toBeGreaterThan(10);
    for (const line of keys) expect(line, line).toContain("ON UPDATE CASCADE");
    expect(keys.find((line) => line.includes("Class_teacherId_fkey"))).toContain("ON DELETE RESTRICT");
  });

  it("the schema names the only writer of every derived column", () => {
    const cases: [string, string, string][] = [
      ["Class", "endsAt", "classScheduleColumns"],
      ["Class", "statusId", "transitionClassStatus"],
      ["Class", "meetingProviderId", "classMeetingColumns"],
      ["Class", "meetingUrlVisibleFrom", "classMeetingColumns"],
      ["Class", "previousScheduledAt", "syncClassSchedule"],
      ["Class", "cancelledAt", "transitionClassStatus"],
      ["Class", "closedAt", "transitionClassStatus"],
      ["Class", "attendanceTakenAt", "recordAttendance"],
      ["ClassParticipant", "paymentId", "syncClassSeat"],
      ["ClassParticipant", "isFree", "syncClassSeat"],
      ["ClassParticipant", "attended", "recordAttendance"],
      ["ClassParticipant", "seatMovedAt", "moveClassSeat"],
    ];
    for (const [model, column, writer] of cases) {
      const start = schema.indexOf(`\nmodel ${model} {`);
      const block = schema.slice(start, schema.indexOf("\n}\n", start)).split("\n");
      const line = block.findIndex((text) => new RegExp(`^\\s+${column}\\s`).test(text));
      expect(line, `${model}.${column}`).toBeGreaterThan(-1);
      const comment = block
        .slice(Math.max(0, line - 6), line)
        .filter((text) => text.trim().startsWith("///"))
        .join(" ");
      expect(comment, `${model}.${column} names ${writer}`).toContain(writer);
    }
  });
});

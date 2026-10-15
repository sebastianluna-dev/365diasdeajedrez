import { describe, expect, it } from "vitest";
import { ACTIVITY_TYPE, SUBJECT_TYPE } from "@/constants/platform/activity-codes.const";
import { recordUserActivity, type ActivityWriter } from "./user-activity.service";

/** A fake client that remembers what was written, so the test sees the order and the count. */
function fakeWriter(metricId: number | null) {
  const created: unknown[] = [];
  const upserts: unknown[][] = [];
  const db: ActivityWriter = {
    async $executeRaw(_query, ...values) {
      upserts.push(values);
    },
    userActivity: {
      async create(args) {
        created.push(args);
      },
    },
    statMetric: {
      async findUnique() {
        return metricId === null ? null : { id: metricId };
      },
    },
  };
  return { db, created, upserts };
}

const base = {
  userId: "user-1",
  typeCode: ACTIVITY_TYPE.CLASS_ATTENDED,
  subjectTypeCode: SUBJECT_TYPE.CLASS,
  subjectId: "class-1",
  occurredAt: new Date("2026-10-14T17:00:00Z"),
};

describe("recordUserActivity", () => {
  it("writes the fact and one daily bucket through the client it is given", async () => {
    const { db, created, upserts } = fakeWriter(7);
    await recordUserActivity(db, base);
    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({ data: { subjectId: "class-1", occurredAt: base.occurredAt } });
    // One upsert: the metric's total, with a null topic.
    expect(upserts).toHaveLength(1);
    expect(upserts[0]!.slice(1)).toEqual(["user-1", expect.any(Date), 7, null]);
  });

  it("adds the topic's breakdown when there is a topic", async () => {
    const { db, upserts } = fakeWriter(7);
    await recordUserActivity(db, { ...base, topicId: 3 });
    expect(upserts.map((values) => values[4])).toEqual([null, 3]);
  });

  it("keeps the fact and skips the aggregate when the metric is unknown", async () => {
    const { db, created, upserts } = fakeWriter(null);
    await recordUserActivity(db, base);
    expect(created).toHaveLength(1);
    expect(upserts).toHaveLength(0);
  });
});

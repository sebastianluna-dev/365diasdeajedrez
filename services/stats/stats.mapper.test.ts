import { describe, expect, it } from "vitest";
import { STAT_METRIC } from "@/constants/platform/activity-codes.const";
import {
  OTHER_TOPICS,
  didComparisons,
  exerciseThemes,
  rootLabels,
  sumIn,
  topicSlices,
  weeklySums,
} from "./stats.mapper";

const TOPICS = [
  { id: 1, label: "Táctica", parentId: null },
  { id: 2, label: "Clavada", parentId: 1 },
  { id: 3, label: "Ataque doble", parentId: 2 },
  { id: 4, label: "Aperturas", parentId: null },
  { id: 5, label: "Finales", parentId: null },
  { id: 6, label: "Estrategia", parentId: null },
  { id: 7, label: "Estructuras de peones", parentId: null },
  { id: 8, label: "Historia", parentId: null },
];

describe("the folds of the statistics", () => {
  it("sum the values of a range and of each week", () => {
    const values = [
      { day: "2026-10-01", value: 10 },
      { day: "2026-10-05", value: 20 },
      { day: "2026-09-30", value: 99 },
    ];
    expect(sumIn(values, { from: "2026-10-01", to: "2026-10-31" })).toBe(30);
    expect(weeklySums(values, [["2026-09-30", "2026-10-01"], ["2026-10-05"]])).toEqual([109, 20]);
  });

  it("name a topic by the root of its tree", () => {
    const labels = rootLabels(TOPICS);
    expect(labels.get(3)).toBe("Táctica");
    expect(labels.get(4)).toBe("Aperturas");
    expect(
      rootLabels([
        { id: 1, label: "A", parentId: 2 },
        { id: 2, label: "B", parentId: 1 },
      ]).get(1),
    ).toBe("B");
  });

  it("break the activity down by topic, the rest as «Otros»", () => {
    const labels = rootLabels(TOPICS);
    const slices = topicSlices(
      [
        { topicId: 2, value: 30 },
        { topicId: 3, value: 11 },
        { topicId: 4, value: 18 },
        { topicId: 5, value: 7 },
        { topicId: 6, value: 3 },
        { topicId: 7, value: 4 },
        { topicId: 8, value: 1 },
        { topicId: 99, value: 50 },
      ],
      labels,
    );
    expect(slices).toEqual([
      { label: "Táctica", value: 41 },
      { label: "Aperturas", value: 18 },
      { label: "Finales", value: 7 },
      { label: "Estructuras de peones", value: 4 },
      { label: OTHER_TOPICS, value: 4 },
    ]);
    // Five topics fit without an «Otros» of one.
    expect(
      topicSlices(
        [1, 4, 5, 6, 7].map((topicId) => ({ topicId, value: 1 })),
        labels,
      ),
    ).toHaveLength(5);
  });

  it("compare what was done with the period before, without it for all the time", () => {
    const current = new Map([
      [STAT_METRIC.LESSONS_COMPLETED, 12],
      [STAT_METRIC.EXERCISES_PASSED, 40],
    ]);
    const previous = new Map([[STAT_METRIC.LESSONS_COMPLETED, 9]]);
    expect(didComparisons(current, previous, true).map((entry) => [entry.key, entry.current, entry.previous])).toEqual([
      ["lessons", 12, 9],
      ["exercises", 40, 0],
      ["classes", 0, 0],
      ["analyzed", 0, 0],
    ]);
    expect(didComparisons(current, null, false).map((entry) => [entry.key, entry.previous])).toEqual([
      ["lessons", null],
      ["classes", null],
      ["analyzed", null],
    ]);
  });

  it("group the attempts by topic, each exercise once per root", () => {
    const topicsOf = new Map([
      ["a", ["Táctica", "Táctica"]],
      ["b", ["Táctica", "Finales"]],
      ["c", []],
    ]);
    expect(
      exerciseThemes(
        [
          { exerciseId: "a", tried: 3, solved: 2 },
          { exerciseId: "b", tried: 1, solved: 1 },
          { exerciseId: "c", tried: 5, solved: 0 },
        ],
        topicsOf,
      ),
    ).toEqual([
      { label: "Táctica", tried: 4, solved: 3 },
      { label: "Finales", tried: 1, solved: 1 },
    ]);
  });
});

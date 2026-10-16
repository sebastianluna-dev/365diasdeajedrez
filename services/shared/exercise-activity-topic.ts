// The topic an exercise's EXERCISE_PASSED activity credits (D22): one
// number, the same in the attempt's writer and in any rebuild, so the same
// exercise always lands in the same slice of the dashboard's breakdown.
//
// The exercise's topics are rolled up to their roots (a tactical motif
// credits «Táctica»), so the breakdown keeps its top-level topics however
// many motifs exist; among the roots, the one with the lowest `order` wins,
// ties by id. Pure module.

/** What the rule reads of a `Topic` row. */
export interface TopicNode {
  id: number;
  parentId: number | null;
  order: number;
}

/** The root a topic hangs from (itself when it has no parent), following the chain to its top. */
function rootOf(id: number, byId: ReadonlyMap<number, TopicNode>): TopicNode | null {
  let node = byId.get(id) ?? null;
  const seen = new Set<number>();
  while (node && node.parentId !== null && !seen.has(node.id)) {
    seen.add(node.id);
    const parent = byId.get(node.parentId);
    if (!parent) break;
    node = parent;
  }
  return node;
}

/**
 * The topic id the activity carries: the lowest-order root of the exercise's
 * topics (ties by id), or null when it has none the catalog knows.
 */
export function exerciseActivityTopic(topicIds: readonly number[], catalog: readonly TopicNode[]): number | null {
  const byId = new Map(catalog.map((topic) => [topic.id, topic]));
  const roots = topicIds.map((id) => rootOf(id, byId)).filter((root): root is TopicNode => root !== null);
  roots.sort((left, right) => left.order - right.order || left.id - right.id);
  return roots[0]?.id ?? null;
}

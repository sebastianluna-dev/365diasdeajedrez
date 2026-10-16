// The Topic catalog as the forms draw it: the topics without a parent first,
// then each parent's children under a heading with the parent's name
// (`PlatformCheckCards`' `groups`), so the nineteen tactical motifs read as a
// part of «Táctica» and not as nineteen more topics. Pure module: the staff
// lesson editor and the exercise editor share it.

/** A topic as the forms receive it: its code, its label and its parent's code. */
export interface TopicChoice {
  code: string;
  label: string;
  /** Null for a topic of the first level. */
  parentCode: string | null;
}

export interface TopicCard {
  value: string;
  label: string;
}

export interface TopicCardGroups {
  /** The topics of the first level, in the catalog's order. */
  options: TopicCard[];
  /** One heading per parent that has children, in the parents' order. */
  groups: { label: string; options: TopicCard[] }[];
}

/**
 * The topics, in the order they come (the catalog's `order`), split into the
 * first level and one group per parent. A child whose parent is not in the
 * list goes with the first level rather than being lost.
 */
export function topicCardGroups(topics: readonly TopicChoice[]): TopicCardGroups {
  const codes = new Set(topics.map((topic) => topic.code));
  const card = (topic: TopicChoice): TopicCard => ({ value: topic.code, label: topic.label });
  const isRoot = (topic: TopicChoice) => topic.parentCode === null || !codes.has(topic.parentCode);
  const groups = topics
    .filter(isRoot)
    .map((parent) => ({
      label: parent.label,
      options: topics.filter((topic) => topic.parentCode === parent.code).map(card),
    }))
    .filter((group) => group.options.length > 0);
  return { options: topics.filter(isRoot).map(card), groups };
}

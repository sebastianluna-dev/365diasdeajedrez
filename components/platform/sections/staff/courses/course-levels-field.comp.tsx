"use client";

import { useState } from "react";
import { PlatformCheckCards } from "@/components/platform/shared/platform-check-cards/platform-check-cards.comp";
import { reachableLevels, shortEloRange } from "@/services/courses/level-rules";

interface CourseLevelsFieldProps {
  /** The catalog of levels, easiest first: the order IS the scale. */
  levels: { slug: string; name: string; eloRange: string }[];
  /** The levels the course is aimed at today. */
  defaultValue: string[];
}

/**
 * Who a course is aimed at: a STRETCH of the scale of levels, chosen by its
 * two ends.
 *
 * A course for «Iniciación» and «Maestro» but not for what lies between says
 * something that cannot be true of a course, so the cards that would leave a
 * gap — or a hole, if the middle of the stretch were removed — are offered
 * switched off (`reachableLevels`). The rule is thus read from the cards
 * themselves, with no sentence to explain it and no error to bounce back.
 *
 * Client because the set of what can be chosen changes with what is chosen.
 * The server checks it again: a form can be sent by hand.
 */
export function CourseLevelsField({ levels, defaultValue }: CourseLevelsFieldProps) {
  const [chosen, setChosen] = useState(defaultValue);
  const order = levels.map((level) => level.slug);
  const reachable = reachableLevels(order, chosen);

  return (
    <PlatformCheckCards
      name="levelSlugs"
      value={chosen}
      onValueChange={setChosen}
      aria-label="Niveles a los que va dirigido"
      layout="line"
      options={levels.map((level) => ({
        value: level.slug,
        label: level.name,
        meta: `(${shortEloRange(level.eloRange)})`,
        disabled: !reachable.has(level.slug),
      }))}
    />
  );
}

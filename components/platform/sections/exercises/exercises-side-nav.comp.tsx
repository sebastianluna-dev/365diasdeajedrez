"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PlatformSideNav } from "@/components/platform/shared/platform-side-nav/platform-side-nav.comp";
import { exercisesNavAction, exercisesNavGroups, type ExercisesNavData } from "./exercises-nav.const";

interface ExercisesSideNavProps {
  /** The topics and the series, as the server read them (`ExercisesSideSection`). */
  data: ExercisesNavData;
}

/**
 * The side column of «Ejercicios» and «Puzzle Rush» in the layout they share:
 * the server reads the topics and the series once, and the browser lights the
 * view on screen and opens the topic of the address (`exercisesNavGroups`),
 * so moving between topics redraws only the panel. «Ver los N subtemas»
 * shows the rest of an opened topic's subtopics. Client, because it follows
 * the address and holds that one choice.
 */
export function ExercisesSideNav({ data }: ExercisesSideNavProps) {
  const pathname = usePathname();
  const params = useSearchParams();
  const [expanded, setExpanded] = useState(false);
  const location = { pathname, params: new URLSearchParams(params.toString()) };
  const { groups, hiddenSubtopics } = exercisesNavGroups(data, location, expanded);
  const shown =
    hiddenSubtopics > 0
      ? groups.map((group) => ({
          ...group,
          links: group.links.map((link) =>
            link.subLinks
              ? {
                  ...link,
                  subMore: {
                    label: `Ver los ${link.subLinks.length + hiddenSubtopics} subtemas`,
                    onSelect: () => setExpanded(true),
                  },
                }
              : link,
          ),
        }))
      : groups;

  return <PlatformSideNav label="Qué practicar" action={exercisesNavAction(location)} groups={shown} />;
}

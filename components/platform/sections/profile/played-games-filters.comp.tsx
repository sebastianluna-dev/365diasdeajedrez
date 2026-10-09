"use client";

import { useRouter } from "next/navigation";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { PlayedGameResultFilter } from "@/services/play/play.types";

const RESULTS: { value: PlayedGameResultFilter; label: string }[] = [
  { value: "win", label: "Ganadas" },
  { value: "loss", label: "Perdidas" },
  { value: "draw", label: "Tablas" },
  { value: "open", label: "En curso" },
];

interface PlayedGamesFiltersProps {
  slug: string;
  rivals: { slug: string; name: string }[];
  rival: string;
  result: string;
}

/**
 * The rival and the result the list keeps, as two selects that navigate: a
 * filter, not a form, so its focus is the accent's red (`tone="accent"`) and
 * it never says an error. A change goes back to the first page.
 */
export function PlayedGamesFilters({ slug, rivals, rival, result }: PlayedGamesFiltersProps) {
  const router = useRouter();
  const go = (next: { rival: string; resultado: string }) =>
    router.push(
      platformRoutes.userProfileGames(slug, { rival: next.rival || undefined, resultado: next.resultado || undefined }),
    );
  return (
    <div className="profile-games__filters">
      <PlatformSelect
        aria-label="Rival"
        tone="accent"
        emptyOption="Todos los rivales"
        options={rivals.map((bot) => ({ value: bot.slug, label: bot.name }))}
        value={rival}
        onValueChange={(value) => go({ rival: value, resultado: result })}
      />
      <PlatformSelect
        aria-label="Resultado"
        tone="accent"
        emptyOption="Todos los resultados"
        options={RESULTS}
        value={result}
        onValueChange={(value) => go({ rival, resultado: value })}
      />
    </div>
  );
}

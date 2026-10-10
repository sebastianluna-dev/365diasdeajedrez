import { notFound } from "next/navigation";
import { AdventureMap } from "@/components/adventure/map/adventure-map/adventure-map.comp";
import { ADVENTURE_ART, adventureOf } from "@/lib/adventure/adventures";
import { isVictoryPlayable } from "@/services/adventure/adventure-rules";
import { getAdventureProgress } from "@/services/adventure/adventure.service";
import { startAdventureEncounter } from "@/services/adventure/adventure.actions";
import { getOwnPlayerCard } from "@/services/profile/profile.service";

interface AdventureMapSectionProps {
  /** The adventure's slug, from the URL. */
  slug: string;
  /** The order of the encounter just beaten (`?victoria=`), already read as a number from 1 to 12, or null. */
  victory: number | null;
  /** Scroll to the stamp to play on opening. The page turns it off when it brings a notice, which would be scrolled out of sight. */
  autoScroll?: boolean;
}

/**
 * The map of one adventure for the current person: it reads their progress
 * (derived from their games: two queries on top of the session) and their
 * card, and hands the client map the data — the progress, the adventure's
 * zones and art, the person's initials. A `victory` only counts when that
 * encounter really is beaten and what it opened has not been touched
 * (`isVictoryPlayable`), so a made-up or old address plays nothing.
 */
export async function AdventureMapSection({ slug, victory, autoScroll = true }: AdventureMapSectionProps) {
  const adventure = adventureOf(slug);
  const art = ADVENTURE_ART[slug];
  if (!adventure || !art) notFound();
  const [progress, me] = await Promise.all([getAdventureProgress(slug), getOwnPlayerCard()]);
  if (!progress) notFound();
  const plays = victory !== null && isVictoryPlayable(progress, victory);
  return (
    <AdventureMap
      progress={progress}
      zones={adventure.zones}
      art={art}
      player={{ initials: me.avatar.initials, name: me.name }}
      victory={plays ? victory : null}
      action={startAdventureEncounter}
      autoScroll={autoScroll}
    />
  );
}

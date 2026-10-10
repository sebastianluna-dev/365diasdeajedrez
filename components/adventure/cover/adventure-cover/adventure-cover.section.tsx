import { AdventureCover } from "@/components/adventure/cover/adventure-cover/adventure-cover.comp";
import { getAdventureProgress } from "@/services/adventure/adventure.service";

/** The adventure the cover is about: the only one that can be played so far. */
const COVER_ADVENTURE = "cuaderno-del-viajero";

/**
 * The cover of «Jugar» when the adventure is on: it reads the person's progress
 * in «El cuaderno del viajero» (derived from their games, one query and the
 * open game) and hands it to the desk. It writes nothing.
 */
export async function AdventureCoverSection() {
  const progress = await getAdventureProgress(COVER_ADVENTURE);
  if (!progress) return null;
  return <AdventureCover progress={progress} />;
}

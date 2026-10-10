import { AdventureShelf } from "@/components/adventure/shelf/adventure-shelf/adventure-shelf.comp";
import { getAdventureShelf } from "@/services/adventure/adventure.service";

/**
 * The shelf of notebooks at `/jugar/aventura`: it reads each playable
 * adventure's progress (one query for all of them) and the notebooks that are
 * coming, and hands them to the room. It writes nothing.
 */
export async function AdventureShelfSection() {
  const shelf = await getAdventureShelf();
  return <AdventureShelf shelf={shelf} />;
}

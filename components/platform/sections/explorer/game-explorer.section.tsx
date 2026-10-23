import { getCurrentUser } from "@/lib/platform-auth/current-user";
import type { GameOriginCode } from "@/services/shared/game-origin";
import { GameExplorer } from "./game-explorer.comp";

interface GameExplorerSectionProps {
  /** Where the search looks (`?origen=`); none for every game the viewer may see. */
  origin?: GameOriginCode;
}

/**
 * Frame of the explorer. The interactive work belongs to the client
 * component, which draws the whole workspace — the side column holds the line
 * and the counts of the search, so it is the board's state too; here the
 * identity is resolved, which is the border of the private area.
 *
 * No result is preloaded on the server on purpose: the first query (the
 * initial position) is made by the client through the same path as all the
 * others, so the explorer's cache serves it just the same when returning to the start.
 */
export async function GameExplorerSection({ origin }: GameExplorerSectionProps) {
  await getCurrentUser();

  return <GameExplorer origin={origin} />;
}

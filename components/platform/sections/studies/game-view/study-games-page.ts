// Which stretch of a study's games its list shows. The list carries every game
// and stays on screen from game to game, so the page is not a URL any more:
// it is worked out here, in the browser, from the game one is on.

/** How many pages of `pageSize` rows the games make; one for an empty list. */
export function pageCountOf(gameCount: number, pageSize: number): number {
  return Math.max(1, Math.ceil(gameCount / pageSize));
}

/**
 * The page (1-based) the game falls on. A game that is not in the list — one
 * just deleted, an address typed by hand — answers the first, so the list
 * never opens on nothing.
 */
export function pageOfGame(games: readonly { id: string }[], gameId: string, pageSize: number): number {
  const index = games.findIndex((game) => game.id === gameId);
  return index < 0 ? 1 : Math.floor(index / pageSize) + 1;
}

/** The games of one page; a page beyond the last answers the last. */
export function gamesOfPage<Game>(games: readonly Game[], page: number, pageSize: number): Game[] {
  const last = pageCountOf(games.length, pageSize);
  const safe = Math.min(Math.max(1, Math.trunc(page) || 1), last);
  return games.slice((safe - 1) * pageSize, safe * pageSize);
}

import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { GameExplorer } from "./game-explorer.comp";

/**
 * Frame of the explorer. The interactive work belongs to the client
 * component; here the identity is resolved, which is the border of the private area.
 *
 * No result is preloaded on the server on purpose: the first query (the
 * initial position) is made by the client through the same path as all the
 * others, so the explorer's cache serves it just the same when returning to the start.
 */
export async function GameExplorerSection() {
  await getCurrentUser();

  return (
    <section className="platform-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Explorador de partidas</h1>
        <p className="platform-page__subtitle">
          Mueve las piezas y descubre qué partidas llegaron a esa posición y cómo siguieron. La búsqueda es por
          posición, así que también encuentra las que llegaron por otro orden de jugadas.
        </p>
      </header>

      <GameExplorer />
    </section>
  );
}

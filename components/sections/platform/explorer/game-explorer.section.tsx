import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { GameExplorer } from "./game-explorer.comp";

/**
 * Marco del explorador. El trabajo interactivo es del componente de cliente;
 * aquí se resuelve la identidad, que es la frontera de la zona privada.
 *
 * No se precarga ningún resultado en servidor a propósito: la primera consulta
 * (la posición inicial) la hace el cliente por el mismo camino que todas las
 * demás, así que la caché del explorador la sirve igual al volver al principio.
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

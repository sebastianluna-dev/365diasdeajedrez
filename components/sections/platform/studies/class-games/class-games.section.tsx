import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state.comp";
import { platformRoutes } from "@/lib/platform-routes";
import { getClassGames } from "@/services/studies/studies.service";
import "./class-games.section.css";

/**
 * Las partidas que el alumno ha visto en sus clases. No es un estudio suyo:
 * son punteros a partidas que viven en la base de otra persona, así que cada
 * fila lleva a la CLASE donde se vio —allí ya tiene acceso y además conserva
 * el contexto— y no al visor de estudios.
 */
export async function ClassGamesSection() {
  // Primer await de la página: el servicio resuelve la identidad en el DAL.
  const games = await getClassGames();

  return (
    <section className="class-games">
      <nav className="class-games__breadcrumb" aria-label="Ruta de estudios">
        <Link href={platformRoutes.studies} className="class-games__breadcrumb-link">
          Mis estudios
        </Link>
        <span className="class-games__breadcrumb-separator">/</span>
        <span className="class-games__breadcrumb-current">Partidas de mis clases</span>
      </nav>

      <header className="platform-page__head">
        <div className="class-games__tags">
          <span className="platform-tag platform-tag_variant_accent">Colección</span>
          <span className="platform-tag">Sólo lectura</span>
        </div>
        <h1 className="platform-page__title">Partidas de mis clases</h1>
        <p className="platform-page__subtitle">
          Las partidas que se vieron en las clases a las que asististe. Cada una se abre en su clase.
        </p>
      </header>

      {games.length > 0 ? (
        <div className="class-games__table-wrap">
          <table className="class-games__table">
            <thead>
              <tr>
                <th className="class-games__header">Blancas</th>
                <th className="class-games__header">Negras</th>
                <th className="class-games__header">Resultado</th>
                <th className="class-games__header">ECO</th>
                <th className="class-games__header">Clase</th>
                <th className="class-games__header">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id} className="class-games__row">
                  <td className="class-games__cell class-games__cell_strong">{game.white}</td>
                  <td className="class-games__cell class-games__cell_strong">{game.black}</td>
                  <td className="class-games__cell">{game.resultLabel}</td>
                  <td className="class-games__cell">{game.eco ?? "—"}</td>
                  <td className="class-games__cell">
                    <Link href={game.href} className="class-games__link">
                      {game.className}
                    </Link>
                  </td>
                  <td className="class-games__cell">{game.classDateLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Todavía no hay partidas de clase"
          description="Cuando en una de tus clases se comente una partida, aparecerá aquí."
        />
      )}
    </section>
  );
}

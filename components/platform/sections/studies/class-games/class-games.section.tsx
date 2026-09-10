import Link from "next/link";
import { EmptyState } from "@/components/platform/shared/empty-state.comp";
import { platformRoutes } from "@/lib/platform-routes";
import { getClassGames } from "@/services/studies/studies.service";
import "./class-games.section.css";

/**
 * The games the student has seen in their classes. It is not a study of
 * theirs: they are pointers to games that live in someone else's database, so
 * each row leads to the CLASS where it was seen — there they already have
 * access and the context is kept — and not to the studies viewer.
 */
export async function ClassGamesSection() {
  // First await of the page: the service resolves the identity in the DAL.
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

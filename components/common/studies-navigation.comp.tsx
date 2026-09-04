import Link from "next/link";
import { platformRoutes } from "@/lib/platform-routes";
import "./studies-navigation.comp.css";

interface StudiesNavigationProps {
  /** Estudio al que pertenece. Sin `studyHref` se pinta como tramo actual. */
  studyName?: string;
  studyHref?: string;
  /** Partida. Sin `gameHref` se pinta como tramo actual. */
  gameName?: string;
  gameHref?: string;
}

/** Ruta contextual Mis estudios → Estudio → Partida. */
export function StudiesNavigation({ studyName, studyHref, gameName, gameHref }: StudiesNavigationProps) {
  return (
    <nav className="studies-navigation" aria-label="Ruta de estudios">
      <Link href={platformRoutes.studies} className="studies-navigation__link">
        Mis estudios
      </Link>

      {studyName && (
        <>
          <span className="studies-navigation__separator">/</span>
          {studyHref ? (
            <Link href={studyHref} className="studies-navigation__link">
              {studyName}
            </Link>
          ) : (
            <span className="studies-navigation__current">{studyName}</span>
          )}
        </>
      )}

      {gameName && (
        <>
          <span className="studies-navigation__separator">/</span>
          {gameHref ? (
            <Link href={gameHref} className="studies-navigation__link">
              {gameName}
            </Link>
          ) : (
            <span className="studies-navigation__current">{gameName}</span>
          )}
        </>
      )}
    </nav>
  );
}

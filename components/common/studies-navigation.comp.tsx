import Link from "next/link";
import { platformRoutes } from "@/lib/platform-routes";
import "./studies-navigation.comp.css";

interface StudiesNavigationProps {
  /** Study it belongs to. Without `studyHref` it is rendered as the current crumb. */
  studyName?: string;
  studyHref?: string;
  /** Game. Without `gameHref` it is rendered as the current crumb. */
  gameName?: string;
  gameHref?: string;
}

/** Contextual trail Mis estudios → Study → Game. */
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

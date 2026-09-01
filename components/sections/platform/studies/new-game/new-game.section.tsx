import Link from "next/link";
import { FormField } from "@/components/common/form-field.comp";
import { PlatformNotice } from "@/components/common/platform-notice.comp";
import { PGN_MAX_LENGTH } from "@/constants/platform/content-limits.const";
import { platformRoutes } from "@/lib/platform-routes";
import { createStudyGame } from "@/services/studies/studies.actions";
import type { StudyDetail, StudyKindOption } from "@/services/studies/studies.types";
import { GameFields } from "../game-fields.comp";
import "./new-game.section.css";

interface NewGameSectionProps {
  study: StudyDetail;
  results: StudyKindOption[];
  errorCode?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  fen: "Esa posición de partida no es válida. Revisa el FEN o déjalo vacío.",
};

/**
 * Alta de una partida. TODO es opcional: enviar el formulario vacío crea una
 * partida en blanco y abre el tablero, que es el camino corto para ponerse a
 * analizar sin tener aún un PGN ni saber quién jugó.
 */
export function NewGameSection({ study, results, errorCode }: NewGameSectionProps) {
  const nextNumber = study.games.length + 1;

  return (
    <section className="new-game">
      <nav className="new-game__breadcrumb" aria-label="Ruta de estudios">
        <Link href={platformRoutes.studies} className="new-game__breadcrumb-link">
          Mis estudios
        </Link>
        <span className="new-game__breadcrumb-separator">/</span>
        <Link href={platformRoutes.studyDetail(study.id)} className="new-game__breadcrumb-link">
          {study.name}
        </Link>
        <span className="new-game__breadcrumb-separator">/</span>
        <span className="new-game__breadcrumb-current">Nueva partida</span>
      </nav>

      <header className="platform-page__head">
        <h1 className="platform-page__title">Nueva partida</h1>
        <p className="platform-page__subtitle">
          No hace falta rellenar nada: puedes crearla en blanco y añadir los datos más tarde.
        </p>
      </header>

      {errorCode && <PlatformNotice message={ERROR_MESSAGES[errorCode] ?? "No se pudo crear la partida."} />}

      <form className="new-game__form" action={createStudyGame.bind(null, study.id)}>
        <div className="platform-card">
          <h2 className="platform-card__title">Datos de la partida</h2>
          <GameFields
            results={results}
            titleHint={`Si lo dejas vacío se llamará «Capítulo ${nextNumber}».`}
          />
        </div>

        <div className="platform-card">
          <h2 className="platform-card__title">Punto de partida</h2>
          <p className="new-game__hint">
            Opcional. Si pegas un PGN, sus cabeceras rellenan los datos que hayas dejado en blanco.
          </p>

          <FormField label="PGN" hint="Una sola partida. Puedes dejarlo vacío y jugar las jugadas sobre el tablero.">
            <textarea
              name="pgn"
              rows={7}
              maxLength={PGN_MAX_LENGTH}
              spellCheck={false}
              placeholder={'[White "Capablanca"]\n[Black "Alekhine"]\n\n1. e4 e5 2. Cf3 *'}
            />
          </FormField>

          <FormField
            label="Posición inicial (FEN)"
            hint="Sólo si la partida arranca de un diagrama y no de la posición inicial."
          >
            <input type="text" name="initialFen" maxLength={120} spellCheck={false} />
          </FormField>
        </div>

        <div className="new-game__actions">
          <button type="submit" className="platform-button">
            Crear y analizar
          </button>
          <Link href={platformRoutes.studyDetail(study.id)} className="platform-button">
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
}

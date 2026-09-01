"use client";

import { AnalysisBoard } from "@/components/common/analysis-board/analysis-board.comp";
import { FormField } from "@/components/common/form-field.comp";
import "./lesson-pgn-editor.comp.css";

interface LessonPgnEditorProps {
  /** Server action ya enlazada con curso, capítulo y lección. */
  action: (formData: FormData) => void;
  pgn: string;
  /** Posición de partida de la lección, para empezar cuando aún no hay PGN. */
  initialFen?: string;
  pgnUpdatedAtLabel?: string;
}

/**
 * El contenido de la lección se anota sobre el tablero: se juega, nacen las
 * variantes y se comentan sin escribir PGN a mano. Pegar un PGN completo sigue
 * siendo posible desde el propio editor, que lleva su panel para eso.
 *
 * El editor publica el PGN en un input oculto, así que la acción del servidor
 * —`updateLessonPgn`— no ha cambiado: sigue siendo quien decide, volviendo a
 * parsear antes de guardar y sellando `pgnUpdatedAt`.
 */
export function LessonPgnEditor({ action, pgn, initialFen, pgnUpdatedAtLabel }: LessonPgnEditorProps) {
  return (
    <form className="lesson-pgn" action={action}>
      <FormField
        label="Contenido de la lección"
        hint={
          pgnUpdatedAtLabel
            ? `Última actualización: ${pgnUpdatedAtLabel}. Al guardar, los ejercicios congelados antes quedarán marcados como desactualizados.`
            : "Movimientos, variantes, comentarios y anotaciones viven aquí."
        }
      >
        <AnalysisBoard name="pgn" defaultPgn={pgn} initialFen={initialFen} />
      </FormField>

      <div className="lesson-pgn__actions">
        <button type="submit" className="platform-button">
          Guardar PGN
        </button>
      </div>
    </form>
  );
}

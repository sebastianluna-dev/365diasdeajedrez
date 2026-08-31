"use client";

import { useMemo, useState } from "react";
import { FormField } from "@/components/common/form-field.comp";
import { GameViewer } from "@/components/common/game-viewer/game-viewer.comp";
import { PGN_MAX_LENGTH } from "@/constants/platform/content-limits.const";
import { parsePgnTree } from "@/lib/chess/pgn-tree";
import "./lesson-pgn-editor.comp.css";

interface LessonPgnEditorProps {
  /** Server action ya enlazada con curso, capítulo y lección. */
  action: (formData: FormData) => void;
  pgn: string;
  pgnUpdatedAtLabel?: string;
}

/**
 * Textarea + previsualización con el visor de siempre. Deliberadamente NO es un
 * editor de PGN interactivo ni un segundo visor: el PGN es la fuente del
 * contenido y se escribe como texto.
 *
 * La previsualización parsea en el cliente por comodidad; quien decide es el
 * servidor, que vuelve a parsear antes de guardar y sella `pgnUpdatedAt`.
 */
export function LessonPgnEditor({ action, pgn, pgnUpdatedAtLabel }: LessonPgnEditorProps) {
  const [draft, setDraft] = useState(pgn);
  const [preview, setPreview] = useState<string | null>(null);

  const parseError = useMemo(() => {
    if (draft.trim().length === 0) return null;
    return parsePgnTree(draft) === null ? "No se puede leer este PGN. Revísalo antes de guardar." : null;
  }, [draft]);

  return (
    <form className="lesson-pgn" action={action}>
      <FormField
        label="PGN de la lección"
        hint={
          pgnUpdatedAtLabel
            ? `Última actualización: ${pgnUpdatedAtLabel}. Al guardar, los ejercicios congelados antes quedarán marcados como desactualizados.`
            : "Movimientos, variantes, comentarios y anotaciones viven aquí."
        }
        error={parseError ?? undefined}
      >
        <textarea
          name="pgn"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={PGN_MAX_LENGTH}
          rows={14}
          spellCheck={false}
        />
      </FormField>

      <div className="lesson-pgn__actions">
        <button type="submit" className="platform-button">
          Guardar PGN
        </button>
        <button
          type="button"
          className="platform-button platform-button_variant_secondary"
          onClick={() => setPreview(draft)}
        >
          Previsualizar
        </button>
        {preview !== null && (
          <button
            type="button"
            className="platform-button platform-button_variant_secondary"
            onClick={() => setPreview(null)}
          >
            Cerrar previsualización
          </button>
        )}
      </div>

      {preview !== null && preview.trim().length > 0 && (
        <div className="lesson-pgn__preview">
          {/* key por contenido: al previsualizar otra versión, el visor arranca
              limpio en vez de arrastrar la posición anterior. */}
          <GameViewer key={preview} pgn={preview} />
        </div>
      )}
    </form>
  );
}

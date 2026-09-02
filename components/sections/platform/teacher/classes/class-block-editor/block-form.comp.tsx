"use client";

import Link from "next/link";
import { useState } from "react";
import { AnalysisBoard } from "@/components/common/analysis-board/analysis-board.comp";
import { FormField } from "@/components/common/form-field.comp";
import { platformRoutes } from "@/lib/platform-routes";
import { CLASS_BLOCK_KIND, type ClassBlockKindCode } from "@/constants/platform/class-codes.const";
import type {
  PositionOption,
  ReferenceableGameGroup,
  TeacherClassBlock,
} from "@/services/teacher-classes/teacher-classes.types";
import { GameSelector } from "./game-selector.comp";
import { LessonReferenceField } from "./lesson-reference-field.comp";
import { MovePathPicker } from "./move-path-picker.comp";
import { PositionSelector } from "./position-selector.comp";
import "./block-form.comp.css";

export interface BlockFormOptions {
  games: ReferenceableGameGroup[];
  positions: PositionOption[];
}

interface BlockFormProps {
  /** Server action ya enlazada con el classId (y el blockId, al editar). */
  action: (formData: FormData) => void;
  kind: ClassBlockKindCode;
  options: BlockFormOptions;
  block?: TeacherClassBlock;
  submitLabel: string;
  onCancel?: () => void;
}

/** Estudio al que pertenece la partida elegida, si el profesor puede anotarla. */
function annotatableStudyOf(groups: BlockFormOptions["games"], gameId: string): string | null {
  if (gameId.length === 0) return null;
  const group = groups.find((candidate) => candidate.games.some((game) => game.id === gameId));
  return group?.isOwn ? group.studyId : null;
}

/**
 * Campos de un bloque según su tipo. El estado que vive aquí es sólo de
 * interfaz (qué referencia está elegida, qué posición se ha marcado): guardar
 * es siempre una server action, que revalida los campos por su cuenta.
 */
export function BlockForm({ action, kind, options, block, submitLabel, onCancel }: BlockFormProps) {
  const [gameId, setGameId] = useState(block?.gameId ?? "");
  const [lessonId, setLessonId] = useState(block?.lessonId ?? "");
  const [positionId, setPositionId] = useState(block?.positionId ?? "");
  const [movePath, setMovePath] = useState(block?.movePath ?? "");

  const referenceId = kind === CLASS_BLOCK_KIND.GAME_REF ? gameId : lessonId;
  // Sólo para la lección y para la partida de un alumno: la transcrita se
  // recorre en su propio tablero, así que no necesita un segundo visor.
  const supportsMovePath =
    kind === CLASS_BLOCK_KIND.LESSON_REF || (kind === CLASS_BLOCK_KIND.GAME_REF && gameId.length > 0);
  const annotatableStudyId = annotatableStudyOf(options.games, gameId);

  return (
    <form className="block-form" action={action}>
      <input type="hidden" name="kind" value={kind} />

      {kind === CLASS_BLOCK_KIND.TEXT && (
        <FormField label="Texto" hint="Se admiten párrafos y subtítulos con «## ».">
          <textarea name="text" defaultValue={block?.text ?? ""} maxLength={10000} required />
        </FormField>
      )}

      {kind === CLASS_BLOCK_KIND.VIDEO && (
        <FormField label="URL del video" hint="Enlace http(s) a la grabación o al video de apoyo.">
          <input type="url" name="videoUrl" defaultValue={block?.videoUrl ?? ""} maxLength={500} required />
        </FormField>
      )}

      {kind === CLASS_BLOCK_KIND.GAME_REF && (
        <>
          {/* Transcribir es el camino principal: no hay nada que elegir antes.
              El tablero ya trae su panel para pegar un PGN si el profesor lo
              tiene. La partida vive en el bloque, no en un estudio. */}
          <FormField
            label="Partida de la clase"
            hint="Juega las jugadas sobre el tablero. Si ya tienes el PGN, pégalo desde «Pegar un PGN» y ajústalo aquí."
          >
            <AnalysisBoard name="pgn" defaultPgn={block?.pgn ?? undefined} />
          </FormField>

          {/* Segunda vía: comentar en clase la partida que jugó un alumno sin
              volver a teclearla. Plegada, porque no es el caso habitual. */}
          <details className="block-form__alternative">
            <summary>…o traer la partida de un alumno</summary>
            <GameSelector groups={options.games} value={gameId} onChange={setGameId} />
            {annotatableStudyId && (
              <p className="block-form__annotate">
                <Link href={platformRoutes.gameEdit(annotatableStudyId, gameId)} className="platform-button platform-button_variant_secondary">
                  Anotar esta partida
                </Link>
              </p>
            )}
          </details>
        </>
      )}

      {kind === CLASS_BLOCK_KIND.LESSON_REF && (
        <LessonReferenceField value={lessonId} onChange={setLessonId} />
      )}

      {kind === CLASS_BLOCK_KIND.POSITION_REF && (
        <PositionSelector positions={options.positions} value={positionId} onChange={setPositionId} />
      )}

      {supportsMovePath && (
        <>
          <input type="hidden" name="movePath" value={movePath} />
          {block?.isMovePathBroken && (
            <p className="block-form__warning" role="alert">
              La posición marcada ya no existe en este contenido (se editó después). Elige otra o quítala: mientras
              tanto, el alumno verá el bloque desde el principio.
            </p>
          )}
          <MovePathPicker
            kind={kind === CLASS_BLOCK_KIND.GAME_REF ? CLASS_BLOCK_KIND.GAME_REF : CLASS_BLOCK_KIND.LESSON_REF}
            referenceId={referenceId}
            value={movePath}
            onChange={setMovePath}
          />
        </>
      )}

      <FormField label="Pie o nota (opcional)">
        <input type="text" name="caption" defaultValue={block?.caption ?? ""} maxLength={200} />
      </FormField>

      <div className="block-form__actions">
        <button type="submit" className="platform-button">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="platform-button platform-button_variant_secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

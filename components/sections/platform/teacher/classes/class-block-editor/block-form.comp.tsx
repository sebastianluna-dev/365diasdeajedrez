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
  /** Server action already bound to the classId (and the blockId, when editing). */
  action: (formData: FormData) => void;
  kind: ClassBlockKindCode;
  options: BlockFormOptions;
  block?: TeacherClassBlock;
  submitLabel: string;
  onCancel?: () => void;
}

/** Study the chosen game belongs to, if the teacher can annotate it. */
function annotatableStudyOf(groups: BlockFormOptions["games"], gameId: string): string | null {
  if (gameId.length === 0) return null;
  const group = groups.find((candidate) => candidate.games.some((game) => game.id === gameId));
  return group?.isOwn ? group.studyId : null;
}

/**
 * Fields of a block by kind. The state that lives here is interface only
 * (which reference is chosen, which position is marked): saving is always a
 * server action, which revalidates the fields on its own.
 */
export function BlockForm({ action, kind, options, block, submitLabel, onCancel }: BlockFormProps) {
  const [gameId, setGameId] = useState(block?.gameId ?? "");
  const [lessonId, setLessonId] = useState(block?.lessonId ?? "");
  const [positionId, setPositionId] = useState(block?.positionId ?? "");
  const [movePath, setMovePath] = useState(block?.movePath ?? "");

  const referenceId = kind === CLASS_BLOCK_KIND.GAME_REF ? gameId : lessonId;
  // Only for the lesson and for a student's game: the transcribed one is
  // traversed on its own board, so it needs no second viewer.
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
          {/* Transcribing is the main path: there is nothing to choose beforehand.
              The board already brings its panel to paste a PGN if the teacher has
              one. The game lives in the block, not in a study. */}
          <FormField
            label="Partida de la clase"
            hint="Juega las jugadas sobre el tablero. Si ya tienes el PGN, pégalo desde «Pegar un PGN» y ajústalo aquí."
          >
            <AnalysisBoard name="pgn" defaultPgn={block?.pgn ?? undefined} />
          </FormField>

          {/* Second route: discuss in class the game a student played without
              typing it again. Folded, because it is not the usual case. */}
          <details className="block-form__alternative">
            <summary>…o traer la partida de un alumno</summary>
            <GameSelector groups={options.games} value={gameId} onChange={setGameId} />
            {annotatableStudyId && (
              <p className="block-form__annotate">
                {/* The game is annotated on its own screen: there the owner plays
                    on the board and comments from the list. */}
                <Link href={platformRoutes.gameDetail(annotatableStudyId, gameId)} className="platform-button platform-button_variant_secondary">
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

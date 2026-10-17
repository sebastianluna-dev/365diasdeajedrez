"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ExercisePicker } from "@/components/platform/shared/exercise-picker/exercise-picker.comp";
import { PlatformChoiceCards } from "@/components/platform/shared/platform-choice-cards/platform-choice-cards.comp";
import { PlatformFormField, PlatformFormGroup } from "@/components/platform/shared/platform-form/platform-form.comp";
import { CLASS_BLOCK_KIND, type ClassBlockKindCode } from "@/constants/platform/class-codes.const";
import { platformRoutes } from "@/lib/platform-routes";
import { EXERCISE_BLOCK_LIMITS } from "@/services/teacher-classes/block-rules";
import type {
  PickableExercise,
  ReferenceableGameGroup,
  TeacherClassBlock,
} from "@/services/teacher-classes/teacher-classes.types";
import { BlockGameField } from "./block-game-field.comp";
import { GameSelector } from "./game-selector.comp";
import { LessonReferenceField } from "./lesson-reference-field.comp";
import { MovePathPicker } from "@/components/platform/shared/move-path-picker/move-path-picker.comp";
import type { FetchReferencePgn } from "@/services/teacher-classes/teacher-classes.types";
import "./block-form.comp.css";

export interface BlockFormOptions {
  games: ReferenceableGameGroup[];
  /** What an EXERCISE block may hold (D29): the teacher's usable exercises and the library's; empty with the flag off. */
  exercises: PickableExercise[];
}

interface BlockFormProps {
  kind: ClassBlockKindCode;
  options: BlockFormOptions;
  /** The block being edited, or the preset of a new one. */
  block?: Partial<TeacherClassBlock>;
  /** What the form sent before the server refused it, by field. */
  values?: Record<string, string | string[]>;
  /** What the server said, by field. */
  errors?: Record<string, string | undefined>;
  /** A group class: a student's game is seen by every student of it. */
  groupSize?: number;
  fetchReferencePgn: FetchReferencePgn;
}

/** Study the chosen game belongs to, if the teacher can annotate it. */
function annotatableStudyOf(groups: ReferenceableGameGroup[], gameId: string): string | null {
  if (gameId.length === 0) return null;
  const group = groups.find((candidate) => candidate.games.some((game) => game.id === gameId));
  return group?.isOwn ? group.studyId : null;
}

/** Whose study the chosen game is in, when it is a student's. */
function ownerOf(groups: ReferenceableGameGroup[], gameId: string): string | null {
  const group = groups.find((candidate) => candidate.games.some((game) => game.id === gameId));
  return group && !group.isOwn ? group.ownerLabel : null;
}

/**
 * The fields of a block by kind, inside the block popup's form: the text, the
 * video's address, the game — transcribed on the board or cited from a
 * study, one or the other —, the lesson by id with its viewer as the check,
 * the opening position of a game or a lesson, and the caption. The state
 * that lives here is interface only (which reference is chosen, which
 * position is marked, which exercises are ticked); saving is the popup's.
 */
export function BlockForm({
  kind,
  options,
  block,
  values = {},
  errors = {},
  groupSize,
  fetchReferencePgn,
}: BlockFormProps) {
  const text = (name: string, fallback = "") =>
    typeof values[name] === "string" ? (values[name] as string) : fallback;
  const [source, setSource] = useState<"pgn" | "game">(
    text("source", block?.gameId && !block?.pgn ? "game" : "pgn") === "game" ? "game" : "pgn",
  );
  const [gameId, setGameId] = useState(text("gameId", block?.gameId ?? ""));
  const [lessonId, setLessonId] = useState(text("lessonId", block?.lessonId ?? ""));
  const [movePath, setMovePath] = useState(text("movePath", block?.movePath ?? ""));
  const sentExercises = values.exercises;
  const [exerciseIds, setExerciseIds] = useState<string[]>(
    Array.isArray(sentExercises) ? sentExercises : sentExercises ? [sentExercises] : (block?.exerciseIds ?? []),
  );

  const referenceId = kind === CLASS_BLOCK_KIND.GAME_REF ? (source === "game" ? gameId : "") : lessonId;
  const referenceKind = kind === CLASS_BLOCK_KIND.GAME_REF ? CLASS_BLOCK_KIND.GAME_REF : CLASS_BLOCK_KIND.LESSON_REF;
  // One function per kind: the picker reads the PGN again only when the reference or the kind changes.
  const fetchPgn = useCallback(
    (id: string) => fetchReferencePgn(referenceKind, id),
    [fetchReferencePgn, referenceKind],
  );
  // Only for the lesson and for a cited game: the transcribed one is
  // traversed on its own board, so it needs no second viewer.
  const supportsMovePath =
    kind === CLASS_BLOCK_KIND.LESSON_REF || (kind === CLASS_BLOCK_KIND.GAME_REF && referenceId.length > 0);
  const annotatableStudyId = annotatableStudyOf(options.games, gameId);
  const owner = ownerOf(options.games, gameId);

  return (
    <div className="block-form">
      {kind === CLASS_BLOCK_KIND.TEXT && (
        <PlatformFormField
          name="text"
          label="Texto"
          hint="Se admiten párrafos y subtítulos con «## »."
          serverError={errors.text}
        >
          <textarea defaultValue={text("text", block?.text ?? "")} rows={6} maxLength={10000} required />
        </PlatformFormField>
      )}

      {kind === CLASS_BLOCK_KIND.VIDEO && (
        <PlatformFormField
          name="videoUrl"
          label="Dirección del video"
          hint="Enlace al video de apoyo o a la grabación."
          serverError={errors.videoUrl}
        >
          <input type="url" defaultValue={text("videoUrl", block?.videoUrl ?? "")} maxLength={500} required />
        </PlatformFormField>
      )}

      {kind === CLASS_BLOCK_KIND.GAME_REF && (
        <>
          <PlatformFormGroup label="La partida">
            <PlatformChoiceCards
              name="source"
              layout="line"
              defaultValue={source}
              onValueChange={(value) => setSource(value === "game" ? "game" : "pgn")}
              options={[
                { value: "pgn", label: "Transcribir", description: "Juega las jugadas en el tablero o pega el PGN." },
                { value: "game", label: "De un estudio", description: "Una partida tuya o de un alumno asignado." },
              ]}
            />
          </PlatformFormGroup>
          {source === "pgn" ? (
            <>
              <BlockGameField name="pgn" defaultPgn={text("pgn", block?.pgn ?? "")} />
              {errors.pgn && <p className="block-form__error">{errors.pgn}</p>}
            </>
          ) : (
            <>
              <GameSelector groups={options.games} defaultValue={gameId || undefined} onChange={setGameId} />
              {errors.gameId && <p className="block-form__error">{errors.gameId}</p>}
              {owner && groupSize !== undefined && groupSize > 1 && (
                <p className="block-form__warning">
                  Los {groupSize} alumnos de la clase verán esta partida de {owner}.
                </p>
              )}
              {annotatableStudyId && (
                <p className="block-form__annotate">
                  <Link href={platformRoutes.gameDetail(annotatableStudyId, gameId)} className="platform-button">
                    Anotar esta partida
                  </Link>
                </p>
              )}
            </>
          )}
        </>
      )}

      {kind === CLASS_BLOCK_KIND.LESSON_REF && (
        <>
          <LessonReferenceField defaultValue={lessonId} onChange={setLessonId} />
          {errors.lessonId && <p className="block-form__error">{errors.lessonId}</p>}
        </>
      )}

      {kind === CLASS_BLOCK_KIND.EXERCISE &&
        (options.exercises.length === 0 ? (
          <p className="block-form__note">
            Todavía no tienes ejercicios listos: márcalos como listos en el editor para agregarlos aquí.
          </p>
        ) : (
          <>
            <p className="block-form__note">
              {exerciseIds.length === 0
                ? `De ${EXERCISE_BLOCK_LIMITS.min} a ${EXERCISE_BLOCK_LIMITS.max} ejercicios, en el orden en que los elijas. El alumno los resuelve desde la clase.`
                : `${exerciseIds.length} ${exerciseIds.length === 1 ? "elegido" : "elegidos"} de ${EXERCISE_BLOCK_LIMITS.max} · el alumno los resuelve desde la clase.`}
            </p>
            <ExercisePicker
              name="exercises"
              exercises={options.exercises}
              value={exerciseIds}
              onValueChange={setExerciseIds}
              label="Ejercicios"
              serverError={errors.exercises}
            />
          </>
        ))}

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
            referenceId={referenceId}
            hint="Navega hasta la posición con la que quieras abrir el bloque y púlsala. Si no eliges ninguna, el bloque empieza desde el principio."
            value={movePath}
            onChange={(path) => setMovePath(path)}
            onClear={() => setMovePath("")}
            fetchPgn={fetchPgn}
          />
        </>
      )}

      <PlatformFormField name="caption" label="Pie o nota" serverError={errors.caption}>
        <input type="text" defaultValue={text("caption", block?.caption ?? "")} maxLength={200} />
      </PlatformFormField>
    </div>
  );
}

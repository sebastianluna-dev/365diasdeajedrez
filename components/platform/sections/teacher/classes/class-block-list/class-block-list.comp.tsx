"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BookOpenIcon } from "@/components/icons/book-open-icon.comp";
import { ChessKnightIcon } from "@/components/icons/chess-knight-icon.comp";
import { GripDotsVerticalIcon } from "@/components/icons/grip-dots-vertical-icon.comp";
import { ParagraphIcon } from "@/components/icons/paragraph-icon.comp";
import { PuzzlePieceIcon } from "@/components/icons/puzzle-piece-icon.comp";
import { VideoIcon } from "@/components/icons/video-icon.comp";
import { ClassContentRenderer } from "@/components/platform/shared/class-content-renderer/class-content-renderer.comp";
import { PlatformActionsMenu } from "@/components/platform/shared/platform-actions-menu/platform-actions-menu.comp";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
} from "@/components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp";
import { PlatformSwitch } from "@/components/platform/shared/platform-switch/platform-switch.comp";
import { SortableDnd } from "@/components/platform/shared/sortable-dnd/sortable-dnd.comp";
import { useSortableStep } from "@/components/platform/shared/sortable-dnd/use-sortable-step.hook";
import {
  CLASS_BLOCK_KIND,
  CLASS_BLOCK_VISIBILITY,
  type ClassBlockVisibilityCode,
  type ClassPhaseCode,
} from "@/constants/platform/class-codes.const";
import type { ClassBlockView } from "@/services/classes/classes.types";
import { blockOrderAfterDrop, isBlockVisibleToStudent, type BlockSections } from "@/services/shared/class-rules";
import type { PopupFormState } from "@/services/shared/form-state";
import { blockVisibilityError } from "@/services/teacher-classes/block-rules";
import type { TeacherClassBlock } from "@/services/teacher-classes/teacher-classes.types";
import type { BlockFormOptions } from "../class-block-editor/block-form.comp";
import { ClassExerciseProgress } from "../class-exercise-progress/class-exercise-progress.comp";
import type { ClassExerciseProgressData } from "../class-exercise-progress/class-exercise-progress.types";
import {
  ADDABLE_BLOCK_KINDS,
  BlockPopup,
  KIND_LABELS,
  type BlockPopupHandle,
} from "../class-block-editor/block-popup.comp";
import type { FetchReferencePgn } from "@/services/teacher-classes/teacher-classes.types";
import "./class-block-list.comp.css";

export interface ClassBlockListProps {
  classId: string;
  blocks: TeacherClassBlock[];
  /** The same blocks as the student's renderer draws them. */
  views: ClassBlockView[];
  /** Per EXERCISE block, who solved what from it (D29): the teacher's row draws this instead of the student's list. */
  exerciseProgress?: ClassExerciseProgressData[];
  phase: ClassPhaseCode;
  /** The content may be edited in this phase. */
  editable: boolean;
  /** Who the student is, as it reads mid-sentence: «tus alumnos», «Alumno Demo»; capitalised when it opens one. */
  studentLabel: string;
  /** «tus alumnos» takes «ven»; one student, «ve». */
  studentPlural?: boolean;
  groupSize: number;
  /** «13:00»: when the material «Después de la clase» opens. */
  endHour: string;
  options: BlockFormOptions;
  /** A game chosen elsewhere: the popup opens on it. */
  initialGameId?: string;
  /** The server actions, as functions; stubs in Storybook. */
  actions: {
    addClassBlock: (classId: string, prev: PopupFormState, formData: FormData) => Promise<PopupFormState>;
    updateClassBlock: (
      classId: string,
      blockId: string,
      prev: PopupFormState,
      formData: FormData,
    ) => Promise<PopupFormState>;
    deleteClassBlock: (classId: string, blockId: string, formData: FormData) => Promise<void>;
    reorderClassBlocks: (
      classId: string,
      orderedIds: string[],
      moved?: { blockId: string; visibility: ClassBlockVisibilityCode },
    ) => Promise<{ ok: boolean }>;
    fetchReferencePgn: FetchReferencePgn;
  };
}

const SECTIONS: { code: ClassBlockVisibilityCode; label: string }[] = [
  { code: CLASS_BLOCK_VISIBILITY.BEFORE, label: "Para preparar" },
  { code: CLASS_BLOCK_VISIBILITY.AFTER, label: "Después de la clase" },
  { code: CLASS_BLOCK_VISIBILITY.TEACHER, label: "Guion del profesor" },
];

const KIND_ICONS = {
  TEXT: ParagraphIcon,
  VIDEO: VideoIcon,
  GAME_REF: ChessKnightIcon,
  LESSON_REF: BookOpenIcon,
  POSITION_REF: ChessKnightIcon,
  FILE: ParagraphIcon,
  EXERCISE: PuzzlePieceIcon,
} as const;

/** The block's heading in a row: its caption, its material's name, or its kind. */
function nameOf(block: TeacherClassBlock, view: ClassBlockView | undefined): string {
  if (view?.title) return view.title;
  if (block.caption) return block.caption;
  if (block.referenceLabel) return block.referenceLabel;
  if (block.kind === CLASS_BLOCK_KIND.TEXT) return (block.text ?? "").split("\n")[0]?.slice(0, 80) || "Texto";
  return KIND_LABELS[block.kind];
}

/** «tus alumnos» → «Tus alumnos», for the label that opens a sentence; a name is already capitalised. */
function capitalize(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function sectionsOf(blocks: TeacherClassBlock[]): BlockSections {
  const by = (visibility: ClassBlockVisibilityCode) =>
    blocks
      .filter((block) => block.visibility === visibility)
      .sort((left, right) => left.order - right.order)
      .map((block) => block.id);
  return { BEFORE: by("BEFORE"), AFTER: by("AFTER"), TEACHER: by("TEACHER") };
}

/**
 * The class's material as the teacher edits it: three sections — what the
 * student prepares, what they see after, the teacher's script —, each a
 * sortable list of blocks drawn as the student will see them and folded to
 * a line, with its «…» («Editar», «Pasar a …», «Subir», «Bajar»,
 * «Eliminar») and, at the foot, what can be added (D17). The class has ONE
 * order however the screen splits it: a drop or a step rebuilds the whole
 * list (`blockOrderAfterDrop`) and sends it entire. «Ver como alumno» draws
 * only what the student sees now, as they see it.
 */
export function ClassBlockList({
  classId,
  blocks,
  views,
  exerciseProgress = [],
  phase,
  editable,
  studentLabel,
  studentPlural = false,
  groupSize,
  endHour,
  options,
  initialGameId,
  actions,
}: ClassBlockListProps) {
  // «ve» or «ven»: the label is one student's name or «tus alumnos».
  const sees = studentPlural ? "ven" : "ve";
  const studentSubject = capitalize(studentLabel);
  const [sections, setSections] = useState(() => sectionsOf(blocks));
  const [baseline, setBaseline] = useState(blocks);
  if (blocks !== baseline) {
    setBaseline(blocks);
    setSections(sectionsOf(blocks));
  }
  const [asStudent, setAsStudent] = useState(false);
  const [, startSave] = useTransition();
  const popup = useRef<BlockPopupHandle>(null);
  const confirm = useRef<PlatformConfirmPopupHandle>(null);
  const [pendingDelete, setPendingDelete] = useState<TeacherClassBlock | null>(null);
  const byId = new Map(blocks.map((block) => [block.id, block]));
  const viewById = new Map(views.map((view) => [view.id, view]));
  const progressById = new Map(exerciseProgress.map((progress) => [progress.blockId, progress]));

  const save = (next: BlockSections, moved?: { blockId: string; visibility: ClassBlockVisibilityCode }) => {
    setSections(next);
    startSave(async () => {
      const result = await actions.reorderClassBlocks(classId, [...next.BEFORE, ...next.AFTER, ...next.TEACHER], moved);
      if (!result.ok) setSections(sectionsOf(baseline));
    });
  };
  const moveWithin = (visibility: ClassBlockVisibilityCode) => (activeId: string, overId: string) => {
    const without = sections[visibility].filter((id) => id !== activeId);
    const index = without.indexOf(overId);
    const place = sections[visibility].indexOf(activeId) < sections[visibility].indexOf(overId) ? index + 1 : index;
    const order = blockOrderAfterDrop(sections, activeId, visibility, Math.max(0, place));
    save(fromOrder(order, activeId, visibility));
  };
  const moveTo = (block: TeacherClassBlock, visibility: ClassBlockVisibilityCode) => {
    const order = blockOrderAfterDrop(sections, block.id, visibility, sections[visibility].length);
    save(fromOrder(order, block.id, visibility), { blockId: block.id, visibility });
  };
  /** The sections again from the full order and the one block that may have changed section. */
  const fromOrder = (order: string[], movedId: string, to: ClassBlockVisibilityCode): BlockSections => {
    const visibilityOf = (id: string) => (id === movedId ? to : (byId.get(id)?.visibility ?? "BEFORE"));
    return {
      BEFORE: order.filter((id) => visibilityOf(id) === "BEFORE"),
      AFTER: order.filter((id) => visibilityOf(id) === "AFTER"),
      TEACHER: order.filter((id) => visibilityOf(id) === "TEACHER"),
    };
  };

  // Opened from «Usar en una clase»: the popup on the game, once mounted.
  useEffect(() => {
    if (initialGameId) {
      popup.current?.open(undefined, {
        kind: CLASS_BLOCK_KIND.GAME_REF,
        visibility: CLASS_BLOCK_VISIBILITY.BEFORE,
        gameId: initialGameId,
      });
    }
  }, [initialGameId]);

  const visibleNow = SECTIONS.filter((section) => isBlockVisibleToStudent(section.code, phase));
  const studentSees = blocks
    .filter((block) => isBlockVisibleToStudent(block.visibility, phase))
    .map((block) => viewById.get(block.id))
    .filter((view): view is ClassBlockView => view !== undefined);

  return (
    <div className="class-block-list">
      <div className="class-block-list__head">
        <h2 className="class-block-list__title">Contenido</h2>
        <PlatformSwitch
          label="Ver como alumno"
          tone="accent"
          layout="inline"
          checked={asStudent}
          onCheckedChange={setAsStudent}
        />
      </div>

      {asStudent ? (
        <div className="class-block-list__student">
          <p className="class-block-list__band">
            Así lo {sees} {studentLabel} ahora:{" "}
            {visibleNow.length === 0
              ? "nada todavía"
              : `sólo ${visibleNow.map((section) => `«${section.label}»`).join(" y ")}`}
            .
          </p>
          {studentSees.length > 0 ? (
            <ClassContentRenderer blocks={studentSees} />
          ) : (
            <p className="class-block-list__empty">
              {studentSubject} no {sees} ningún bloque todavía.
            </p>
          )}
        </div>
      ) : (
        SECTIONS.map((section) => {
          const ids = sections[section.code];
          const items = ids.flatMap((id) => {
            const block = byId.get(id);
            return block ? [{ id, name: nameOf(block, viewById.get(id)) }] : [];
          });
          return (
            <section
              key={section.code}
              className="class-block-list__section"
              aria-labelledby={`blocks-${section.code}`}
            >
              <div className="class-block-list__section-head">
                <h3 id={`blocks-${section.code}`} className="class-block-list__section-title">
                  {section.label}
                </h3>
                <p className="class-block-list__section-note">
                  {section.code === CLASS_BLOCK_VISIBILITY.BEFORE
                    ? `${studentSubject} ya lo ${sees}.`
                    : section.code === CLASS_BLOCK_VISIBILITY.AFTER
                      ? `Lo verá cuando termine la clase, a las ${endHour}.`
                      : "Sólo lo ves tú."}
                </p>
              </div>
              {items.length === 0 ? (
                <p className="class-block-list__empty">Sin bloques.</p>
              ) : (
                <SortableDnd items={items} noun="bloque" onMove={moveWithin(section.code)}>
                  <ol className="class-block-list__rows">
                    {items.map((item, index) => {
                      const block = byId.get(item.id);
                      if (!block) return null;
                      return (
                        <Row
                          key={item.id}
                          block={block}
                          view={viewById.get(item.id)}
                          progress={progressById.get(item.id)}
                          name={item.name}
                          number={index + 1}
                          editable={editable}
                          onEdit={() => popup.current?.open(undefined, { visibility: block.visibility, block })}
                          onMoveTo={(visibility) => moveTo(block, visibility)}
                          onDelete={() => {
                            setPendingDelete(block);
                            confirm.current?.open();
                          }}
                        />
                      );
                    })}
                  </ol>
                </SortableDnd>
              )}
              {editable && (
                <p className="class-block-list__add">
                  {ADDABLE_BLOCK_KINDS.filter(
                    // An exercise block is never the teacher's script (D30): the same rule the row's «Pasar a …» follows.
                    (kind) => blockVisibilityError({ kind, visibility: section.code }) === null,
                  ).map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      className="platform-row-action"
                      onClick={(event) => popup.current?.open(event, { kind, visibility: section.code })}
                    >
                      + {KIND_LABELS[kind]}
                    </button>
                  ))}
                </p>
              )}
            </section>
          );
        })
      )}

      <BlockPopup
        ref={popup}
        classId={classId}
        options={options}
        groupSize={groupSize}
        endHour={endHour}
        studentLabel={studentLabel}
        studentPlural={studentPlural}
        addClassBlock={actions.addClassBlock}
        updateClassBlock={actions.updateClassBlock}
        fetchReferencePgn={actions.fetchReferencePgn}
      />
      <PlatformConfirmPopup
        ref={confirm}
        verb="Eliminar"
        subject={pendingDelete ? nameOf(pendingDelete, viewById.get(pendingDelete.id)) : "bloque"}
        description={
          pendingDelete
            ? `Se elimina el bloque «${nameOf(pendingDelete, viewById.get(pendingDelete.id))}» de la clase.`
            : ""
        }
        action={actions.deleteClassBlock.bind(null, classId, pendingDelete?.id ?? "")}
        confirmLabel="Eliminar bloque"
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}

interface RowProps {
  block: TeacherClassBlock;
  view: ClassBlockView | undefined;
  /** An EXERCISE block's «2 de 3 lo resolvieron», drawn in the row instead of the student's list. */
  progress?: ClassExerciseProgressData;
  name: string;
  number: number;
  editable: boolean;
  onEdit: () => void;
  onMoveTo: (visibility: ClassBlockVisibilityCode) => void;
  onDelete: () => void;
}

/** A block in its section: the grip, the line that folds its render — an exercise block, who solved it —, and its «…». */
function Row({ block, view, progress, name, number, editable, onEdit, onMoveTo, onDelete }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: { name },
  });
  const steps = useSortableStep(block.id);
  const Icon = KIND_ICONS[block.kind];
  // The sections the block could go to: not its own, and never the script for an exercise block (D30).
  const others = SECTIONS.filter(
    (section) =>
      section.code !== block.visibility &&
      blockVisibilityError({ kind: block.kind, visibility: section.code }) === null,
  );

  return (
    <li
      ref={setNodeRef}
      className={`class-block-list__row${isDragging ? " class-block-list__row_state_dragging" : ""}`}
      // The only inline style of the block: where the row IS while it travels.
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      {editable && (
        <button
          type="button"
          className="class-block-list__grip"
          aria-label={`Mover el bloque «${name}»`}
          {...attributes}
          {...listeners}
        >
          <GripDotsVerticalIcon variant="duotone-solid" />
        </button>
      )}
      <details className="class-block-list__block">
        <summary className="class-block-list__summary">
          <Icon className="class-block-list__kind" />
          <span className="class-block-list__kind-word">{KIND_LABELS[block.kind]} ·</span>
          <span className="class-block-list__name">{name}</span>
          {block.isMovePathBroken && (
            <span className="platform-tag platform-tag_variant_warning">Posición perdida</span>
          )}
        </summary>
        <div className="class-block-list__body">
          {progress ? (
            <ClassExerciseProgress progress={progress} />
          ) : view ? (
            <ClassContentRenderer blocks={[view]} />
          ) : (
            <p className="class-block-list__empty">Este bloque no se puede mostrar.</p>
          )}
        </div>
      </details>
      {editable && (
        <PlatformActionsMenu
          label={`Opciones del bloque ${number}: ${KIND_LABELS[block.kind]} ${name}`}
          items={[
            { label: "Editar", onSelect: onEdit },
            ...others.map((section) => ({
              label: `Pasar a «${section.label}»`,
              onSelect: () => onMoveTo(section.code),
            })),
            { label: "Subir", disabled: steps.up === null, reason: "Ya es el primero", onSelect: () => steps.up?.() },
            {
              label: "Bajar",
              disabled: steps.down === null,
              reason: "Ya es el último",
              onSelect: () => steps.down?.(),
            },
            { label: "Eliminar", tone: "danger", onSelect: onDelete },
          ]}
        />
      )}
    </li>
  );
}

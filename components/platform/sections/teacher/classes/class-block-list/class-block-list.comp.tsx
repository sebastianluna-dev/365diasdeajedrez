"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BookOpenIcon } from "@/components/icons/book-open-icon.comp";
import { ChessKnightIcon } from "@/components/icons/chess-knight-icon.comp";
import { GripDotsVerticalIcon } from "@/components/icons/grip-dots-vertical-icon.comp";
import { ParagraphIcon } from "@/components/icons/paragraph-icon.comp";
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
  type ClassBlockKindCode,
  type ClassBlockVisibilityCode,
  type ClassPhaseCode,
} from "@/constants/platform/class-codes.const";
import type { ClassBlockView } from "@/services/classes/classes.types";
import { blockOrderAfterDrop, isBlockVisibleToStudent, type BlockSections } from "@/services/shared/class-rules";
import type { PopupFormState } from "@/services/shared/form-state";
import type { TeacherClassBlock } from "@/services/teacher-classes/teacher-classes.types";
import type { BlockFormOptions } from "../class-block-editor/block-form.comp";
import { BlockPopup, KIND_LABELS, type BlockPopupHandle } from "../class-block-editor/block-popup.comp";
import type { FetchReferencePgn } from "@/services/teacher-classes/teacher-classes.types";
import "./class-block-list.comp.css";

export interface ClassBlockListProps {
  classId: string;
  blocks: TeacherClassBlock[];
  /** The same blocks as the student's renderer draws them. */
  views: ClassBlockView[];
  phase: ClassPhaseCode;
  /** The content may be edited in this phase. */
  editable: boolean;
  /** «Alumno Demo», «tus alumnos». */
  studentLabel: string;
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

const ADDABLE: ClassBlockKindCode[] = [
  CLASS_BLOCK_KIND.TEXT,
  CLASS_BLOCK_KIND.GAME_REF,
  CLASS_BLOCK_KIND.LESSON_REF,
  CLASS_BLOCK_KIND.VIDEO,
];

const KIND_ICONS = {
  TEXT: ParagraphIcon,
  VIDEO: VideoIcon,
  GAME_REF: ChessKnightIcon,
  LESSON_REF: BookOpenIcon,
  POSITION_REF: ChessKnightIcon,
  FILE: ParagraphIcon,
} as const;

/** The block's heading in a row: its caption, its material's name, or its kind. */
function nameOf(block: TeacherClassBlock, view: ClassBlockView | undefined): string {
  if (view?.title) return view.title;
  if (block.caption) return block.caption;
  if (block.referenceLabel) return block.referenceLabel;
  if (block.kind === CLASS_BLOCK_KIND.TEXT) return (block.text ?? "").split("\n")[0]?.slice(0, 80) || "Texto";
  return KIND_LABELS[block.kind];
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
  phase,
  editable,
  studentLabel,
  groupSize,
  endHour,
  options,
  initialGameId,
  actions,
}: ClassBlockListProps) {
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
            Así lo ve {studentLabel} ahora:{" "}
            {visibleNow.length === 0
              ? "nada todavía"
              : `sólo ${visibleNow.map((section) => `«${section.label}»`).join(" y ")}`}
            .
          </p>
          {studentSees.length > 0 ? (
            <ClassContentRenderer blocks={studentSees} />
          ) : (
            <p className="class-block-list__empty">{studentLabel} no ve ningún bloque todavía.</p>
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
                    ? `${studentLabel} ya lo ve.`
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
                  {ADDABLE.map((kind) => (
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
  name: string;
  number: number;
  editable: boolean;
  onEdit: () => void;
  onMoveTo: (visibility: ClassBlockVisibilityCode) => void;
  onDelete: () => void;
}

/** A block in its section: the grip, the line that folds its render, and its «…». */
function Row({ block, view, name, number, editable, onEdit, onMoveTo, onDelete }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: { name },
  });
  const steps = useSortableStep(block.id);
  const Icon = KIND_ICONS[block.kind];
  const others = SECTIONS.filter((section) => section.code !== block.visibility);

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
          {view ? (
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

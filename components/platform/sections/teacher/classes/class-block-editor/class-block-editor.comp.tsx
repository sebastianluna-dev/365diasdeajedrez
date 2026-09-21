"use client";

import { useState } from "react";
import { FormField } from "@/components/platform/shared/form-field.comp";
import { CLASS_BLOCK_KIND, type ClassBlockKindCode } from "@/constants/platform/class-codes.const";
import {
  addClassBlock,
  deleteClassBlock,
  moveClassBlock,
  updateClassBlock,
} from "@/services/teacher-classes/teacher-classes.actions";
import type { TeacherClassBlock } from "@/services/teacher-classes/teacher-classes.types";
import { BlockForm, type BlockFormOptions } from "./block-form.comp";
import "./class-block-editor.comp.css";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";

interface ClassBlockEditorProps {
  classId: string;
  blocks: TeacherClassBlock[];
  options: BlockFormOptions;
  /** Game preselected when arriving from "Usar en una clase" (`?gameId=`). */
  initialGameId?: string;
}

const KIND_LABELS: Record<ClassBlockKindCode, string> = {
  [CLASS_BLOCK_KIND.TEXT]: "Texto",
  [CLASS_BLOCK_KIND.VIDEO]: "Video",
  [CLASS_BLOCK_KIND.GAME_REF]: "Partida",
  [CLASS_BLOCK_KIND.LESSON_REF]: "Lección",
  [CLASS_BLOCK_KIND.POSITION_REF]: "Posición",
  [CLASS_BLOCK_KIND.FILE]: "Archivo",
};

function blockSummary(block: TeacherClassBlock): string {
  if (block.kind === CLASS_BLOCK_KIND.TEXT) return (block.text ?? "").slice(0, 90);
  if (block.kind === CLASS_BLOCK_KIND.VIDEO) return block.videoUrl ?? "";
  return block.referenceLabel ?? block.caption ?? "Sin referencia";
}

/**
 * Editor of the class content. The state that lives here is interface ONLY
 * (which block is open, which kind is being added): every operation — add,
 * edit, move, delete — is a server action that revalidates the page. Preparing
 * a class is neither collaborative nor high-frequency, so there is no
 * optimistic state that could drift from the database.
 */
export function ClassBlockEditor({ classId, blocks, options, initialGameId }: ClassBlockEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newKind, setNewKind] = useState<ClassBlockKindCode | null>(initialGameId ? CLASS_BLOCK_KIND.GAME_REF : null);

  const gamePrefill: TeacherClassBlock | undefined = initialGameId
    ? {
        id: "nuevo",
        order: blocks.length + 1,
        kind: CLASS_BLOCK_KIND.GAME_REF,
        gameId: initialGameId,
        isMovePathBroken: false,
      }
    : undefined;

  return (
    <div className="class-block-editor">
      <ol className="class-block-editor__list">
        {blocks.map((block, index) => (
          <li key={block.id} className="class-block-editor__item">
            <div className="class-block-editor__row">
              <span className="platform-tag">{KIND_LABELS[block.kind]}</span>
              <span className="class-block-editor__summary">{blockSummary(block)}</span>

              <div className="class-block-editor__controls">
                <form action={moveClassBlock.bind(null, classId)}>
                  <input type="hidden" name="blockId" value={block.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    className="class-block-editor__control"
                    aria-label="Subir bloque"
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                </form>

                <form action={moveClassBlock.bind(null, classId)}>
                  <input type="hidden" name="blockId" value={block.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    className="class-block-editor__control"
                    aria-label="Bajar bloque"
                    disabled={index === blocks.length - 1}
                  >
                    ↓
                  </button>
                </form>

                <button
                  type="button"
                  className="class-block-editor__control"
                  onClick={() => setEditingId(editingId === block.id ? null : block.id)}
                >
                  {editingId === block.id ? "Cerrar" : "Editar"}
                </button>

                <form action={deleteClassBlock.bind(null, classId)}>
                  <input type="hidden" name="blockId" value={block.id} />
                  <SubmitButton
                    className="class-block-editor__control class-block-editor__control_variant_danger"
                    pendingLabel="Eliminando…"
                  >
                    Eliminar
                  </SubmitButton>
                </form>
              </div>
            </div>

            {block.isMovePathBroken && editingId !== block.id && (
              <p className="class-block-editor__warning" role="alert">
                La posición marcada en este bloque ya no existe en el contenido referenciado.
              </p>
            )}

            {editingId === block.id && (
              <BlockForm
                action={updateClassBlock.bind(null, classId, block.id)}
                kind={block.kind}
                options={options}
                block={block}
                submitLabel="Guardar bloque"
                onCancel={() => setEditingId(null)}
              />
            )}
          </li>
        ))}
      </ol>

      <div className="class-block-editor__add">
        <FormField label="Añadir un bloque">
          <select
            value={newKind ?? ""}
            onChange={(event) => setNewKind((event.target.value || null) as ClassBlockKindCode | null)}
          >
            <option value="">Elige un tipo…</option>
            {Object.values(CLASS_BLOCK_KIND).map((kind) => (
              <option key={kind} value={kind}>
                {KIND_LABELS[kind]}
              </option>
            ))}
          </select>
        </FormField>

        {newKind && (
          <BlockForm
            key={newKind}
            action={addClassBlock.bind(null, classId)}
            kind={newKind}
            options={options}
            block={newKind === CLASS_BLOCK_KIND.GAME_REF ? gamePrefill : undefined}
            submitLabel="Añadir bloque"
            onCancel={() => setNewKind(null)}
          />
        )}
      </div>
    </div>
  );
}

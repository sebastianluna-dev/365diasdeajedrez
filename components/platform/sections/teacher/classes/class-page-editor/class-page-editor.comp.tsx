"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Popover } from "radix-ui";
import { createContext, useContext, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { GripDotsVerticalIcon } from "@/components/icons/grip-dots-vertical-icon.comp";
import { PlusIcon } from "@/components/icons/plus-icon.comp";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
} from "@/components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { SortableDnd } from "@/components/platform/shared/sortable-dnd/sortable-dnd.comp";
import { useSortableStep } from "@/components/platform/shared/sortable-dnd/use-sortable-step.hook";
import { readDiagramPgn, writeDiagramPgn } from "@/lib/chess/diagram-notation";
import {
  convertText,
  duplicateBlock,
  insertAfter,
  isTextBlock,
  isTextKind,
  kindInfo,
  markdownShortcut,
  moveTo,
  newBlock,
  type ClassPageEditorOptions,
  type EditorBlock,
  type EditorKind,
  type TextBlock,
  type TextKind,
} from "./class-page-editor.model";
import { EditableText } from "./editable-text.comp";
import { EditorBlockView, type TextEditing } from "./editor-block.comp";
import { EditorBlockMenu } from "./editor-block-menu.comp";
import { EditorBoardPopup, type EditorBoardPopupHandle } from "./editor-board-popup.comp";
import { EditorSlashMenu } from "./editor-slash-menu.comp";
import "./class-page-editor.comp.css";

interface ClassPageEditorProps {
  /** The class's title, typed over the blocks; none where the page already shows it in its head. */
  title?: string;
  /** «Jueves 29 de octubre · 18:00», over the title; none where the page already says when. */
  dateline?: string;
  blocks: EditorBlock[];
  /** What the blocks that cite something can choose from. */
  options: ClassPageEditorOptions;
  /** The view it opens in: the student's, for a story. Default `edit`. */
  defaultMode?: "edit" | "student";
  /** The class can no longer be edited (over, cancelled): only the student's view, with no way to edit. */
  readOnly?: boolean;
}

/** Where the caret goes in a text block: its start, its end, or a number of characters in. */
type CaretAt = "start" | "end" | number;

const makeId = () => crypto.randomUUID();

/** How many characters of the element come before the caret (the end of the selection). */
function caretOffset(element: HTMLElement): number {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return element.textContent?.length ?? 0;
  const range = selection.getRangeAt(0);
  const before = document.createRange();
  before.selectNodeContents(element);
  before.setEnd(range.endContainer, range.endOffset);
  return before.toString().length;
}

function placeCaret(element: HTMLElement, at: CaretAt) {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  const node = element.firstChild;
  if (typeof at === "number" && node?.nodeType === Node.TEXT_NODE) {
    range.setStart(node, Math.min(at, node.textContent?.length ?? 0));
    range.collapse(true);
  } else {
    range.selectNodeContents(element);
    range.collapse(at === "start");
  }
  selection.removeAllRanges();
  selection.addRange(range);
}

/** A block with nothing in it yet: the student's view leaves it out. */
function isEmptyBlock(block: EditorBlock): boolean {
  if (isTextBlock(block)) return block.text.trim() === "";
  switch (block.kind) {
    case "game":
      return !block.game;
    case "lesson":
      return !block.lesson;
    case "exercises":
      return !block.series;
    case "video":
      return !block.url;
    case "file":
      return !block.file;
    default:
      return false;
  }
}

/** What the confirmation calls a block: the start of its words, or what kind it is. */
function subjectOf(block: EditorBlock): string {
  const words = isTextBlock(block) ? block.text.trim() : "";
  if (!words) return kindInfo(block.kind).label;
  return words.length > 40 ? `${words.slice(0, 40).trimEnd()}…` : words;
}

function rowClassOf(block: EditorBlock): string {
  return `class-page-editor__row class-page-editor__row_kind_${block.kind}`;
}

/** The handle of the row it is in, as dnd-kit gives it: what the ⋮⋮ spreads on itself. */
const RowHandle = createContext<Pick<
  ReturnType<typeof useSortable>,
  "attributes" | "listeners" | "setActivatorNodeRef"
> | null>(null);

/**
 * A block's row while the page is edited: a sortable item of `SortableDnd`,
 * moved by the ⋮⋮ of its gutter (`RowGutter`) and drawn where it travels.
 * It only places what it is given.
 */
function SortableRow({
  id,
  name,
  className,
  children,
}: {
  id: string;
  name: string;
  className: string;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { name },
  });
  return (
    <div
      ref={setNodeRef}
      className={`${className}${isDragging ? " class-page-editor__row_state_dragging" : ""}`}
      // The only inline style of the row: where it IS while it travels. Moved, never
      // scaled: blocks differ in height, and a paragraph shrunk to a heading is unreadable.
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      <RowHandle value={{ attributes, listeners, setActivatorNodeRef }}>{children}</RowHandle>
    </div>
  );
}

interface RowGutterProps {
  block: EditorBlock;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onAdd: () => void;
  onConvert: (kind: TextKind) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

/**
 * The «+» and the ⋮⋮ in a row's left margin. The ⋮⋮ is the row's dnd-kit
 * handle and the trigger of its menu at once: a click opens the menu (a drag
 * only starts after 5px), Enter opens it from the keyboard and Space picks
 * the row up, as `SortableDnd` tells the screen reader. «Mover arriba» and
 * «Mover abajo» are the list's steps (`useSortableStep`), so where the block
 * lands is said too.
 */
function RowGutter({ block, menuOpen, onMenuOpenChange, onAdd, ...menu }: RowGutterProps) {
  const handle = useContext(RowHandle);
  const steps = useSortableStep(block.id);
  const label = kindInfo(block.kind).label;
  return (
    <div className="class-page-editor__gutter">
      <button
        type="button"
        className="class-page-editor__handle"
        aria-label={`Agregar un bloque debajo de «${label}»`}
        onClick={onAdd}
      >
        <PlusIcon variant="classic-solid" />
      </button>
      <Popover.Root open={menuOpen} onOpenChange={onMenuOpenChange}>
        <Popover.Trigger
          ref={handle?.setActivatorNodeRef}
          className="class-page-editor__handle class-page-editor__handle_role_grip"
          {...handle?.attributes}
          {...handle?.listeners}
          aria-label={`Opciones de «${label}»; arrástralo para moverlo`}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onMenuOpenChange(true);
              return;
            }
            handle?.listeners?.onKeyDown?.(event);
          }}
        >
          <GripDotsVerticalIcon variant="classic-solid" />
        </Popover.Trigger>
        <EditorBlockMenu
          block={block}
          canMoveUp={steps.up !== null}
          canMoveDown={steps.down !== null}
          onMove={(delta) => (delta < 0 ? steps.up : steps.down)?.()}
          {...menu}
        />
      </Popover.Root>
    </div>
  );
}

/**
 * The teacher's class page as one page to write on, the way Notion works
 * (2026-10-19, option A of the editor canvas). The page looks like the
 * student's notebook and is typed in place: «/» in an empty line opens the
 * menu of blocks, «# », «## », «- » and «> » turn a paragraph into a title, a
 * subtitle, a list or a quote, Enter splits a block, Backspace at its start
 * joins it to the one above (or, empty, takes it away). Pointing at a block
 * shows its «+», which adds one under it, and its ⋮⋮ handle, which is dragged
 * to move the block and opens its menu: who sees it, what text it is,
 * Duplicar, the moves and Eliminar, which asks first. A block the student does
 * not see yet, or never, says so in its margin. «Vista del alumno» draws the
 * page as the student will read it after the class.
 *
 * Front-only: the blocks live in this component's state and nothing stores
 * them; the page says so while it is edited.
 */
export function ClassPageEditor({
  title,
  dateline,
  blocks: initialBlocks,
  options,
  defaultMode = "edit",
  readOnly = false,
}: ClassPageEditorProps) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [heading, setHeading] = useState(title ?? "");
  const [chosenMode, setMode] = useState(defaultMode);
  const mode = readOnly ? "student" : chosenMode;
  const [slash, setSlash] = useState<{ at: string | null; replace: boolean; use: number } | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [removing, setRemoving] = useState<EditorBlock | null>(null);
  const elements = useRef(new Map<string, HTMLElement>());
  const endLine = useRef<HTMLInputElement>(null);
  const pendingFocus = useRef<{ id: string; at: CaretAt } | null>(null);
  const boardPopup = useRef<EditorBoardPopupHandle>(null);
  const confirm = useRef<PlatformConfirmPopupHandle>(null);
  const editing = mode === "edit";

  // A caret asked for by the last change lands once the block it names is drawn.
  useEffect(() => {
    const request = pendingFocus.current;
    const element = request && elements.current.get(request.id);
    if (!request || !element) return;
    pendingFocus.current = null;
    element.focus();
    placeCaret(element, request.at);
  });

  const focusBlock = (id: string, at: CaretAt) => {
    pendingFocus.current = { id, at };
  };
  const replaceBlock = (next: EditorBlock) =>
    setBlocks((list) => list.map((item) => (item.id === next.id ? next : item)));

  const openSlash = (at: string | null, replace: boolean) => {
    setMenuFor(null);
    setSlash((current) => ({ at, replace, use: (current?.use ?? 0) + 1 }));
  };
  const closeSlash = () => {
    const closed = slash;
    setSlash(null);
    if (!closed) return;
    if (closed.at === null) endLine.current?.focus();
    else if (closed.replace) {
      const element = elements.current.get(closed.at);
      element?.focus();
      if (element) placeCaret(element, "end");
    }
  };
  const choose = (kind: EditorKind) => {
    const target = slash;
    if (!target) return;
    setSlash(null);
    const anchor = blocks.find((item) => item.id === target.at);
    const block = newBlock(kind, makeId);
    if (target.replace && anchor) {
      replaceBlock({ ...block, id: anchor.id });
      if (isTextKind(kind)) focusBlock(anchor.id, "start");
    } else {
      setBlocks((list) => insertAfter(list, target.at, block));
      if (isTextKind(kind)) focusBlock(block.id, "start");
    }
  };

  const textEditing: TextEditing = {
    register: (id, element) => {
      if (element) elements.current.set(id, element);
      else elements.current.delete(id);
    },
    onInput: (block, value) => {
      const shortcut = block.kind === "text" ? markdownShortcut(value) : null;
      if (shortcut) {
        replaceBlock(convertText(block, shortcut.kind, shortcut.rest));
        focusBlock(block.id, "start");
        return;
      }
      setBlocks((list) =>
        list.map((item) => (item.id === block.id && isTextBlock(item) ? { ...item, text: value } : item)),
      );
    },
    onKeyDown: (block, event) => textKeyDown(block, event),
  };

  const textKeyDown = (block: TextBlock, event: KeyboardEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const value = element.textContent ?? "";
    const index = blocks.findIndex((item) => item.id === block.id);
    const previous = blocks[index - 1];
    const next = blocks[index + 1];

    if (event.key === "/" && value === "") {
      event.preventDefault();
      openSlash(block.id, true);
      return;
    }

    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      // An empty point leaves the list, as in Notion.
      if (block.kind === "list" && value === "") {
        replaceBlock(convertText(block, "text", ""));
        focusBlock(block.id, "start");
        return;
      }
      const offset = caretOffset(element);
      const before = value.slice(0, offset);
      const split = newBlock(block.kind === "list" ? "list" : "text", makeId) as TextBlock;
      // The block has the caret, so the text is cut here: the element does not rewrite itself while focused.
      element.textContent = before;
      setBlocks((list) =>
        insertAfter(
          list.map((item) => (item.id === block.id ? { ...block, text: before } : item)),
          block.id,
          { ...split, text: value.slice(offset) },
        ),
      );
      focusBlock(split.id, "start");
      return;
    }

    if (event.key === "Backspace" && caretOffset(element) === 0) {
      if (block.kind !== "text") {
        // A title, a point or a quote goes back to being a paragraph first.
        event.preventDefault();
        replaceBlock(convertText(block, "text", value));
        focusBlock(block.id, "start");
        return;
      }
      if (previous && isTextBlock(previous)) {
        event.preventDefault();
        setBlocks((list) =>
          list
            .filter((item) => item.id !== block.id)
            .map((item) => (item.id === previous.id ? { ...previous, text: previous.text + value } : item)),
        );
        focusBlock(previous.id, previous.text.length);
        return;
      }
      if (value === "" && index > 0) {
        event.preventDefault();
        setBlocks((list) => list.filter((item) => item.id !== block.id));
      }
      return;
    }

    if (event.key === "ArrowUp" && caretOffset(element) === 0 && previous && isTextBlock(previous)) {
      event.preventDefault();
      const target = elements.current.get(previous.id);
      target?.focus();
      if (target) placeCaret(target, "end");
    }
    if (event.key === "ArrowDown" && caretOffset(element) === value.length && next && isTextBlock(next)) {
      event.preventDefault();
      const target = elements.current.get(next.id);
      target?.focus();
      if (target) placeCaret(target, "start");
    }
  };

  const endKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "/") {
      event.preventDefault();
      openSlash(null, false);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const block = newBlock("text", makeId);
      setBlocks((list) => [...list, block]);
      focusBlock(block.id, "start");
    }
  };

  const shown = editing ? blocks : blocks.filter((block) => !isEmptyBlock(block));

  /** What a row holds besides its handles: the block, with the «/» menu that opens under it. */
  const rowBody = (block: EditorBlock) => (
    <>
      <Popover.Root open={slash?.at === block.id} onOpenChange={(open) => !open && closeSlash()}>
        <Popover.Anchor asChild>
          <div className="class-page-editor__body">
            <EditorBlockView
              block={block}
              mode={mode}
              options={options}
              onChange={replaceBlock}
              text={textEditing}
              onEditBoard={(event, target) => {
                if (target.kind === "diagram") {
                  boardPopup.current?.open(event, {
                    pgn: target.pgn,
                    positionOnly: false,
                    onSave: (pgn) => replaceBlock({ ...target, pgn }),
                  });
                  return;
                }
                boardPopup.current?.open(event, {
                  pgn: writeDiagramPgn({
                    fen: target.fen,
                    orientation: target.orientation,
                    caption: "",
                    circles: [],
                    arrows: [],
                  }),
                  positionOnly: true,
                  onSave: (pgn) => {
                    const position = readDiagramPgn(pgn);
                    if (position) replaceBlock({ ...target, fen: position.fen, orientation: position.orientation });
                  },
                });
              }}
            />
          </div>
        </Popover.Anchor>
        <EditorSlashMenu key={slash?.use ?? 0} onChoose={choose} onClose={closeSlash} />
      </Popover.Root>
    </>
  );

  return (
    <div className={`class-page-editor class-page-editor_mode_${mode}`}>
      <div className="class-page-editor__bar">
        {dateline !== undefined ? (
          <p className="class-page-editor__dateline">{dateline}</p>
        ) : (
          <h2 className="class-page-editor__section-title">Contenido de la clase</h2>
        )}
        {!readOnly && (
          <div className="class-page-editor__modes" role="group" aria-label="Qué ves">
            <button
              type="button"
              className="class-page-editor__mode"
              aria-pressed={editing}
              onClick={() => setMode("edit")}
            >
              Editar
            </button>
            <button
              type="button"
              className="class-page-editor__mode"
              aria-pressed={!editing}
              onClick={() => {
                setSlash(null);
                setMenuFor(null);
                setMode("student");
              }}
            >
              Vista del alumno
            </button>
          </div>
        )}
      </div>

      {editing && (
        <PlatformNotice variant="info" message="Vista previa del editor: lo que escribas aquí todavía no se guarda." />
      )}

      {title === undefined ? null : editing ? (
        <EditableText
          className="class-page-editor__title"
          text={heading}
          label="Título de la clase"
          placeholder="Título de la clase"
          onText={setHeading}
        />
      ) : (
        <h1 className="class-page-editor__title">{heading}</h1>
      )}

      <div className="class-page-editor__blocks">
        {editing ? (
          <SortableDnd
            items={blocks.map((block) => ({ id: block.id, name: subjectOf(block) }))}
            noun="bloque"
            onMove={(activeId, overId) => setBlocks((list) => moveTo(list, activeId, overId))}
          >
            {blocks.map((block) => (
              <SortableRow key={block.id} id={block.id} name={subjectOf(block)} className={rowClassOf(block)}>
                <RowGutter
                  block={block}
                  menuOpen={menuFor === block.id}
                  onMenuOpenChange={(open) => setMenuFor(open ? block.id : null)}
                  onAdd={() => openSlash(block.id, false)}
                  onConvert={(kind) => {
                    if (isTextBlock(block)) replaceBlock(convertText(block, kind));
                    setMenuFor(null);
                  }}
                  onDuplicate={() => {
                    setBlocks((list) => duplicateBlock(list, block.id, makeId));
                    setMenuFor(null);
                  }}
                  onRemove={() => {
                    setMenuFor(null);
                    setRemoving(block);
                    confirm.current?.open();
                  }}
                />
                {rowBody(block)}
              </SortableRow>
            ))}
          </SortableDnd>
        ) : (
          shown.map((block) => (
            <div key={block.id} className={rowClassOf(block)}>
              {rowBody(block)}
            </div>
          ))
        )}

        {editing && (
          <div className="class-page-editor__row">
            <Popover.Root open={slash?.at === null} onOpenChange={(open) => !open && closeSlash()}>
              <Popover.Anchor asChild>
                <input
                  ref={endLine}
                  type="text"
                  className="class-page-editor__end"
                  aria-label="Agregar un bloque al final"
                  placeholder="Escribe, o «/» para agregar un bloque"
                  onKeyDown={endKeyDown}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    event.currentTarget.value = "";
                    if (!value) return;
                    const block = { ...(newBlock("text", makeId) as TextBlock), text: value };
                    setBlocks((list) => [...list, block]);
                    focusBlock(block.id, "end");
                  }}
                />
              </Popover.Anchor>
              <EditorSlashMenu key={slash?.use ?? 0} onChoose={choose} onClose={closeSlash} />
            </Popover.Root>
          </div>
        )}
      </div>

      <EditorBoardPopup ref={boardPopup} />
      <PlatformConfirmPopup
        ref={confirm}
        subject={removing ? subjectOf(removing) : ""}
        description="Se elimina el bloque de la clase, con todo lo que tiene."
        confirmLabel="Eliminar bloque"
        action={async () => {
          const gone = removing;
          if (gone) setBlocks((list) => list.filter((item) => item.id !== gone.id));
        }}
        onClose={() => setRemoving(null)}
      />
    </div>
  );
}

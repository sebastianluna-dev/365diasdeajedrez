"use client";

import { Popover } from "radix-ui";
import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { BlockKindIcon } from "./block-kind-icon.comp";
import { BLOCK_GROUPS, matchKinds, type EditorKind } from "./class-page-editor.model";
import "./editor-slash-menu.comp.css";

interface EditorSlashMenuProps {
  onChoose: (kind: EditorKind) => void;
  onClose: () => void;
}

/**
 * The «/» menu: the kinds of block, by group, filtered by what is typed after
 * the slash. A combobox: the focus stays in its search box, the arrows move
 * the highlighted kind (`aria-activedescendant`), Enter takes it, and Escape,
 * or Backspace with nothing typed, closes it as Notion does. It is the
 * content of a Radix `Popover` whose root and anchor are the editor's (the
 * block it opens under), not portalled, and it plays on `data-state`.
 */
export function EditorSlashMenu({ onChoose, onClose }: EditorSlashMenuProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  const found = matchKinds(query);
  const current = found[Math.min(active, found.length - 1)];
  const optionId = (kind: EditorKind) => `${listId}-${kind}`;

  // The highlighted kind stays in sight while the arrows walk the list.
  useEffect(() => {
    if (current) document.getElementById(`${listId}-${current.kind}`)?.scrollIntoView({ block: "nearest" });
  }, [current, listId]);

  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((index) =>
        found.length === 0 ? 0 : (Math.min(index, found.length - 1) + step + found.length) % found.length,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (current) onChoose(current.kind);
    } else if (event.key === "Backspace" && query === "") {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <Popover.Content
      className="editor-slash-menu"
      side="bottom"
      align="start"
      sideOffset={4}
      collisionPadding={8}
      aria-label="Agregar un bloque"
      onCloseAutoFocus={(event) => event.preventDefault()}
    >
      <div className="editor-slash-menu__search">
        <span className="editor-slash-menu__slash" aria-hidden="true">
          /
        </span>
        <input
          className="editor-slash-menu__input"
          type="text"
          role="combobox"
          aria-label="Busca un tipo de bloque"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={current ? optionId(current.kind) : undefined}
          placeholder="Busca un bloque"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={keyDown}
        />
      </div>
      <div id={listId} className="editor-slash-menu__list" role="listbox" aria-label="Tipos de bloque">
        {BLOCK_GROUPS.map((group) => {
          const items = found.filter((info) => info.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="editor-slash-menu__group" role="group" aria-label={group}>
              <p className="editor-slash-menu__group-name" aria-hidden="true">
                {group}
              </p>
              {items.map((info) => {
                const isActive = info === current;
                return (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events -- the combobox's search box takes the keys, through aria-activedescendant
                  <div
                    key={info.kind}
                    id={optionId(info.kind)}
                    className={`editor-slash-menu__option${isActive ? " editor-slash-menu__option_state_active" : ""}`}
                    role="option"
                    aria-selected={isActive}
                    tabIndex={-1}
                    onMouseMove={() => setActive(found.indexOf(info))}
                    onClick={() => onChoose(info.kind)}
                  >
                    <span className="editor-slash-menu__icon">
                      <BlockKindIcon kind={info.kind} />
                    </span>
                    <span className="editor-slash-menu__text">
                      <span className="editor-slash-menu__name">{info.label}</span>
                      <span className="editor-slash-menu__hint">{info.hint}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {found.length === 0 && <p className="editor-slash-menu__none">Ningún bloque se llama así.</p>}
    </Popover.Content>
  );
}

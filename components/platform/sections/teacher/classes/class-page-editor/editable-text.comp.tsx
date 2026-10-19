"use client";

import {
  useLayoutEffect,
  useRef,
  type ClipboardEvent,
  type ElementType,
  type FormEvent,
  type KeyboardEvent,
} from "react";

interface EditableTextProps {
  /**
   * A `span` inside a line (a point of a list); a `div` otherwise. Never the
   * heading or the paragraph the student's page draws: a `textbox` role is
   * not allowed on those (axe, aria-allowed-role), so while it is typed a
   * title is a box that looks like one.
   */
  inline?: boolean;
  text: string;
  /** Its accessible name: «Párrafo», «Título», «Pie del diagrama». */
  label: string;
  /** What it says while empty, drawn by the stylesheet from `data-placeholder`. */
  placeholder: string;
  className?: string;
  onText: (text: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  /** The element, for the editor to put the caret in it. */
  elementRef?: (element: HTMLElement | null) => void;
}

/**
 * A piece of plain text typed in place, on a `contenteditable` element. It is
 * uncontrolled: the text is written into the element when it mounts and when
 * it changes from outside while it does not have the focus, never while it is
 * being typed, so React never rewrites what is under the caret (a caption
 * that comes back from its PGN without a trailing space included). A paste keeps only
 * the text, and an emptied element is left truly empty, so its placeholder
 * shows again.
 */
export function EditableText({
  inline = false,
  text,
  label,
  placeholder,
  className,
  onText,
  onKeyDown,
  elementRef,
}: EditableTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const Tag: ElementType = inline ? "span" : "div";

  useLayoutEffect(() => {
    const element = ref.current;
    if (element && element.textContent !== text && document.activeElement !== element) element.textContent = text;
  }, [text]);

  const paste = (event: ClipboardEvent<HTMLElement>) => {
    event.preventDefault();
    const plain = event.clipboardData.getData("text/plain").replace(/\s*\n\s*/g, " ");
    // The one way to insert at the caret that the browser's undo still knows.
    document.execCommand("insertText", false, plain);
  };

  return (
    <Tag
      ref={(element: HTMLElement | null) => {
        ref.current = element;
        elementRef?.(element);
      }}
      className={className}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      tabIndex={0}
      aria-label={label}
      aria-placeholder={placeholder}
      data-placeholder={placeholder}
      spellCheck
      onInput={(event: FormEvent<HTMLElement>) => {
        const element = event.currentTarget;
        if (element.textContent === "") element.replaceChildren();
        onText(element.textContent ?? "");
      }}
      onKeyDown={onKeyDown}
      onPaste={paste}
    />
  );
}

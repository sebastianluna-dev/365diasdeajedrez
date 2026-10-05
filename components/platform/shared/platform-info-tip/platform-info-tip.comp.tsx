"use client";

import { useRef, useState } from "react";
import { Tooltip } from "radix-ui";
import { CircleInfoIcon } from "@/components/icons/circle-info-icon.comp";
import "./platform-info-tip.comp.css";

interface PlatformInfoTipProps {
  /** What the tip says. Plain text: a sentence or two. */
  text: string;
  /** The button's accessible name, which says what the tip is about: "Sobre el slug". */
  label: string;
  /** The side of the button the tip opens on, when there is room. */
  side?: "top" | "right" | "bottom" | "left";
}

/**
 * A clarification folded into an "i": a small round button that shows its
 * text on hover and on keyboard focus, on Radix's `Tooltip` primitive, which
 * ties the text to the button with `aria-describedby` and closes it with
 * Escape. For what helps the first time and is noise every time after; what
 * the person needs in order to fill the field in stays a visible hint.
 *
 * A press opens it as well: a touch screen has no hover, and the primitive
 * on its own closes on press. It is NOT portalled, like the select's list: a
 * portal to `<body>` would be inert under a modal `<dialog>`.
 *
 * Not being portalled, inside a dialog it is the dialog that clips it, and
 * the primitive only keeps a tip within the window: beside a label at the
 * dialog's left edge the tip came out cut. So when the button lives in a
 * `<dialog>`, that dialog is the box the tip is kept within.
 */
export function PlatformInfoTip({ text, label, side = "top" }: PlatformInfoTipProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [boundary, setBoundary] = useState<Element | null>(null);

  /** Looked up when it opens: by then the button is in its dialog, if it has one. */
  const changeOpen = (next: boolean) => {
    if (next) setBoundary(buttonRef.current?.closest("dialog") ?? null);
    setOpen(next);
  };

  return (
    <Tooltip.Provider delayDuration={120}>
      <Tooltip.Root open={open} onOpenChange={changeOpen}>
        <Tooltip.Trigger asChild>
          <button
            ref={buttonRef}
            type="button"
            className="platform-info-tip"
            aria-label={label}
            // `preventDefault` keeps the primitive from closing on press.
            onPointerDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.preventDefault();
              changeOpen(true);
            }}
          >
            <CircleInfoIcon variant="classic-light" className="platform-info-tip__icon" />
          </button>
        </Tooltip.Trigger>

        <Tooltip.Content
          className="platform-info-tip__content"
          side={side}
          align="end"
          sideOffset={8}
          collisionBoundary={boundary ?? []}
          collisionPadding={8}
        >
          {text}
          <Tooltip.Arrow className="platform-info-tip__arrow" width={12} height={6} />
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

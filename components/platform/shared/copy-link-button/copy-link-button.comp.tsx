"use client";

import { useEffect, useState } from "react";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { CopyIcon } from "@/components/icons/copy-icon.comp";
import { mdButton, mdIconButton } from "@/lib/material/material-classes";
import "./copy-link-button.comp.css";

interface CopyLinkButtonProps {
  url: string;
  /** The button's accessible name: «Copiar el enlace de la reunión». */
  label: string;
  /**
   * `sm`: quiet and small, beside a line of text; `lg`: the secondary box at
   * 48px, beside a large «Entrar a la clase» (a class's ticket).
   */
  size?: "sm" | "lg";
  /**
   * On a page moved to the new design system, Material's button instead:
   * `tonal` the 40px tonal button with the label written beside the icon (a
   * class's «Copiar el enlace»), `icon` a bare icon button (a toolbar's).
   * It wins over `size`.
   */
  material?: "tonal" | "icon";
}

const COPIED_MS = 2000;

/**
 * A square button, quiet and small or boxed and large, that copies a link to the clipboard and says so for
 * two seconds: the tick in place of the copy icon, and «Enlace copiado» in a
 * live region a screen reader hears. Where the clipboard is not available
 * (an insecure context), the button stays and does nothing it cannot do.
 */
export function CopyLinkButton({ url, label, size = "sm", material }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <span className="copy-link-button">
      <button
        type="button"
        className={
          material === "tonal"
            ? mdButton("tonal", "sm")
            : material === "icon"
              ? mdIconButton("standard", "sm")
              : size === "lg"
                ? "platform-button platform-button_size_lg platform-button_shape_square"
                : "platform-button platform-button_variant_quiet platform-button_size_sm platform-button_shape_square"
        }
        aria-label={material === "tonal" ? undefined : label}
        onClick={copy}
      >
        {copied ? (
          <CheckIcon
            variant="classic-solid"
            className={`${material ? "platform-md-icon" : "platform-button__icon"} copy-link-button__done`}
          />
        ) : (
          <CopyIcon variant="classic-solid" className={material ? "platform-md-icon" : "platform-button__icon"} />
        )}
        {material === "tonal" && label}
      </button>
      <span className="copy-link-button__status" role="status" aria-live="polite">
        {copied ? "Enlace copiado" : ""}
      </span>
    </span>
  );
}

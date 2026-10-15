"use client";

import { useEffect, useState } from "react";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { CopyIcon } from "@/components/icons/copy-icon.comp";
import "./copy-link-button.comp.css";

interface CopyLinkButtonProps {
  url: string;
  /** The button's accessible name: «Copiar el enlace de la reunión». */
  label: string;
}

const COPIED_MS = 2000;

/**
 * A quiet square button that copies a link to the clipboard and says so for
 * two seconds: the tick in place of the copy icon, and «Enlace copiado» in a
 * live region a screen reader hears. Where the clipboard is not available
 * (an insecure context), the button stays and does nothing it cannot do.
 */
export function CopyLinkButton({ url, label }: CopyLinkButtonProps) {
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
        className="platform-button platform-button_variant_quiet platform-button_size_sm platform-button_shape_square"
        aria-label={label}
        onClick={copy}
      >
        {copied ? (
          <CheckIcon variant="classic-solid" className="platform-button__icon copy-link-button__done" />
        ) : (
          <CopyIcon variant="classic-solid" className="platform-button__icon" />
        )}
      </button>
      <span className="copy-link-button__status" role="status" aria-live="polite">
        {copied ? "Enlace copiado" : ""}
      </span>
    </span>
  );
}

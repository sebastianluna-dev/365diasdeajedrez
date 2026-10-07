"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { SpinnerIcon } from "@/components/icons/spinner-icon.comp";

interface SubmitButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  /** Text shown while the form is being submitted. */
  pendingLabel?: ReactNode;
  children: ReactNode;
}

/**
 * Submit button that says the form is on its way. It is the only piece of a
 * plain server-action form that needs JavaScript: without it the button still
 * submits, only without the pending text. `useFormStatus` reads the status of
 * the nearest `<form>`, so a form with several of these disables them all
 * together while one is submitting, which is what avoids a double click.
 *
 * Drawn as the platform's button (`platform-button`), its loading state says
 * so twice: the gerund of its `pendingLabel` and a turning ring before it —
 * the button keeps its own colours, since it is not refused but working. A
 * row action written as a word (`platform-row-action`) gets the gerund alone.
 */
export function SubmitButton({
  pendingLabel = "Guardando…",
  children,
  disabled,
  className = "platform-button",
  ...rest
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isButton = className.split(" ").includes("platform-button");

  return (
    <button
      type="submit"
      className={className}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      {...rest}
    >
      {pending && isButton && (
        <SpinnerIcon variant="classic-solid" className="platform-button__icon platform-button__spinner" />
      )}
      {pending ? pendingLabel : children}
    </button>
  );
}

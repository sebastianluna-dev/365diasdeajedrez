"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";

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
 */
export function SubmitButton({
  pendingLabel = "Guardando…",
  children,
  disabled,
  className = "platform-button",
  ...rest
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={className}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      {...rest}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

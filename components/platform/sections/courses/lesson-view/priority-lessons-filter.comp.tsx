"use client";

import { useRef } from "react";
import { CurrentPathField } from "@/components/platform/shared/current-path-field/current-path-field.comp";
import { PlatformSwitch } from "@/components/platform/shared/platform-switch/platform-switch.comp";

interface PriorityLessonsFilterProps {
  /** `setOnlyPriorityLessons` bound to the course and to the opposite of `enabled`. */
  action: (formData: FormData) => Promise<void>;
  /** Whether the outline shows only the priority lessons now. */
  enabled: boolean;
}

/**
 * The outline's filter: a switch that saves the moment it is pressed. It is
 * still a form, so the server action is what writes the preference and draws
 * the page again; the switch only sends it. Where it comes back to is the
 * lesson being read, which only the browser knows here.
 */
export function PriorityLessonsFilter({ action, enabled }: PriorityLessonsFilterProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action} className="lesson-outline__filter">
      <CurrentPathField name="returnTo" />
      <PlatformSwitch
        label="Sólo lecciones de prioridad"
        defaultChecked={enabled}
        // A setting of the screen one studies on, not a form being filled in:
        // the brand's red, like the rest of the outline.
        tone="accent"
        onCheckedChange={() => formRef.current?.requestSubmit()}
      />
    </form>
  );
}

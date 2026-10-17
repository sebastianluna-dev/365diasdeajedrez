"use client";

import { useOptimistic, useTransition } from "react";
import { PlatformSwitch } from "@/components/platform/shared/platform-switch/platform-switch.comp";
import "./series-publish-switch.comp.css";

export interface SeriesPublishSwitchProps {
  seriesId: string;
  /** As stored: on, every student sees the series on «Series de la academia». */
  published: boolean;
  /** «Publicada el 14 de octubre, 2026»; null while unpublished. */
  publishedLabel: string | null;
  /** How many exercises it holds: an empty series is not offered for publishing. */
  itemCount: number;
  /** `setAcademySeriesPublished`, as a function; a stub in Storybook. */
  action: (seriesId: string, published: boolean) => Promise<void>;
}

/**
 * «Publicada», the switch of an academy series (PLAN.md §8): on, every
 * student sees it on «Series de la academia»; off, it leaves their home and
 * their series page. It takes effect at once (a switch, not a form's field),
 * optimistically, and the page's revalidation confirms it. An empty series
 * cannot be published: there would be nothing to see.
 */
export function SeriesPublishSwitch({
  seriesId,
  published,
  publishedLabel,
  itemCount,
  action,
}: SeriesPublishSwitchProps) {
  const [pending, startTransition] = useTransition();
  const [shown, setShown] = useOptimistic(published);
  const empty = itemCount === 0;
  return (
    <div className="series-publish-switch">
      <PlatformSwitch
        label="Publicada"
        hint={
          empty
            ? "Agrega al menos un ejercicio para publicarla."
            : shown
              ? (publishedLabel ?? "Todos los alumnos la ven en «Series de la academia».")
              : "Apagada: sólo la ve el equipo. Enciéndela para que la vean todos los alumnos."
        }
        checked={shown}
        disabled={pending || (empty && !shown)}
        onCheckedChange={(checked) => {
          startTransition(async () => {
            setShown(checked);
            await action(seriesId, checked);
          });
        }}
      />
    </div>
  );
}

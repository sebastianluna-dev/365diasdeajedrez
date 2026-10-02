"use client";

import { usePathname } from "next/navigation";

interface CurrentPathFieldProps {
  /** The field's name; `returnTo` is what the platform's actions read. */
  name: string;
}

/**
 * The page one is on, as a hidden field: what a form that has to come back
 * where it was sends along.
 *
 * It is a client component for one reason — it is mounted inside a layout, and
 * a layout is not rendered again when one moves within it, so its server
 * render would keep naming the page the form was first drawn on. A client
 * component does re-render on every navigation, which is exactly what this
 * needs to stay truthful.
 */
export function CurrentPathField({ name }: CurrentPathFieldProps) {
  return <input type="hidden" name={name} value={usePathname()} />;
}

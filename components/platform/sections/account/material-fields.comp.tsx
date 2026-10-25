"use client";

import type { ReactNode } from "react";
import { PlatformLookContext } from "@/components/platform/shared/platform-look";

interface MaterialFieldsProps {
  children: ReactNode;
}

/**
 * Hands Material's look to the fields under it, as a popup of a moved page
 * does (`PlatformLookContext`): «Ajustes» is the first moved page with forms
 * outside any popup, and `PlatformFormField` and `PlatformSelect` only know
 * the look from that context. A Client Component of its own because a
 * Server Component cannot render a context; it only places what it is given.
 */
export function MaterialFields({ children }: MaterialFieldsProps) {
  return <PlatformLookContext value="material">{children}</PlatformLookContext>;
}

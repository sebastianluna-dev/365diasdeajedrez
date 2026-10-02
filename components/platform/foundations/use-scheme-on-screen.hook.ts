import { useEffect, useState } from "react";
import type { Theme } from "@/lib/platform-tokens";

const DARK = "(prefers-color-scheme: dark)";

/**
 * Which half of every `light-dark()` is on screen: the one the light / dark
 * toolbar chose, or the machine's when it says "auto" — the same choice the
 * platform makes from `data-theme` (see .storybook/preview.tsx).
 */
export function useSchemeOnScreen(choice: unknown): Theme {
  const [machine, setMachine] = useState<Theme>(() => (window.matchMedia(DARK).matches ? "dark" : "light"));

  useEffect(() => {
    const query = window.matchMedia(DARK);
    const update = () => setMachine(query.matches ? "dark" : "light");
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return choice === "light" || choice === "dark" ? choice : machine;
}

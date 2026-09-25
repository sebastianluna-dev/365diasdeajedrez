import { useEffect, useState } from "react";
import { autosaveGamePgn, type AutosaveResult } from "@/services/studies/studies.actions";

/** Wait after the last change before saving. */
export const AUTOSAVE_DELAY_MS = 1200;

export type SaveState = "idle" | "saving" | "saved" | "error";

interface SaveLabelInput {
  enabled: boolean;
  saveState: SaveState;
  /** Whether the PGN differs from the last one the server confirmed. */
  dirty: boolean;
}

/**
 * What the tools panel says about the autosave, or nothing when there is
 * nothing to say. The error wins over everything else: if the last write
 * failed it has to be said even if something was written again afterwards.
 */
export function saveLabelOf({ enabled, saveState, dirty }: SaveLabelInput): string | undefined {
  if (!enabled || (saveState === "idle" && !dirty)) return undefined;
  if (saveState === "error") return "no se pudo guardar";
  if (saveState === "saving") return "guardando…";
  return dirty ? "sin guardar" : "guardado";
}

interface GameAutosaveOptions {
  studyId: string;
  gameId: string;
  pgn: string;
  /** Off for a game one cannot edit: nothing is ever sent. */
  enabled: boolean;
  /** The server action, replaceable in tests. */
  save?: (studyId: string, gameId: string, pgn: string) => Promise<AutosaveResult>;
}

/**
 * Saves the PGN by itself a moment after the last change, and says how it
 * went. "There are unsaved changes" is DERIVED by comparing the PGN with the
 * last one the server confirmed, instead of being one more state to maintain.
 */
export function useGameAutosave({ studyId, gameId, pgn, enabled, save = autosaveGamePgn }: GameAutosaveOptions) {
  const [lastSaved, setLastSaved] = useState(pgn);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // Wait until work stops and save the LATEST: if something else changes
  // during the wait, the timer restarts and the intermediate version is never sent.
  useEffect(() => {
    if (!enabled || pgn === lastSaved) return;

    const timer = setTimeout(async () => {
      setSaveState("saving");
      try {
        const result = await save(studyId, gameId, pgn);
        if (result.ok) {
          setLastSaved(pgn);
          setSaveState("saved");
        } else {
          setSaveState("error");
        }
      } catch {
        setSaveState("error");
      }
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [pgn, lastSaved, enabled, studyId, gameId, save]);

  // Warns when the tab is closed with something still unsaved. No request can
  // be awaited here, so the only honest thing to do is ask.
  useEffect(() => {
    if (!enabled) return;
    const handler = (event: BeforeUnloadEvent) => {
      if (pgn !== lastSaved) event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [enabled, pgn, lastSaved]);

  return { saveLabel: saveLabelOf({ enabled, saveState, dirty: pgn !== lastSaved }) };
}

import type { EngineOptions, TimedBudget } from "@/lib/chess/engine/engine-client";
import { BOT_HASH_MB } from "./bot-strength";

/**
 * «Jugar esta posición contra el módulo», on the analysis board: the engine at
 * full strength, answering at once (planning decision B). It is never
 * calibrated, never saved and never counts, so it is the ONE search in the
 * project bounded by time: «maximum strength» and «instant» both, which is
 * what the device gives in 300 ms (≈ depth 19 on a computer, 13–14 on a
 * phone). With fixed nodes either the computer would be wasted or the phone
 * would not be instant.
 */
export const FULL_STRENGTH_PROFILE: { engine: EngineOptions; search: TimedBudget; delayMs: [number, number] } = {
  engine: { hash: BOT_HASH_MB, skillLevel: 20, limitStrength: false, multiPv: 1 },
  search: { movetime: 300 },
  delayMs: [0, 0],
};

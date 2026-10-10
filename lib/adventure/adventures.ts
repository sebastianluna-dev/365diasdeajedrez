import type { BotGroupCode } from "@/constants/platform/play-codes.const";
import type {
  AdventureArt,
  AdventureEncounterSeed,
  AdventureSeed,
  ComingAdventureSeed,
} from "@/lib/adventure/adventure.types";
import { CUADERNO_DEL_VIAJERO } from "./adventures/cuaderno-del-viajero";
import { CUADERNO_DEL_VIAJERO_ART } from "./adventures/cuaderno-del-viajero.art";

// Every adventure, in the order the shelf shows them. A new adventure is its
// seed file, its art file and a line here; nothing else in the code names one.

/** The adventures that can be played. */
export const ADVENTURES: readonly AdventureSeed[] = [CUADERNO_DEL_VIAJERO];

/** Where each adventure's live layer sits over its art, by the adventure's slug. */
export const ADVENTURE_ART: Readonly<Record<string, AdventureArt>> = {
  [CUADERNO_DEL_VIAJERO.slug]: CUADERNO_DEL_VIAJERO_ART,
};

/** The notebooks on the shelf that are closed: «Próximamente», with no date. */
export const COMING_ADVENTURES: readonly ComingAdventureSeed[] = [
  { slug: "veracruz", title: "Veracruz", reason: "son jarocho, jarana y el puerto" },
  { slug: "chihuahua", title: "Chihuahua", reason: "las Barrancas del Cobre" },
  { slug: "yucatan", title: "Yucatán", reason: "cenotes, henequén y bordado de hipil" },
  { slug: "cdmx", title: "Ciudad de México", reason: "trajineras y el Ángel" },
  { slug: "puebla", title: "Puebla", reason: "talavera y volcanes" },
  { slug: "tlaxcala", title: "Tlaxcala", reason: "tapetes de flores de Huamantla" },
];

/** An adventure by its slug. */
export function adventureOf(slug: string): AdventureSeed | undefined {
  return ADVENTURES.find((adventure) => adventure.slug === slug);
}

/** The slug of the bot that plays a rival: `<adventure>-<rival>`. */
export function adventureBotSlug(adventureSlug: string, encounterSlug: string): string {
  return `${adventureSlug}-${encounterSlug}`;
}

/** The adventure and the encounter a bot plays, from its group and slug; null for a gallery bot. */
export function adventureEncounterOfBot(
  groupCode: BotGroupCode | string,
  botSlug: string,
): { adventure: AdventureSeed; encounter: AdventureEncounterSeed } | null {
  const adventure = ADVENTURES.find((candidate) => candidate.botGroup === groupCode);
  if (!adventure) return null;
  const encounter = adventure.encounters.find(
    (candidate) => adventureBotSlug(adventure.slug, candidate.slug) === botSlug,
  );
  return encounter ? { adventure, encounter } : null;
}

import { redirect } from "next/navigation";
import { platformRoutes } from "@/lib/platform-routes";

interface PracticePageProps {
  searchParams: Promise<{ tema?: string | string[]; nivel?: string | string[]; tras?: string | string[] }>;
}

/** A query value as it came, or nothing: «Ejercicios» checks it again. */
const one = (raw: string | string[] | undefined) => (typeof raw === "string" ? raw : undefined);

/**
 * «Ejercicios por tema», the old address (D18, D32): since «Ejercicios»
 * moved to the new design system (2026-10-23) the topic is chosen in its
 * side column and the level in its toolbar, so this page sends the same
 * choice there. The menu's tile and any link kept from before keep working.
 */
export default async function PracticePage({ searchParams }: PracticePageProps) {
  const { tema, nivel, tras } = await searchParams;
  redirect(platformRoutes.exerciseTrainer({ tema: one(tema), nivel: one(nivel), tras: one(tras) }));
}

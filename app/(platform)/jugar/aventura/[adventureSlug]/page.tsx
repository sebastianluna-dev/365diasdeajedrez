import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdventureMapSection } from "@/components/adventure/map/adventure-map/adventure-map.section";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { ADVENTURE_ENABLED, PLAY_ENABLED } from "@/constants/platform/features.const";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { adventureOf } from "@/lib/adventure/adventures";
import { getCurrentUser } from "@/lib/platform-auth/current-user";

interface AdventureMapPageProps {
  params: Promise<{ adventureSlug: string }>;
  /** `?victoria=` is the encounter just beaten; `?error=` is what an action of the adventure bounced back with. */
  searchParams: Promise<{ victoria?: string; error?: string }>;
}

export async function generateMetadata({ params }: AdventureMapPageProps): Promise<Metadata> {
  const adventure = adventureOf((await params).adventureSlug);
  return { title: adventure?.title ?? "Modo aventura" };
}

/** `?victoria=` as an encounter's order, 1 to 12; anything else is ignored. */
function victoryOf(value: string | undefined): number | null {
  if (!value || !/^\d{1,2}$/.test(value)) return null;
  const order = Number(value);
  return order >= 1 && order <= 12 ? order : null;
}

/** The map of an adventure: the journey drawn on paper, with the person's place on it. */
export default async function AdventureMapPage({ params, searchParams }: AdventureMapPageProps) {
  // Both switches before anything else: the adventure lives inside «Jugar».
  if (!PLAY_ENABLED || !ADVENTURE_ENABLED) notFound();
  await getCurrentUser();
  const { adventureSlug } = await params;
  if (!adventureOf(adventureSlug)) notFound();
  const { victoria, error } = await searchParams;
  const errorMessage = studentErrorMessage(error);

  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed">
      {errorMessage && <PlatformNotice message={errorMessage} />}
      <AdventureMapSection slug={adventureSlug} victory={victoryOf(victoria)} autoScroll={!errorMessage} />
    </div>
  );
}

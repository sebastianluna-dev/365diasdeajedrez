import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdventureShelfSection } from "@/components/adventure/shelf/adventure-shelf/adventure-shelf.section";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { ADVENTURE_ENABLED, PLAY_ENABLED } from "@/constants/platform/features.const";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";

export const metadata: Metadata = {
  title: "Modo aventura",
};

interface AdventurePageProps {
  /** `?error=` is what an action of the adventure bounced back with. */
  searchParams: Promise<{ error?: string }>;
}

/** The shelf of notebooks: the adventure that can be opened and the ones that are coming. */
export default async function AdventurePage({ searchParams }: AdventurePageProps) {
  // Both switches before anything else: the adventure lives inside «Jugar».
  if (!PLAY_ENABLED || !ADVENTURE_ENABLED) notFound();
  await getCurrentUser();
  const errorMessage = studentErrorMessage((await searchParams).error);

  return (
    <div className="platform-page platform-page_width_wide">
      {errorMessage && <PlatformNotice message={errorMessage} />}
      <AdventureShelfSection />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdventureCoverSection } from "@/components/adventure/cover/adventure-cover/adventure-cover.section";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { PLAY_PAGE_ENABLED } from "@/constants/platform/features.const";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";

export const metadata: Metadata = {
  title: "Jugar",
};

interface PlayPageProps {
  /** `?error=` is what an action bounced back with. */
  searchParams: Promise<{ error?: string }>;
}

/**
 * «Jugar», the way in. Every game against a bot is an encounter of the
 * adventure (2026-10-25), so the page is the adventure's and needs both
 * switches: without the adventure there is nothing to play.
 */
export default async function PlayPage({ searchParams }: PlayPageProps) {
  // The switches before anything else.
  if (!PLAY_PAGE_ENABLED) notFound();
  await getCurrentUser();
  const errorMessage = studentErrorMessage((await searchParams).error);

  return (
    <div className="platform-page platform-page_width_full platform-page_height_screen platform-page_frame_bleed">
      {errorMessage && <PlatformNotice message={errorMessage} />}
      <AdventureCoverSection />
    </div>
  );
}

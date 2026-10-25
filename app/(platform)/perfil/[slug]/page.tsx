import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileOverviewSection } from "@/components/platform/sections/profile/profile-overview.section";
import { PLAY_ENABLED } from "@/constants/platform/features.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getProfileOf } from "@/services/profile/profile.service";

export const metadata: Metadata = {
  title: "Perfil",
};

/**
 * A person's profile, «Visión general», in the new design system
 * (2026-10-25, the owner's «Perfil E2»): visible to the person, their
 * teachers and the staff (`profileVisibleWhere`); anyone else gets a 404, the
 * same as for a user name nobody has. The page takes the window and bleeds
 * onto the canvas; the section draws the workspace.
 */
export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  if (!PLAY_ENABLED) notFound();
  await getCurrentUser();
  const { slug } = await params;
  const profile = await getProfileOf(slug);
  if (!profile) notFound();

  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed">
      <ProfileOverviewSection profile={profile} />
    </div>
  );
}

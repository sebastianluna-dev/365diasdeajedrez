import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileHeaderSection } from "@/components/platform/sections/profile/profile-header.section";
import { ProfileOverviewSection } from "@/components/platform/sections/profile/profile-overview.section";
import { PLAY_ENABLED } from "@/constants/platform/features.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getProfileOf } from "@/services/profile/profile.service";

export const metadata: Metadata = {
  title: "Perfil",
};

/**
 * A person's profile, «Visión general» (N5): visible to the person, their
 * teachers and the staff (`profileVisibleWhere`); anyone else gets a 404, the
 * same as for a user name nobody has.
 */
export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  if (!PLAY_ENABLED) notFound();
  await getCurrentUser();
  const { slug } = await params;
  const profile = await getProfileOf(slug);
  if (!profile) notFound();

  return (
    <div className="platform-page platform-page_width_wide">
      <ProfileHeaderSection profile={profile} active="overview" />
      <ProfileOverviewSection profile={profile} />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileGamesSection } from "@/components/platform/sections/profile/profile-games.section";
import { ProfileHeaderSection } from "@/components/platform/sections/profile/profile-header.section";
import { PLAY_ENABLED } from "@/constants/platform/features.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getProfileOf } from "@/services/profile/profile.service";

export const metadata: Metadata = {
  title: "Partidas",
};

interface ProfileGamesPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ pagina?: string; rival?: string; resultado?: string }>;
}

/** Every game of a person (L4), a page at a time and filtered by rival and result. */
export default async function ProfileGamesPage({ params, searchParams }: ProfileGamesPageProps) {
  if (!PLAY_ENABLED) notFound();
  await getCurrentUser();
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const profile = await getProfileOf(slug);
  if (!profile) notFound();

  return (
    <div className="platform-page platform-page_width_wide">
      <ProfileHeaderSection profile={profile} active="games" />
      <ProfileGamesSection profile={profile} query={query} />
    </div>
  );
}

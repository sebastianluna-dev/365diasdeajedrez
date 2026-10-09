import { notFound, redirect } from "next/navigation";
import { PLAY_ENABLED } from "@/constants/platform/features.const";
import { platformRoutes } from "@/lib/platform-routes";
import { getOwnSlug } from "@/services/profile/profile.service";

/** «Mi perfil»: the person's own profile, at its address by user name. */
export default async function OwnProfilePage() {
  if (!PLAY_ENABLED) notFound();
  redirect(platformRoutes.userProfile(await getOwnSlug()));
}

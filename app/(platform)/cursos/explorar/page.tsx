import { permanentRedirect } from "next/navigation";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { platformRoutes } from "@/lib/platform-routes";

interface OldCatalogPageProps {
  searchParams: Promise<{ nivel?: string }>;
}

/**
 * Where the catalog lived until 2026-10-22 («Explorar cursos»): it answers
 * 308 to `/cursos/catalogo`, keeping the level, so an old link or bookmark
 * still lands on it.
 */
export default async function OldCatalogPage({ searchParams }: OldCatalogPageProps) {
  // Border of the private area, as on every page of the platform.
  await getCurrentUser();
  const { nivel } = await searchParams;
  permanentRedirect(nivel ? platformRoutes.coursesOfLevel(nivel) : platformRoutes.courseCatalog);
}

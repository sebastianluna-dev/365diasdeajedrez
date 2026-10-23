import type { Metadata } from "next";
import { studySortOf, studyViewOf } from "@/components/platform/sections/studies/studies-list/studies-nav.const";
import { StudiesListSection } from "@/components/platform/sections/studies/studies-list/studies-list.section";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getStudyKinds, getUserStudies } from "@/services/studies/studies.service";

export const metadata: Metadata = {
  title: "Mis estudios",
};

interface StudiesPageProps {
  /**
   * `error`: what `createStudy` bounced back with. `tipo` and `orden`: the
   * view and the order of the side column. `q`: a search sent from a
   * study's bar, which the library opens with.
   */
  searchParams: Promise<{ error?: string; tipo?: string; orden?: string; q?: string }>;
}

export default async function StudiesPage({ searchParams }: StudiesPageProps) {
  // Border of the private area, and it has to be the FIRST await: even though
  // `getStudyKinds` now checks whether the caller is a teacher — to offer them
  // "Colección" — resolving a role is not checking a session.
  await getCurrentUser();
  // The kinds for «Nuevo estudio» and the studies do not depend on each
  // other: read together, the page waits for the slower one, not for both.
  const [kinds, studies, { error, tipo, orden, q }] = await Promise.all([
    getStudyKinds(),
    getUserStudies(),
    searchParams,
  ]);

  // The new design system (2026-10-23): the page takes the window and bleeds
  // onto the canvas; the section draws the workspace.
  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed">
      <StudiesListSection
        studies={studies}
        kinds={kinds}
        view={studyViewOf(tipo)}
        sort={studySortOf(orden)}
        query={q}
        errorMessage={studentErrorMessage(error) ?? undefined}
      />
    </div>
  );
}

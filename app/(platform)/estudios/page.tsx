import type { Metadata } from "next";
import { StudiesListSection } from "@/components/platform/sections/studies/studies-list/studies-list.section";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getStudyKinds, getUserStudies } from "@/services/studies/studies.service";
import "./studies-page.css";

export const metadata: Metadata = {
  title: "Mis estudios",
};

interface StudiesPageProps {
  /** What `createStudy` bounced back with. */
  searchParams: Promise<{ error?: string }>;
}

export default async function StudiesPage({ searchParams }: StudiesPageProps) {
  // Border of the private area, and it has to be the FIRST await: even though
  // `getStudyKinds` now checks whether the caller is a teacher — to offer them
  // "Colección" — resolving a role is not checking a session.
  await getCurrentUser();
  // The kinds for the grid's «Nuevo estudio» and the studies do not depend on
  // each other: read together, the page waits for the slower one, not for both.
  const [kinds, studies, { error }] = await Promise.all([getStudyKinds(), getUserStudies(), searchParams]);
  const errorMessage = studentErrorMessage(error);

  return (
    <div className="platform-page platform-page_width_wide studies-page">
      {/* No «Nuevo estudio» here: the library's grid opens with the slot that
          creates one (2026-10-07, the owner's call: two ways to the same popup
          on one screen were one too many). */}
      <header className="platform-page__head">
        <h1 className="platform-page__title">Mis estudios</h1>
        <p className="platform-page__subtitle">
          Tus partidas, tus torneos, tus estudios y las colecciones que te han compartido.
        </p>
      </header>

      {errorMessage && <PlatformNotice message={errorMessage} />}

      <StudiesListSection studies={studies} kinds={kinds} />
    </div>
  );
}

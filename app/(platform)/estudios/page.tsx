import type { Metadata } from "next";
import { NewStudy } from "@/components/platform/sections/studies/studies-list/new-study/new-study.comp";
import { StudiesListSection } from "@/components/platform/sections/studies/studies-list/studies-list.section";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getStudyKinds } from "@/services/studies/studies.service";
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
  const [kinds, { error }] = await Promise.all([getStudyKinds(), searchParams]);
  const errorMessage = studentErrorMessage(error);

  return (
    <div className="platform-page studies-page">
      <header className="studies-page__head">
        <div className="platform-page__head">
          <h1 className="platform-page__title">Mis estudios</h1>
          <p className="platform-page__subtitle">
            Tus partidas, tus torneos, tus estudios y las colecciones que te han compartido.
          </p>
        </div>

        <NewStudy kinds={kinds} />
      </header>

      {errorMessage && <PlatformNotice message={errorMessage} />}

      <StudiesListSection />
    </div>
  );
}

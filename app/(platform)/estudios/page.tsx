import type { Metadata } from "next";
import { NewStudy } from "@/components/sections/platform/studies/studies-list/new-study.comp";
import { StudiesListSection } from "@/components/sections/platform/studies/studies-list/studies-list.section";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getStudyKinds } from "@/services/studies/studies.service";
import "./studies-page.css";

export const metadata: Metadata = {
  title: "Mis estudios",
};

export default async function StudiesPage() {
  // Border of the private area, and it has to be the FIRST await: even though
  // `getStudyKinds` now checks whether the caller is a teacher — to offer them
  // "Colección" — resolving a role is not checking a session.
  await getCurrentUser();
  const kinds = await getStudyKinds();

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

      <StudiesListSection />
    </div>
  );
}

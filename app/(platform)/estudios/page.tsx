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
  // Frontera de la zona privada, y tiene que ser el PRIMER await:
  // `getStudyKinds` sólo lee el catálogo y no pasa por el DAL, así que no
  // sirve de comprobación de sesión.
  await getCurrentUser();
  const kinds = await getStudyKinds();

  return (
    <div className="platform-page studies-page">
      <header className="studies-page__head">
        <div className="platform-page__head">
          <h1 className="platform-page__title">Mis estudios</h1>
          <p className="platform-page__subtitle">
            Tu biblioteca personal: partidas, análisis, repertorios y colecciones.
          </p>
        </div>

        <NewStudy kinds={kinds} />
      </header>

      <StudiesListSection />
    </div>
  );
}

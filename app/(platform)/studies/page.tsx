import type { Metadata } from "next";
import { StudiesListSection } from "@/components/sections/platform/studies/studies-list/studies-list.section";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import "./studies-page.css";

export const metadata: Metadata = {
  title: "Mis estudios",
};

export default async function StudiesPage() {
  // Frontera de la zona privada: sin sesión válida, redirige al login.
  await getCurrentUser();

  return (
    <div className="platform-page studies-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Mis estudios</h1>
        <p className="platform-page__subtitle">Tu biblioteca personal: partidas, análisis, repertorios y colecciones.</p>
      </header>

      <StudiesListSection />
    </div>
  );
}

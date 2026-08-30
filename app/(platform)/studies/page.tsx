import type { Metadata } from "next";
import { StudiesListSection } from "@/components/sections/platform/studies/studies-list/studies-list.section";
import "./studies-page.css";

export const metadata: Metadata = {
  title: "Mis estudios",
};

export default function StudiesPage() {
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

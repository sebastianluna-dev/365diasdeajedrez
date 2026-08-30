import type { Metadata } from "next";
import { ClassesListSection } from "@/components/sections/platform/classes/classes-list/classes-list.section";
import "./classes-page.css";

export const metadata: Metadata = {
  title: "Mis clases",
};

export default function ClassesPage() {
  return (
    <div className="platform-page classes-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Mis clases</h1>
        <p className="platform-page__subtitle">Tus próximas clases en vivo y el historial de las pasadas.</p>
      </header>

      <ClassesListSection />
    </div>
  );
}

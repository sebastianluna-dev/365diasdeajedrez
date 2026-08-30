import type { Metadata } from "next";
import { CoursesListSection } from "@/components/sections/platform/courses/courses-list/courses-list.section";
import "./courses-page.css";

export const metadata: Metadata = {
  title: "Mis cursos",
};

export default function CoursesPage() {
  return (
    <div className="platform-page courses-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Mis cursos</h1>
        <p className="platform-page__subtitle">Tu camino de estudio, curso a curso.</p>
      </header>

      <CoursesListSection />
    </div>
  );
}

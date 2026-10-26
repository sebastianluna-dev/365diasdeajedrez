import type { Metadata } from "next";
import { TeachersAcademySection } from "@/components/site/sections/teachers/academy/teachers-academy.section";
import { TeachersCalendarSection } from "@/components/site/sections/teachers/calendar/teachers-calendar.section";
import { TeachersClassroomSection } from "@/components/site/sections/teachers/classroom/teachers-classroom.section";
import { TeachersClosingSection } from "@/components/site/sections/teachers/closing/teachers-closing.section";
import { TeachersComparisonSection } from "@/components/site/sections/teachers/comparison/teachers-comparison.section";
import { TeachersFaqSection } from "@/components/site/sections/teachers/faq/teachers-faq.section";
import { TeachersHeroSection } from "@/components/site/sections/teachers/hero/teachers-hero.section";
import { TeachersProblemSection } from "@/components/site/sections/teachers/problem/teachers-problem.section";
import { TeachersSchoolsSection } from "@/components/site/sections/teachers/schools/teachers-schools.section";
import { TeachersSeatsSection } from "@/components/site/sections/teachers/seats/teachers-seats.section";
import { TeachersStudentViewSection } from "@/components/site/sections/teachers/student-view/teachers-student-view.section";
import { TeachersTrustSection } from "@/components/site/sections/teachers/trust/teachers-trust.section";
import { getSiteSettingsData } from "@/services/site-settings/site-settings.service";
import "./teachers-page.css";

const TITLE = "Plataforma Ajedrez 365 | La plataforma para dar clases de ajedrez";
const DESCRIPTION =
  "Para profesores, clubes y escuelas: tus clases, tus alumnos y sus ejercicios en un solo lugar. Hecha y usada a diario por la academia 365 días de ajedrez.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/para-profesores" },
  openGraph: {
    siteName: "Plataforma Ajedrez 365",
    title: "Plataforma Ajedrez 365",
    description: DESCRIPTION,
    type: "website",
    locale: "es_MX",
    url: "/para-profesores",
  },
};

// Static like the home page: prerendered and served from the CDN. The only
// CMS value it reads is the WhatsApp number (`site-settings`), whose hook
// revalidates every page of the site; the hour is the safety net.
export const revalidate = 3600;

/** The teachers' landing, «Plataforma Ajedrez 365» (the owner's design, 2026-10-26). */
export default async function TeachersPage() {
  const { whatsappNumber } = await getSiteSettingsData();

  return (
    <div className="teachers-page">
      <main id="contenido">
        <TeachersHeroSection />
        <TeachersProblemSection />
        <TeachersCalendarSection />
        <TeachersStudentViewSection />
        <TeachersClassroomSection />
        <TeachersSeatsSection whatsappNumber={whatsappNumber} />
        <TeachersSchoolsSection />
        <TeachersTrustSection />
        <TeachersComparisonSection />
        <TeachersAcademySection />
        <TeachersFaqSection whatsappNumber={whatsappNumber} />
        <TeachersClosingSection whatsappNumber={whatsappNumber} />
      </main>
    </div>
  );
}

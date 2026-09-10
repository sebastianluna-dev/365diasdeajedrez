import type { Metadata } from "next";
import { TeacherProfileSection } from "@/components/sections/platform/teacher/profile/teacher-profile.section";
import { getTeacherProfile } from "@/services/teacher/teacher.service";

export const metadata: Metadata = {
  title: "Mi perfil",
};

interface TeacherProfilePageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function TeacherProfilePage({ searchParams }: TeacherProfilePageProps) {
  // getTeacherProfile opens with requireTeacher(): it is the panel's border.
  const [profile, { error }] = await Promise.all([getTeacherProfile(), searchParams]);

  return (
    <div className="platform-page teacher-profile-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Mi perfil</h1>
        <p className="platform-page__subtitle">Cómo te ven tus alumnos.</p>
      </header>

      <TeacherProfileSection profile={profile} errorCode={error} />
    </div>
  );
}

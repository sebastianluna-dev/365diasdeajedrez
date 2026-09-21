import type { Metadata } from "next";
import { TeacherProfileSection } from "@/components/platform/sections/teacher/profile/teacher-profile.section";
import { getTeacherProfile } from "@/services/teacher/teacher.service";
import { requireTeacher } from "@/lib/platform-auth/roles";

// The title is resolved with the role, like the page itself: without it the
// response carries not even the panel's name (IMPROVEMENTS #26).
export async function generateMetadata(): Promise<Metadata> {
  await requireTeacher();
  return { title: "Mi perfil" };
}

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

import { getUserDashboard } from "@/services/dashboard/dashboard.service";
import "./profile-summary.section.css";

export async function ProfileSummarySection() {
  const { profile } = await getUserDashboard();

  return (
    <header className="profile-summary">
      <div>
        <h1 className="platform-page__title">Hola, {profile.displayName}</h1>
        <p className="platform-page__subtitle">¿Qué vamos a estudiar hoy?</p>
      </div>
      <div className="profile-summary__meta">
        <span className="profile-summary__email">{profile.email}</span>
        <span className="profile-summary__since">En la academia desde el {profile.memberSinceLabel}</span>
      </div>
    </header>
  );
}

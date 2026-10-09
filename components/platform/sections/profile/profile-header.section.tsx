import Link from "next/link";
import { PlayerAvatar } from "@/components/chess/player-avatar/player-avatar.comp";
import { PenIcon } from "@/components/icons/pen-icon.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import { federationFlag } from "@/lib/chess/federations";
import { platformRoutes } from "@/lib/platform-routes";
import type { ProfileHead } from "@/services/profile/profile.types";
import "./profile-header.section.css";

interface ProfileHeaderSectionProps {
  profile: ProfileHead;
  /** Which of the two pages is open: its tab carries `aria-current`. */
  active: "overview" | "games";
}

/** «3 cursos», «1 estudio». */
const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * A profile's head (N5): the square portrait with the flag, the name with its
 * flag and badge, the status line, «Se unió el…» with the figures in one
 * line, and — only for the person themselves — «Editar perfil» and «Jugar».
 * Under it the tabs: «Visión general» and «Partidas» are pages; «Estudios»,
 * «Cursos» and «Actividad» are links to the pages that already exist, drawn
 * only for the owner (planning decision §K).
 */
export function ProfileHeaderSection({ profile, active }: ProfileHeaderSectionProps) {
  const flag = federationFlag(profile.country);
  const tabs = [
    { key: "overview", label: "Visión general", href: platformRoutes.userProfile(profile.slug) },
    { key: "games", label: "Partidas", href: platformRoutes.userProfileGames(profile.slug) },
    ...(profile.isOwn
      ? [
          { key: "studies", label: "Estudios", href: platformRoutes.studies },
          { key: "courses", label: "Cursos", href: platformRoutes.courses },
          { key: "activity", label: "Actividad", href: platformRoutes.dashboard },
        ]
      : []),
  ];

  return (
    <header className="profile-header">
      <div className="profile-header__top">
        <PlayerAvatar {...profile.avatar} size="xl" />
        <div className="profile-header__who">
          <div className="profile-header__name-row">
            <h1 className="profile-header__name">{profile.displayName}</h1>
            {flag && (
              <span className="profile-header__flag" role="img" aria-label={profile.country ?? undefined}>
                {flag}
              </span>
            )}
            <span className="profile-header__badge">{profile.badge}</span>
          </div>
          {profile.statusLine ? (
            <p className="profile-header__status">{profile.statusLine}</p>
          ) : (
            profile.isOwn && (
              <Link
                href={platformRoutes.settings}
                className="profile-header__status profile-header__status_state_empty"
              >
                Escribe una línea de estado
              </Link>
            )
          )}
          <p className="profile-header__facts">
            <span>
              Se unió el <strong>{profile.joinedLabel}</strong>
            </span>
            <span>{count(profile.counts.courses, "curso", "cursos")}</span>
            <span>{count(profile.counts.studies, "estudio", "estudios")}</span>
            <span>{count(profile.counts.games, "partida", "partidas")}</span>
            {profile.botLevel.level !== null && <span>Nivel contra bots ≈ {profile.botLevel.level}</span>}
          </p>
        </div>
        {profile.isOwn && (
          <div className="profile-header__actions">
            <Link href={platformRoutes.settings} className="platform-button">
              <PenIcon variant="classic-solid" className="platform-button__icon" />
              Editar perfil
            </Link>
            <Link href={platformRoutes.play} className="platform-button platform-button_variant_accent">
              <PlayIcon variant="classic-solid" className="platform-button__icon" />
              Jugar
            </Link>
          </div>
        )}
      </div>

      <nav className="profile-header__tabs" aria-label="Perfil">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`profile-header__tab${tab.key === active ? " profile-header__tab_state_active" : ""}`}
            aria-current={tab.key === active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

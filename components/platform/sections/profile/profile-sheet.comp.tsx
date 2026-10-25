import Link from "next/link";
import { PlayerAvatar } from "@/components/chess/player-avatar/player-avatar.comp";
import { ChartSimpleIcon } from "@/components/icons/chart-simple-icon.comp";
import { PenIcon } from "@/components/icons/pen-icon.comp";
import { PlatformBigNumber } from "@/components/platform/shared/platform-big-number/platform-big-number.comp";
import { mdButton, mdIconButton } from "@/lib/material/material-classes";
import { platformRoutes } from "@/lib/platform-routes";
import type { ProfileView } from "@/services/profile/profile.types";
import type { PlayWords } from "./profile-words";
import "./profile-sheet.comp.css";

interface ProfileSheetProps {
  profile: ProfileView;
  /** «Hoy ya estudiaste · la mejor, 19». */
  streakNote: string;
  /** The play chapter's figures: the level's note and the share of games won. */
  play: Pick<PlayWords, "levelNote" | "winShare" | "finished" | "points">;
}

/**
 * The profile's sheet (2026-10-25, «Perfil E2»): who — the portrait with its
 * flag in a corner, the name, the badge, the status line and «Se unió el…» —, three
 * tiles with the counts, and three big thin figures: the streak, the level
 * against bots with its sparkline, and the share of games won. Stuck at the
 * top while the story scrolls; a block on top of it under 1024px. On one's
 * own profile, a pen to «Editar perfil» and the counts lead to their pages;
 * on somebody else's only the games do, since the rest are pages of one's
 * own.
 */
export function ProfileSheet({ profile, streakNote, play }: ProfileSheetProps) {
  const { record } = profile;
  const counts = [
    { key: "courses", n: profile.counts.courses, one: "curso", many: "cursos", href: platformRoutes.courses },
    { key: "studies", n: profile.counts.studies, one: "estudio", many: "estudios", href: platformRoutes.studies },
    {
      key: "games",
      n: profile.counts.games,
      one: "partida",
      many: "partidas",
      href: platformRoutes.userProfileGames(profile.slug),
    },
  ];

  return (
    <aside className="profile-sheet" aria-label={profile.isOwn ? "Tu ficha" : `Ficha de ${profile.displayName}`}>
      <div className="profile-sheet__who">
        <span className="profile-sheet__portrait">
          <PlayerAvatar {...profile.avatar} size="xl" />
        </span>
        <div className="profile-sheet__identity">
          <h1 className="profile-sheet__name">{profile.displayName}</h1>
          <span className="profile-sheet__badge">{profile.badge}</span>
        </div>
        {profile.isOwn && (
          <Link
            href={platformRoutes.settings}
            className={`${mdIconButton("standard", "sm")} profile-sheet__edit`}
            aria-label="Editar perfil"
          >
            <PenIcon variant="classic-solid" className="platform-md-icon" />
          </Link>
        )}
      </div>

      <div className="profile-sheet__about">
        {profile.statusLine ? (
          <p className="profile-sheet__status">{profile.statusLine}</p>
        ) : (
          profile.isOwn && (
            <Link href={platformRoutes.settings} className="profile-sheet__status profile-sheet__status_state_empty">
              Escribe una línea de estado
            </Link>
          )
        )}
        <p className="profile-sheet__joined">Se unió el {profile.joinedLabel}</p>
      </div>

      <ul className="profile-sheet__counts">
        {counts.map((count) => {
          const inner = (
            <>
              <span className="profile-sheet__count-figure">{count.n}</span>
              {count.n === 1 ? count.one : count.many}
            </>
          );
          return (
            <li key={count.key}>
              {profile.isOwn || count.key === "games" ? (
                <Link href={count.href} className="profile-sheet__count profile-sheet__count_kind_link">
                  {inner}
                </Link>
              ) : (
                <span className="profile-sheet__count">{inner}</span>
              )}
            </li>
          );
        })}
      </ul>

      <div className="profile-sheet__figures">
        <PlatformBigNumber
          label="Racha de estudio"
          value={profile.streak.streak.days}
          unit={profile.streak.streak.days === 1 ? "día" : "días"}
          note={streakNote}
        />
        <PlatformBigNumber
          label="Nivel contra bots"
          value={profile.botLevel.level}
          prefix="≈"
          note={play.levelNote}
          trend={
            profile.botLevel.level !== null && play.points.length >= 2
              ? {
                  values: play.points.map((point) => point.value),
                  label: `Nivel contra bots en ${profile.isOwn ? "tus" : "sus"} últimas ${play.points.length} partidas: de ≈ ${play.points[0]?.value} el ${play.points[0]?.label} a ≈ ${play.points.at(-1)?.value} el ${play.points.at(-1)?.label}`,
                }
              : undefined
          }
        />
        <PlatformBigNumber
          label="Partidas ganadas"
          value={play.winShare}
          fractionDigits={play.winShare !== null && !Number.isInteger(play.winShare) ? 1 : 0}
          unit="%"
          note={
            play.finished === 0
              ? "Todavía sin partidas terminadas"
              : `${record.wins} de ${play.finished} terminadas${record.open > 0 ? ` · ${record.open} en curso` : ""}`
          }
        />
      </div>

      {profile.isOwn && (
        <Link
          href={platformRoutes.profileStatistics()}
          className={`${mdButton("tonal", "sm")} profile-sheet__statistics`}
        >
          <ChartSimpleIcon variant="classic-solid" className="platform-md-icon" />
          Ver estadísticas
        </Link>
      )}
    </aside>
  );
}

import Link from "next/link";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import { ArrowUpRightIcon } from "@/components/icons/arrow-up-right-icon.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { RobotIcon } from "@/components/icons/robot-icon.comp";
import { PlatformBandChart } from "@/components/platform/shared/platform-band-chart/platform-band-chart.comp";
import { PlatformBigNumber } from "@/components/platform/shared/platform-big-number/platform-big-number.comp";
import { PlatformCompareBars } from "@/components/platform/shared/platform-compare-bars/platform-compare-bars.comp";
import { PlatformLineChart } from "@/components/platform/shared/platform-line-chart/platform-line-chart.comp";
import {
  PlatformSideNav,
  type PlatformSideNavGroup,
} from "@/components/platform/shared/platform-side-nav/platform-side-nav.comp";
import { PlatformStreakCalendar } from "@/components/platform/shared/platform-streak-calendar/platform-streak-calendar.comp";
import { PlatformStreakLegend } from "@/components/platform/shared/platform-streak-legend/platform-streak-legend.comp";
import { movesText, resultOf } from "@/components/platform/shared/played-game-card/played-game-card.comp";
import { PLAY_PAGE_ENABLED } from "@/constants/platform/features.const";
import { formatRelativeSpanish } from "@/lib/format-relative-spanish";
import { mdButton, mdIconButton } from "@/lib/material/material-classes";
import { platformRoutes } from "@/lib/platform-routes";
import { BOT_LEVEL_MIN_GAMES, BOT_LEVEL_WINDOW } from "@/services/play/play-rules";
import type { PlayedGameCard } from "@/services/play/play.types";
import type { ProfileView } from "@/services/profile/profile.types";
import { ProfileSheet } from "./profile-sheet.comp";
import { playWords, plural, streakWords, studyWords } from "./profile-words";
import "./profile-overview.section.css";

/** How many of the last games the story lists. */
const LISTED_GAMES = 5;

/** The ticks of a month's axis: its first day with the month, then every week. */
const MONTH_TICKS = [1, 8, 15, 22, 29];

const RESULTS = {
  win: { text: "G", label: "Ganada" },
  loss: { text: "P", label: "Perdida" },
  draw: { text: "T", label: "Tablas" },
  open: { text: "En curso", label: "En curso" },
  aborted: { text: "Anulada", label: "Anulada" },
} as const;

interface ProfileOverviewSectionProps {
  profile: ProfileView;
  /** For the stories: what «hace 2 h» counts from. */
  now?: Date;
}

/**
 * «Visión general» of a profile in the new design system (2026-10-25, the
 * owner's «Perfil E2 · Ficha fija y el perfil como historia: estudio,
 * racha, juego»). The side column holds «Jugar» and the profile's views,
 * with «Lo tuyo» under them; the panel, the sheet at the left — stuck while
 * the page scrolls — and the profile as a story at the right, four chapters
 * each with its eyebrow, a sentence that reads its chart, a lead and the
 * line that says what the chart counts: the minutes of this month against
 * the last, the streak, the level against bots with the record against each
 * bot, and the last games. Games never count as study, and the chapters
 * say so.
 *
 * On somebody else's profile (their teacher's view, the staff's) the
 * sentences are in the third person and «Jugar», «Lo tuyo», «Editar
 * perfil» and the links to one's own pages are not drawn.
 */
export function ProfileOverviewSection({ profile, now = new Date() }: ProfileOverviewSectionProps) {
  const voice = { isOwn: profile.isOwn };
  const study = studyWords(profile.studyMonths, voice);
  const streak = streakWords(profile.streak, voice);
  const play = playWords(profile.botLevel, profile.record, profile.botRecords, voice, {
    window: BOT_LEVEL_WINDOW,
    minimum: BOT_LEVEL_MIN_GAMES,
  });
  const firstName = profile.displayName.split(" ")[0] ?? profile.displayName;
  const thisWeek = profile.streak.weeks.at(-1) ?? [];
  const daysThisWeek = thisWeek.filter((day) => !day.isFuture && day.count > 0).length;
  const games = profile.recentGames.slice(0, LISTED_GAMES);
  const month = profile.studyMonths.current.name.slice(0, 3);

  const groups: PlatformSideNavGroup[] = [
    {
      title: profile.isOwn ? "Perfil" : `Perfil de ${firstName}`,
      links: [
        { label: "Visión general", href: platformRoutes.userProfile(profile.slug), icon: "user", current: true },
        ...(profile.isOwn
          ? [{ label: "Estadísticas", href: platformRoutes.profileStatistics(), icon: "chart-simple" as const }]
          : []),
        {
          label: "Partidas",
          href: platformRoutes.userProfileGames(profile.slug),
          icon: "chess-board",
          count: profile.counts.games,
        },
      ],
    },
    ...(profile.isOwn
      ? [
          {
            title: "Lo tuyo",
            links: [
              { label: "Estudios", href: platformRoutes.studies, icon: "books", count: profile.counts.studies },
              {
                label: "Cursos",
                href: platformRoutes.courses,
                icon: "graduation-cap",
                count: profile.counts.courses,
              },
              { label: "Actividad", href: platformRoutes.dashboard, icon: "calendar" },
            ] satisfies PlatformSideNavGroup["links"],
          },
        ]
      : []),
  ];

  return (
    <div className="platform-workspace profile-overview">
      <div className="platform-workspace__side">
        <PlatformSideNav
          label={profile.isOwn ? "Tu perfil" : `Perfil de ${profile.displayName}`}
          action={
            profile.isOwn && PLAY_PAGE_ENABLED ? { label: "Jugar", href: platformRoutes.play, icon: "play" } : undefined
          }
          groups={groups}
        />
      </div>

      <div className="platform-workspace__panel profile-overview__panel">
        <div className="profile-overview__layout">
          <ProfileSheet profile={profile} streakNote={streak.sheetNote} play={play} />

          <div className="profile-overview__story">
            <section className="profile-overview__chapter" aria-labelledby="profile-overview-study">
              <ChapterHead
                id="profile-overview-study"
                eyebrow={study.eyebrow}
                heading={study.heading}
                lead={study.lead}
                link={profile.isOwn ? { href: platformRoutes.dashboard, label: "Ver tu actividad" } : undefined}
              />
              <div className="profile-overview__card profile-overview__card_tone_blue profile-overview__card_layout_row">
                <div className="profile-overview__aside">
                  <PlatformBigNumber label={study.range} value={study.total} unit="min" size="md" note={study.note} />
                  <ul className="profile-overview__legend" aria-hidden="true">
                    <li className="profile-overview__legend-item">
                      <span className="profile-overview__swatch" />
                      {profile.studyMonths.current.name}
                    </li>
                    <li className="profile-overview__legend-item">
                      <span className="profile-overview__swatch profile-overview__swatch_kind_previous" />
                      {profile.studyMonths.previous.name}
                    </li>
                  </ul>
                </div>
                <div className="profile-overview__chart">
                  <PlatformBandChart
                    current={study.current}
                    previous={study.previous}
                    length={Math.max(profile.studyMonths.current.length, profile.studyMonths.previous.length)}
                    ticks={MONTH_TICKS.map((at) => ({ at, label: at === 1 ? `1 ${month}` : String(at) }))}
                    tag={study.tag}
                    label={study.chartLabel}
                  />
                </div>
              </div>
              <p className="profile-overview__reads">{study.reads}</p>
            </section>

            <section className="profile-overview__chapter" aria-labelledby="profile-overview-streak">
              <ChapterHead
                id="profile-overview-streak"
                eyebrow="Estudio · racha"
                heading={streak.heading}
                lead={streak.lead}
                link={profile.isOwn ? { href: platformRoutes.dashboard, label: "Ver tu actividad" } : undefined}
              />
              <div className="profile-overview__card profile-overview__card_layout_row">
                <PlatformStreakCalendar
                  weeks={profile.streak.weeks}
                  streak={profile.streak.streak}
                  tag={streak.tag}
                  label={streak.chartLabel}
                />
                <div className="profile-overview__aside profile-overview__aside_kind_week">
                  <PlatformBigNumber
                    label="Esta semana"
                    value={daysThisWeek}
                    unit={`de ${plural(streak.weekDays, "día", "días")}`}
                    size="md"
                    note={`${profile.streak.minutesThisWeek} min de lecciones`}
                  />
                  <PlatformStreakLegend />
                </div>
              </div>
              <p className="profile-overview__reads">
                Cada punto es un día con lecciones, ejercicios o clases; jugar no suma a la racha.
              </p>
            </section>

            <section className="profile-overview__chapter" aria-labelledby="profile-overview-play">
              <ChapterHead id="profile-overview-play" eyebrow="Jugando" heading={play.heading} lead={play.lead} />
              {play.points.length >= 2 && (
                <>
                  <div className="profile-overview__card">
                    <PlatformLineChart
                      points={play.points}
                      valuePrefix="≈ "
                      sliderLabel="Partida elegida"
                      label={play.lineLabel}
                    />
                  </div>
                  <p className="profile-overview__reads">
                    Sale de {profile.isOwn ? "tus" : "sus"} últimas {BOT_LEVEL_WINDOW} partidas terminadas contra los
                    bots; es aproximado, no un rating.
                  </p>
                </>
              )}
              {profile.botRecords.length > 0 && (
                <>
                  <div className="profile-overview__card">
                    <div className="profile-overview__card-head">
                      <span className="profile-overview__disc" aria-hidden="true">
                        <RobotIcon className="profile-overview__disc-icon" />
                      </span>
                      <div className="profile-overview__card-title">
                        <h3 className="profile-overview__card-heading">Contra cada bot</h3>
                        <p className="profile-overview__card-sub">Partidas · ganadas–perdidas–tablas</p>
                      </div>
                      {profile.isOwn && PLAY_PAGE_ENABLED && (
                        <Link
                          href={platformRoutes.play}
                          className={`${mdIconButton("standard", "sm")} profile-overview__go`}
                          aria-label="Ir a Jugar"
                        >
                          <ArrowUpRightIcon variant="classic-solid" className="platform-md-icon" />
                        </Link>
                      )}
                    </div>
                    <PlatformCompareBars
                      bars={profile.botRecords.map((bot) => ({
                        key: String(bot.botId),
                        name: bot.name,
                        caption: String(bot.elo),
                        value: bot.wins + bot.losses + bot.draws + bot.open,
                        detail: `${bot.wins}–${bot.losses}–${bot.draws}`,
                        highlighted: bot.open > 0,
                      }))}
                      label={play.barsLabel}
                    />
                  </div>
                  <p className="profile-overview__reads">{play.barsReads}</p>
                </>
              )}
            </section>

            <section className="profile-overview__chapter" aria-labelledby="profile-overview-games">
              <div className="profile-overview__head">
                <div className="profile-overview__head-text">
                  <span className="profile-overview__eyebrow">Jugando · lo último</span>
                  <h2 id="profile-overview-games" className="profile-overview__heading">
                    {profile.isOwn ? "Tus últimas partidas" : "Sus últimas partidas"}
                  </h2>
                </div>
                {profile.counts.games > games.length && (
                  <Link href={platformRoutes.userProfileGames(profile.slug)} className={mdButton("text", "sm")}>
                    Ver las {profile.counts.games}
                    <ChevronRightIcon variant="classic-solid" className="platform-md-icon" />
                  </Link>
                )}
              </div>
              {games.length === 0 ? (
                <p className="profile-overview__lead">
                  {profile.isOwn
                    ? "Todavía no hay partidas: las que juegues contra los bots aparecen aquí."
                    : "Todavía no hay partidas."}
                </p>
              ) : (
                <ul className="profile-overview__games" aria-labelledby="profile-overview-games">
                  {games.map((game) => (
                    <li key={game.id}>
                      <GameRow game={game} now={now} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ChapterHeadProps {
  id: string;
  eyebrow: string;
  heading: string;
  lead: string;
  /** A round link at the right, to the page the chapter comes from. */
  link?: { href: string; label: string };
}

/** A chapter's eyebrow, its sentence and its lead, with the link to where it comes from. */
function ChapterHead({ id, eyebrow, heading, lead, link }: ChapterHeadProps) {
  return (
    <div className="profile-overview__head">
      <div className="profile-overview__head-text">
        <span className="profile-overview__eyebrow">{eyebrow}</span>
        <h2 id={id} className="profile-overview__heading">
          {heading}
        </h2>
        <p className="profile-overview__lead">{lead}</p>
      </div>
      {link && (
        <Link
          href={link.href}
          className={`${mdIconButton("tonal", "sm")} profile-overview__go`}
          aria-label={link.label}
        >
          <ArrowUpRightIcon variant="classic-solid" className="platform-md-icon" />
        </Link>
      )}
    </div>
  );
}

/** A game of the list: its final position, the result, the rival and its facts; the whole row opens it. */
function GameRow({ game, now }: { game: PlayedGameCard; now: Date }) {
  const result = resultOf(game);
  const facts = [
    game.rival.elo !== null ? String(game.rival.elo) : null,
    game.isOpen ? "En curso" : game.terminationLabel,
    movesText(game.moves),
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <Link href={platformRoutes.playedGame(game.id)} className="profile-overview__game">
      <span className="profile-overview__board">
        <StaticDiagram fen={game.finalFen} orientation={game.color} look="material" />
      </span>
      <span className="profile-overview__game-text">
        <span className="profile-overview__game-name">
          <span
            className={`profile-overview__result profile-overview__result_result_${result}`}
            role="img"
            aria-label={RESULTS[result].label}
            title={RESULTS[result].label}
          >
            <span aria-hidden="true">{RESULTS[result].text}</span>
          </span>
          <span className="profile-overview__rival">{game.rival.name}</span>
        </span>
        <span className="profile-overview__game-facts">{facts}</span>
        <span className="profile-overview__game-facts">{formatRelativeSpanish(game.at, now)}</span>
      </span>
    </Link>
  );
}

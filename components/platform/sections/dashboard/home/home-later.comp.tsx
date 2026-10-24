import Link from "next/link";
import { useId } from "react";
import { CalendarDayIcon } from "@/components/icons/calendar-day-icon.comp";
import { GraduationCapIcon } from "@/components/icons/graduation-cap-icon.comp";
import { TrophyIcon } from "@/components/icons/trophy-icon.comp";
import { formatClassDay, formatClassHours } from "@/lib/format-class-when";
import type { HomeLater as HomeLaterItem } from "./home-plan";
import "./home-later.comp.css";

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** A tile as it is drawn: where it leads, its icon's tone, its name and its one line. */
function tileOf(item: HomeLaterItem): {
  key: string;
  href: string;
  tone: "course" | "class" | "exercises";
  title: string;
  line: string;
} {
  if (item.kind === "course") {
    return {
      key: "course",
      href: item.course.href,
      tone: "course",
      title: "Continuar el curso",
      line: `${item.course.courseName}: ${item.course.lessonName} · ${item.course.percent} %`,
    };
  }
  if (item.kind === "class") {
    const { card } = item;
    const start = new Date(card.startIso);
    const [startHour = ""] = formatClassHours(start, card.durationMin, card.timeZone).split("–");
    return {
      key: "class",
      href: card.href,
      tone: "class",
      title: "Tu próxima clase",
      line: `${capitalize(formatClassDay(start, card.timeZone, new Date(card.nowIso)))} a las ${startHour} · ${card.title}`,
    };
  }
  return {
    key: "exercises",
    href: item.exercises.href,
    tone: "exercises",
    title: "Ejercicios de tu clase",
    line: `${item.exercises.done} de ${item.exercises.total} hechos · ${item.exercises.classTitle}`,
  };
}

interface HomeLaterProps {
  items: HomeLaterItem[];
}

/**
 * «Después», under the focus of the home page: what else there is to do, as
 * tiles side by side — the course in progress when a class is the focus, the
 * next class when the course is, the exercises of a class still undone —,
 * each the whole of it a link, with an icon on its own tone. Nothing to show,
 * nothing drawn.
 */
export function HomeLater({ items }: HomeLaterProps) {
  const titleId = useId();
  if (items.length === 0) return null;

  return (
    <section className="home-later" aria-labelledby={titleId}>
      <h2 id={titleId} className="home-later__title">
        Después
      </h2>
      <ul className="home-later__list">
        {items.map((item) => {
          const tile = tileOf(item);
          return (
            <li key={tile.key} className="home-later__item">
              <Link href={tile.href} className="home-later__tile">
                <span className={`home-later__icon home-later__icon_tone_${tile.tone}`}>
                  {tile.tone === "course" && (
                    <GraduationCapIcon variant="classic-solid" className="home-later__glyph" />
                  )}
                  {tile.tone === "class" && <CalendarDayIcon variant="classic-solid" className="home-later__glyph" />}
                  {tile.tone === "exercises" && <TrophyIcon variant="classic-solid" className="home-later__glyph" />}
                </span>
                <span className="home-later__text">
                  <span className="home-later__name">{tile.title}</span>
                  <span className="home-later__line">{tile.line}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

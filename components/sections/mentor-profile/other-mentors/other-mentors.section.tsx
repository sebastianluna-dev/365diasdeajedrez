import type { Mentor } from "@/interfaces/mentor.interface";
import { MentorList } from "@/components/sections/homepage/mentors/mentor-list.comp";
import "./other-mentors.section.css";

interface MentorOthersSectionProps {
  mentors: Mentor[];
  currentSlug: string;
}

export function MentorOthersSection({ mentors, currentSlug }: MentorOthersSectionProps) {
  const others = mentors.filter((mentor) => mentor.slug !== currentSlug);

  return (
    <section id="maestros" className="mentor-others">
      <div className="mentor-others__inner">
        <h2 className="mentor-others__title">Mira más maestros de nuestra academia</h2>
        <MentorList mentors={others} />
      </div>
    </section>
  );
}

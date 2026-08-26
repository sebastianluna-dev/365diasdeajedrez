import type { MentorContent } from "@/services/mentors/mentors.types";
import { Mentor } from "./mentor.comp";
import "./mentor-list.comp.css";

interface MentorListProps {
  mentors: MentorContent[];
}

export function MentorList({ mentors }: MentorListProps) {
  return (
    <div className="mentor-list">
      {mentors.map((mentor) => (
        <Mentor key={mentor.slug} mentor={mentor} />
      ))}
    </div>
  );
}

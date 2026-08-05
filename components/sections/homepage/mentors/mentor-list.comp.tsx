import type { Mentor as MentorData } from "@/interfaces/mentor.interface";
import { Mentor } from "./mentor.comp";
import "./mentor-list.comp.css";

interface MentorListProps {
  mentors: MentorData[];
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

import {
  MeetingJoinCard,
  type MeetingJoinCardProps,
} from "@/components/platform/shared/meeting-join-card/meeting-join-card.comp";
import "./class-join-bar.comp.css";

export type ClassJoinBarProps = Omit<MeetingJoinCardProps, "density">;

/**
 * «Entrar a la clase» stuck to the bottom of a phone's screen while the
 * link is open (D20): the join card at its bar density inside a fixed strip,
 * drawn only under 1024px. Always a SIBLING of `.platform-page`, never
 * inside it: while the page's entrance animation runs, its transform makes
 * it the containing block of anything fixed. The page reserves the
 * bar's height with `platform-page_foot_join-bar`.
 */
export function ClassJoinBar(props: ClassJoinBarProps) {
  return (
    <div className="class-join-bar">
      <MeetingJoinCard {...props} density="bar" />
    </div>
  );
}

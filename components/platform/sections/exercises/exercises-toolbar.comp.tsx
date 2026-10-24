import Link from "next/link";
import { mdButton } from "@/lib/material/material-classes";
import { ExerciseTopicTally } from "./exercise-topic-tally.comp";
import "./exercises-toolbar.comp.css";

/** A button at the toolbar's right end: a link, or what a Client Component host does on a press. */
export interface ExercisesToolbarAction {
  label: string;
  href?: string;
  onClick?: () => void;
  /** Material's button: `filled` the way on, `outlined` the rest. */
  tone: "filled" | "outlined";
}

interface ExercisesToolbarProps {
  /** The page's heading, `h1`: read out and not drawn, as the side column already lights where the student is. */
  title: string;
  /** A fact at the right, in the variant ink: «Ejercicio 3 de 10», «4 de 10 resueltos». */
  summary?: string;
  /** The topic on screen, whose tally this browser keeps: «72 % de acierto · 18 resueltos». */
  tallyTopic?: string;
  actions?: ExercisesToolbarAction[];
}

/**
 * The toolbar on top of every panel of «Ejercicios» and «Puzzle Rush»
 * (2026-10-23, the owner's «M4»): on a hairline across the panel's top, what
 * the page says of itself and its buttons, at the right. No trail since
 * 2026-10-23, the owner's request: the side column lights where the student
 * is, so the page's heading is read out and not drawn, and with nothing to
 * say nor to press there is no bar at all. Data in, as the rule asks: the
 * topic's tally, which lives in the browser, is a leaf of its own.
 */
export function ExercisesToolbar({ title, summary, tallyTopic, actions = [] }: ExercisesToolbarProps) {
  const bare = !summary && !tallyTopic && actions.length === 0;
  return (
    <div className={`exercises-toolbar${bare ? " exercises-toolbar_display_heading" : ""}`}>
      <h1 className="exercises-toolbar__title">{title}</h1>
      <div className="exercises-toolbar__end">
        {summary && <p className="exercises-toolbar__summary">{summary}</p>}
        {tallyTopic && <ExerciseTopicTally code={tallyTopic} />}
        {actions.map((action) =>
          action.href ? (
            <Link key={action.label} href={action.href} className={mdButton(action.tone, "sm")}>
              {action.label}
            </Link>
          ) : (
            <button key={action.label} type="button" className={mdButton(action.tone, "sm")} onClick={action.onClick}>
              {action.label}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

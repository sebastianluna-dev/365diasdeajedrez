import Link from "next/link";
import { Fragment } from "react";
import { mdButton } from "@/lib/material/material-classes";
import type { PracticeLevelOption } from "@/services/exercises/practice.types";
import { ExerciseLevelFilter } from "./exercise-level-filter.comp";
import { ExerciseTopicTally } from "./exercise-topic-tally.comp";
import "./exercises-toolbar.comp.css";

/** A crumb of the trail: a way back up, or, the last one, the page's own name. */
export interface ExercisesCrumb {
  label: string;
  href?: string;
}

/** A button at the toolbar's right end: a link, or what a Client Component host does on a press. */
export interface ExercisesToolbarAction {
  label: string;
  href?: string;
  onClick?: () => void;
  /** Material's button: `filled` the way on, `outlined` the rest. */
  tone: "filled" | "outlined";
}

interface ExercisesToolbarProps {
  /** From «Ejercicios» down to the page; the last crumb is the page's heading, `h1`. */
  trail: ExercisesCrumb[];
  /** A fact at the right, in the variant ink: «Ejercicio 3 de 10», «4 de 10 resueltos». */
  summary?: string;
  /** The topic on screen, whose tally this browser keeps: «72 % de acierto · 18 resueltos». */
  tallyTopic?: string;
  /** The level filter of the trainer, with the topic it keeps. */
  level?: { levels: PracticeLevelOption[]; value: string | null; topicCode: string | null };
  actions?: ExercisesToolbarAction[];
}

/**
 * The toolbar on top of every panel of «Ejercicios» and «Puzzle Rush»
 * (2026-10-23, the owner's «M4»): on a hairline across the panel's top, the
 * trail from «Ejercicios» to the page — its last crumb the page's heading —,
 * and at the right what the page says of itself, the level to practise at
 * and its buttons. Data in, as the rule asks: the two parts that live in the
 * browser (the topic's tally and the level, which follows the address) are
 * leaves of their own.
 */
export function ExercisesToolbar({ trail, summary, tallyTopic, level, actions = [] }: ExercisesToolbarProps) {
  const last = trail.length - 1;
  return (
    <div className="exercises-toolbar">
      <nav className="exercises-toolbar__trail" aria-label="Dónde estás en Ejercicios">
        {trail.map((crumb, index) => (
          <Fragment key={`${index}:${crumb.label}`}>
            {index > 0 && (
              <span className="exercises-toolbar__separator" aria-hidden="true">
                ›
              </span>
            )}
            {index === last ? (
              <h1 className="exercises-toolbar__title">{crumb.label}</h1>
            ) : crumb.href ? (
              <Link href={crumb.href} className="exercises-toolbar__crumb">
                {crumb.label}
              </Link>
            ) : (
              <span className="exercises-toolbar__crumb">{crumb.label}</span>
            )}
          </Fragment>
        ))}
      </nav>

      <div className="exercises-toolbar__end">
        {summary && <p className="exercises-toolbar__summary">{summary}</p>}
        {tallyTopic && <ExerciseTopicTally code={tallyTopic} />}
        {level && <ExerciseLevelFilter levels={level.levels} value={level.value} topicCode={level.topicCode} />}
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

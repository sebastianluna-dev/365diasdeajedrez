"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import type { NotebookQuestionBlock } from "./class-notebook.sample";

interface NotebookProgressValue {
  done: number;
  total: number;
  answer: (questionId: string) => void;
}

const NotebookProgressContext = createContext<NotebookProgressValue | null>(null);

interface NotebookProgressProps {
  /** What the page already knows is done: the class's exercises the student solved or failed. */
  initialDone: number;
  /** Everything there is to do: the exercises and the questions. */
  total: number;
  children: ReactNode;
}

/**
 * The count of what the student has done in the class's article, shared by
 * the bar at the top and the questions inside the text: an answered
 * question adds itself once. Only the answers of this visit count — nothing
 * is stored yet (front-only, 2026-10-19).
 */
export function NotebookProgress({ initialDone, total, children }: NotebookProgressProps) {
  const [answered, setAnswered] = useState<string[]>([]);
  const answer = (questionId: string) =>
    setAnswered((current) => (current.includes(questionId) ? current : [...current, questionId]));
  return (
    <NotebookProgressContext.Provider value={{ done: initialDone + answered.length, total, answer }}>
      {children}
    </NotebookProgressContext.Provider>
  );
}

/** «1 de 4 hechas · 25 %» and the bar, in the side column over the class's index. */
export function NotebookProgressBar() {
  const progress = useContext(NotebookProgressContext);
  if (!progress || progress.total === 0) return null;
  const percent = Math.round((progress.done / progress.total) * 100);
  return (
    <div className="class-notebook__progress">
      <p className="class-notebook__progress-count">
        <span>
          {progress.done} de {progress.total} {progress.total === 1 ? "hecha" : "hechas"}
        </span>
        <span aria-hidden="true">{percent} %</span>
      </p>
      <span
        className="class-notebook__progress-track"
        role="progressbar"
        aria-label="Lo que llevas de la clase"
        aria-valuemin={0}
        aria-valuemax={progress.total}
        aria-valuenow={progress.done}
      >
        <span className="class-notebook__progress-fill" style={{ width: `${percent}%` }} />
      </span>
    </div>
  );
}

interface NotebookQuestionProps {
  question: NotebookQuestionBlock;
  /** The anchor the class's index leads to, on the first question. */
  anchorId?: string;
  /** «Pregunta 1 de 3». */
  position: string;
}

/**
 * «Ahora tú»: a position, a question and its options inside the article.
 * Choosing one says at once whether it was right and why; another can be
 * chosen after a wrong one. The first choice counts the question as done.
 */
export function NotebookQuestion({ question, position, anchorId }: NotebookQuestionProps) {
  const progress = useContext(NotebookProgressContext);
  const [picked, setPicked] = useState<string | null>(null);
  const chosen = question.options.find((option) => option.id === picked) ?? null;

  const pick = (id: string) => {
    setPicked(id);
    progress?.answer(question.id);
  };

  return (
    <section id={anchorId} className="class-notebook__question" aria-label={`Ahora tú · ${position}`}>
      <div className="class-notebook__question-board">
        <StaticDiagram fen={question.fen} orientation={question.orientation} look="material" />
      </div>
      <div className="class-notebook__question-body">
        <p className="class-notebook__eyebrow">Ahora tú · {position}</p>
        <p className="class-notebook__question-prompt">{question.prompt}</p>
        <div className="class-notebook__options" role="group" aria-label="Opciones">
          {question.options.map((option) => {
            const state = picked === option.id ? (option.correct ? "right" : "wrong") : "idle";
            return (
              <button
                key={option.id}
                type="button"
                className={`class-notebook__option class-notebook__option_state_${state}`}
                aria-pressed={picked === option.id}
                onClick={() => pick(option.id)}
              >
                <span className="class-notebook__option-ring" aria-hidden="true" />
                {option.label}
              </button>
            );
          })}
        </div>
        <p
          className={`class-notebook__feedback${chosen ? (chosen.correct ? " class-notebook__feedback_tone_right" : " class-notebook__feedback_tone_wrong") : ""}`}
          aria-live="polite"
        >
          {chosen?.explanation ?? ""}
        </p>
      </div>
    </section>
  );
}

"use client";

import { useState, type CSSProperties } from "react";
import {
  SCHOOL_CLASSES,
  SCHOOL_TEACHERS,
  SCHOOL_WEEK_DAYS,
  SCHOOL_WEEK_HOURS,
  type SchoolTeacherId,
} from "./school-week.const";
import "./school-week.comp.css";

/**
 * A school's week «as each teacher sees it» (the owner's «Escuelas C»): the
 * chips pick the teacher, and the agenda shows only that teacher's classes —
 * what the platform does today with its role boundary. «Toda la escuela» is
 * not built and stays disabled. One list of classes, placed on the hour grid
 * from 768 px and read as a list below it.
 */
export function SchoolWeek() {
  const [view, setView] = useState<SchoolTeacherId>("laura");
  const teacherName = SCHOOL_TEACHERS.find((entry) => entry.id === view)?.name ?? "";
  const mine = SCHOOL_CLASSES.filter((item) => item.teacher === view);
  const others = SCHOOL_CLASSES.length - mine.length;

  return (
    <div className="school-week">
      <div className="school-week__picker">
        <span className="school-week__picker-label" id="school-week-picker-label">
          Ver la semana como
        </span>
        <div className="school-week__chips" role="group" aria-labelledby="school-week-picker-label">
          {SCHOOL_TEACHERS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={`school-week__chip${entry.id === view ? " school-week__chip_selected" : ""}`}
              aria-pressed={entry.id === view}
              onClick={() => setView(entry.id)}
            >
              <i className={`school-week__avatar school-week__avatar_teacher_${entry.id}`} aria-hidden="true">
                {entry.initials}
              </i>
              {entry.name}
            </button>
          ))}
          <button type="button" className="school-week__chip school-week__chip_soon" disabled>
            Toda la escuela · próximamente
          </button>
        </div>
      </div>

      <div className="school-week__calendar">
        <div className="school-week__calendar-head">
          <h3 className="school-week__calendar-title">La agenda de {teacherName}</h3>
          <span className="school-week__count" aria-live="polite">
            {mine.length} clases suyas · {others} de otros profesores que no aparecen en su agenda
          </span>
        </div>
        <div className="school-week__grid">
          <span className="school-week__corner" aria-hidden="true" />
          {SCHOOL_WEEK_DAYS.map((day, index) => (
            <span
              key={day}
              className="school-week__day"
              style={{ "--school-week-column": index + 2 } as CSSProperties}
              aria-hidden="true"
            >
              {day}
            </span>
          ))}
          {SCHOOL_WEEK_HOURS.map((hour, index) => (
            <span
              key={hour}
              className="school-week__hour"
              style={{ "--school-week-row": index + 2 } as CSSProperties}
              aria-hidden="true"
            >
              {hour}
            </span>
          ))}
          <ul className="school-week__classes" aria-label={`Clases de ${teacherName}, del lunes 2 al sábado 7`}>
            {mine.map((item) => (
              <li
                key={`${item.day}-${item.hour}`}
                className={`school-week__class school-week__class_teacher_${item.teacher}`}
                style={
                  {
                    "--school-week-row": item.hour + 2,
                    "--school-week-span": item.span,
                    "--school-week-column": item.day + 2,
                  } as CSSProperties
                }
              >
                <span className="school-week__when">
                  {SCHOOL_WEEK_DAYS[item.day]} · {SCHOOL_WEEK_HOURS[item.hour]}
                </span>
                <strong className="school-week__class-title">{item.title}</strong>
                <span className="school-week__class-people">{item.people}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

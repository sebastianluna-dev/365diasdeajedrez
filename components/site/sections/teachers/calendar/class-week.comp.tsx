"use client";

import { useState, type CSSProperties } from "react";
import { CirclePlayIcon } from "@/components/icons/circle-play-icon.comp";
import { ListOlIcon } from "@/components/icons/list-ol-icon.comp";
import { PenLineIcon } from "@/components/icons/pen-line-icon.comp";
import {
  CLASS_WEEK_CLASSES,
  CLASS_WEEK_DAYS,
  CLASS_WEEK_HOURS,
  CLASS_WEEK_LIVE,
  CLASS_WEEK_NOW,
  CLASS_WEEK_START_HOUR,
  CLASS_WEEK_STATE_LABEL,
  type ClassWeekClass,
} from "./class-week.const";
import "./class-week.comp.css";

const minutesOf = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const clock = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

const topicOf = (item: ClassWeekClass) => item.topic || "Clase sin tema";

const countOf = (count: number) => `${count} ${count === 1 ? "clase" : "clases"}`;

function noteOf(item: ClassWeekClass): string {
  switch (item.state) {
    case "done":
      return "Ya la cerraste: tus alumnos ven tu resumen y la grabación.";
    case "close":
      return "Ya terminó y falta cerrarla: pasa lista y deja el resumen.";
    case "live":
      return "Está en curso. Tus alumnos entran desde su inicio.";
    case "open":
      return "El enlace ya está abierto.";
    case "cancel":
      return "Administración la canceló.";
    case "up":
      if (item.noLink) return "Sin enlace: administración lo agregará.";
      if (!item.topic) return "Ponle tema y lo que verán antes de la clase.";
      return "El enlace se abre antes de la clase.";
  }
}

/** Geometry of a block in the hour grid, as custom properties the stylesheet multiplies by its row height. */
function blockStyle(item: ClassWeekClass): CSSProperties {
  return {
    "--class-week-start": minutesOf(item.start) / 60 - CLASS_WEEK_START_HOUR,
    "--class-week-length": item.minutes / 60,
  } as CSSProperties;
}

const HOUR_LABELS = Array.from({ length: CLASS_WEEK_HOURS }, (_, index) => clock((CLASS_WEEK_START_HOUR + index) * 60));

/**
 * The teacher's week of the landing (the owner's «Calendario A»): a day picks
 * its agenda, a class fills the card with its state and the three actions —
 * «Entrar a la clase», «Pasar lista», «Preparar» — which here only say what
 * they open. Below 768 px the hour grid gives way to the days' row and the
 * agenda, which carry the same choices.
 */
export function ClassWeek() {
  const [day, setDay] = useState<number>(CLASS_WEEK_NOW.day);
  const [selectedId, setSelectedId] = useState(CLASS_WEEK_LIVE.id);
  const [did, setDid] = useState("");

  const selected = CLASS_WEEK_CLASSES.find((item) => item.id === selectedId) ?? CLASS_WEEK_LIVE;
  const joinable = selected.state === "live" || selected.state === "open";
  const canRoll = selected.state === "live" || selected.state === "close" || selected.state === "done";
  const canPrepare = selected.state !== "cancel";
  const primary = joinable ? "enter" : selected.state === "close" ? "roll" : selected.state === "up" ? "prepare" : null;
  const start = minutesOf(selected.start);
  const selectedDay = CLASS_WEEK_DAYS.find((entry) => entry.num === selected.day);
  const flags = [selected.noLink && "Sin enlace", !selected.topic && "Sin tema"].filter(Boolean) as string[];

  const dayClasses = CLASS_WEEK_CLASSES.filter((item) => item.day === day);
  const dayName = CLASS_WEEK_DAYS.find((entry) => entry.num === day)?.long ?? "";
  const pending = CLASS_WEEK_CLASSES.filter((item) => item.state === "close").length;

  function pickDay(num: number) {
    const list = CLASS_WEEK_CLASSES.filter((item) => item.day === num);
    setDay(num);
    const first = list[0];
    if (first && !list.some((item) => item.id === selectedId)) setSelectedId(first.id);
    setDid("");
  }

  function pickClass(item: ClassWeekClass) {
    setSelectedId(item.id);
    setDay(item.day);
    setDid("");
  }

  const actionClass = (action: "enter" | "roll" | "prepare", fallback: "outlined" | "tonal") =>
    `class-week__action class-week__action_variant_${primary === action ? "filled" : fallback}`;

  return (
    <div className="class-week">
      <div className="class-week__week">
        <div className="class-week__toolbar">
          <h3 className="class-week__range">19 al 25 de octubre de 2026</h3>
          <span className="class-week__count">
            {countOf(CLASS_WEEK_CLASSES.length)} · {pending} por finalizar
          </span>
          <ul className="class-week__legend" aria-hidden="true">
            <li className="class-week__legend-item class-week__legend-item_state_live">En vivo</li>
            <li className="class-week__legend-item class-week__legend-item_state_up">Programada</li>
            <li className="class-week__legend-item class-week__legend-item_state_close">Por finalizar</li>
            <li className="class-week__legend-item class-week__legend-item_state_done">Finalizada</li>
          </ul>
        </div>

        <div className="class-week__grid">
          <span className="class-week__corner" />
          {CLASS_WEEK_DAYS.map((entry) => {
            const count = CLASS_WEEK_CLASSES.filter((item) => item.day === entry.num).length;
            const isToday = entry.num === CLASS_WEEK_NOW.day;
            return (
              <button
                key={entry.num}
                type="button"
                className={`class-week__day${isToday ? " class-week__day_today" : ""}${entry.num === day ? " class-week__day_selected" : ""}`}
                aria-pressed={entry.num === day}
                aria-label={`${entry.long} de octubre, ${countOf(count)}${isToday ? ", hoy" : ""}`}
                onClick={() => pickDay(entry.num)}
              >
                <span className="class-week__day-short">{entry.short}</span>
                <span className="class-week__day-num">{entry.num}</span>
              </button>
            );
          })}

          <div className="class-week__hours" aria-hidden="true">
            {HOUR_LABELS.map((label, index) => (
              <span key={label} className="class-week__hour" style={{ "--class-week-start": index } as CSSProperties}>
                {label}
              </span>
            ))}
          </div>
          {CLASS_WEEK_DAYS.map((entry) => (
            <div
              key={entry.num}
              className={`class-week__column${entry.num === day ? " class-week__column_selected" : ""}`}
            >
              {CLASS_WEEK_CLASSES.filter((item) => item.day === entry.num).map((item) => {
                const short = item.minutes < 60;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`class-week__block class-week__block_state_${item.state}${item.id === selected.id ? " class-week__block_selected" : ""}`}
                    style={blockStyle(item)}
                    aria-pressed={item.id === selected.id}
                    aria-label={`${item.start}, ${topicOf(item)}, ${item.people}, ${CLASS_WEEK_STATE_LABEL[item.state]}${item.noLink ? ", sin enlace" : ""}`}
                    onClick={() => pickClass(item)}
                  >
                    <strong className="class-week__block-line">
                      {short
                        ? `${item.start} ${topicOf(item)}`
                        : `${item.start} · ${item.kind === "group" ? "Grupal" : "Individual"}`}
                    </strong>
                    {!short && <span className="class-week__block-line">{topicOf(item)}</span>}
                  </button>
                );
              })}
              {entry.num === CLASS_WEEK_NOW.day && (
                <span
                  className="class-week__now"
                  style={{ "--class-week-start": CLASS_WEEK_NOW.minutes / 60 - CLASS_WEEK_START_HOUR } as CSSProperties}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="class-week__side">
        <article className="class-week__card" aria-labelledby="class-week-card-title" aria-live="polite">
          <div className="class-week__chips">
            <span className={`class-week__chip class-week__chip_state_${selected.state}`}>
              {CLASS_WEEK_STATE_LABEL[selected.state]}
            </span>
            <span className="class-week__chip class-week__chip_state_kind">
              {selected.kind === "group" ? "Grupal" : "Individual"}
            </span>
            {flags.map((flag) => (
              <span key={flag} className="class-week__chip class-week__chip_state_flag">
                {flag}
              </span>
            ))}
          </div>
          <h3 className="class-week__card-title" id="class-week-card-title">
            {topicOf(selected)}
          </h3>
          <div className="class-week__meta">
            <strong>
              {selectedDay?.long} de octubre · {selected.start} a {clock(start + selected.minutes)} · {selected.minutes}{" "}
              min
            </strong>
            <span>{selected.kind === "group" ? selected.people : `Con ${selected.people}`}</span>
            <span>{noteOf(selected)}</span>
          </div>
          <div className="class-week__actions">
            <button
              type="button"
              className={actionClass("enter", "outlined")}
              aria-disabled={!joinable}
              onClick={() => joinable && setDid(`Abre la videollamada de «${topicOf(selected)}».`)}
            >
              <CirclePlayIcon className="class-week__action-icon" variant="classic-solid" />
              Entrar a la clase
            </button>
            <button
              type="button"
              className={actionClass("roll", "tonal")}
              aria-disabled={!canRoll}
              onClick={() => canRoll && setDid("Abre la lista: marcas quién vino, dejas el resumen y la finalizas.")}
            >
              <ListOlIcon className="class-week__action-icon" variant="classic-solid" />
              Pasar lista
            </button>
            <button
              type="button"
              className={actionClass("prepare", "outlined")}
              aria-disabled={!canPrepare}
              onClick={() =>
                canPrepare && setDid("Abre su cuaderno: «Para preparar», «Después de la clase» y tu guion.")
              }
            >
              <PenLineIcon className="class-week__action-icon" variant="classic-solid" />
              Preparar
            </button>
          </div>
          <p className="class-week__did">{did}</p>
        </article>

        <section className="class-week__agenda" aria-labelledby="class-week-day-title">
          <h3 className="class-week__agenda-title" id="class-week-day-title">
            {dayName}
            {day === CLASS_WEEK_NOW.day ? " · hoy" : ""}
            <small className="class-week__agenda-count">{countOf(dayClasses.length)}</small>
          </h3>
          {dayClasses.length > 0 ? (
            <ul className="class-week__rows">
              {dayClasses.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`class-week__row${item.id === selected.id ? " class-week__row_selected" : ""}`}
                    aria-pressed={item.id === selected.id}
                    onClick={() => pickClass(item)}
                  >
                    <span className="class-week__row-time">{item.start}</span>
                    <span className="class-week__row-text">
                      <strong className="class-week__row-title">{topicOf(item)}</strong>
                      <span className="class-week__row-people">{item.people}</span>
                    </span>
                    <span className={`class-week__chip class-week__chip_state_${item.state}`}>
                      {CLASS_WEEK_STATE_LABEL[item.state]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="class-week__empty">No tienes clases este día.</p>
          )}
        </section>
      </div>
    </div>
  );
}

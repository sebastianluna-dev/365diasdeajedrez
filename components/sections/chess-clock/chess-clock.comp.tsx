"use client";

import { useChessClock } from "@/hooks/use-chess-clock.hook";
import { ClockDial } from "./clock-dial.comp";
import "./chess-clock.comp.css";

export function ChessClock() {
  const { white, black, controls, playLabel, statusText, toggle, reset } = useChessClock();

  return (
    <div className="chess-clock">
      <div className="chess-clock__intro">
        <h1 className="chess-clock__title">Reloj de ajedrez</h1>
        <p className="chess-clock__subtitle">Pulsa tu botón al terminar tu jugada — o presiona la barra espaciadora.</p>
      </div>

      <div className="chess-clock__case-wrap">
        <div className="chess-clock__knobs">
          <button
            type="button"
            onClick={white.onPress}
            aria-label="Botón blancas"
            className={`clock-knob${white.knobPressed ? " clock-knob_pressed" : ""}`}
          />
          <button
            type="button"
            onClick={black.onPress}
            aria-label="Botón negras"
            className={`clock-knob${black.knobPressed ? " clock-knob_pressed" : ""}`}
          />
        </div>

        <div className="chess-clock__case">
          <ClockDial
            label="Blancas"
            time={white.time}
            hands={white.hands}
            active={white.active}
            flagged={white.flagged}
            lowTime={white.lowTime}
            onPress={white.onPress}
          />
          <ClockDial
            label="Negras"
            time={black.time}
            hands={black.hands}
            active={black.active}
            flagged={black.flagged}
            lowTime={black.lowTime}
            onPress={black.onPress}
          />
        </div>
      </div>

      <div className="chess-clock__controls">
        {controls.map((control) => (
          <button
            key={control.label}
            type="button"
            onClick={control.onSelect}
            className={`chess-clock__control${control.active ? " chess-clock__control_active" : ""}`}
          >
            {control.label}
          </button>
        ))}
      </div>

      <div className="chess-clock__actions">
        <button type="button" onClick={toggle} className="chess-clock__action chess-clock__action_variant_primary">
          {playLabel}
        </button>
        <button type="button" onClick={reset} className="chess-clock__action chess-clock__action_variant_secondary">
          Reiniciar
        </button>
      </div>

      <p className="chess-clock__status">{statusText}</p>
    </div>
  );
}

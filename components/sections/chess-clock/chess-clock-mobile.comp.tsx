"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, Home, RotateCcw } from "lucide-react";
import { useChessClock } from "@/hooks/use-chess-clock.hook";
import { ClockDial } from "./clock-dial.comp";
import { TimeRoller } from "./time-roller.comp";
import "./chess-clock-mobile.comp.css";

type MobileStep = "select" | "play";

export function ChessClockMobile() {
  const [step, setStep] = useState<MobileStep>("select");
  const { white, black, controls, toggle, reset } = useChessClock();

  function handleStart() {
    setStep("play");
  }

  function handleConfig() {
    if (white.active || black.active) toggle();
    setStep("select");
  }

  return (
    <div className={`chess-clock-mobile chess-clock-mobile_step_${step}`}>
      {step === "select" ? (
        <>
          <div className="chess-clock-mobile__intro">
            <h1 className="chess-clock-mobile__title">Reloj de ajedrez</h1>
            <p className="chess-clock-mobile__subtitle">Selecciona el tiempo de la partida y presiona iniciar.</p>
          </div>

          <div className="chess-clock-mobile__case-wrap">
            <div className="chess-clock-mobile__knobs">
              <div className="chess-clock-mobile__knob" />
              <div className="chess-clock-mobile__knob" />
            </div>

            <div className="chess-clock-mobile__case">
              <ClockDial
                hands={white.hands}
                active={white.active}
                flagged={white.flagged}
                lowTime={white.lowTime}
              />
              <ClockDial
                hands={black.hands}
                active={black.active}
                flagged={black.flagged}
                lowTime={black.lowTime}
              />
            </div>
          </div>

          <div className="chess-clock-mobile__controls">
            {controls.map((control) => (
              <button
                key={control.label}
                type="button"
                onClick={control.onSelect}
                className={`chess-clock-mobile__control${control.active ? " chess-clock-mobile__control_active" : ""}`}
              >
                {control.label}
              </button>
            ))}
          </div>

          <button type="button" onClick={handleStart} className="chess-clock-mobile__start">
            Iniciar
          </button>
        </>
      ) : (
        <div className="chess-clock-mobile__rotated">
          <div className="chess-clock-mobile__case-wrap">
            <div className="chess-clock-mobile__knobs">
              <div
                aria-hidden="true"
                className={`chess-clock-mobile__knob${white.knobPressed ? " chess-clock-mobile__knob_pressed" : ""}`}
              />
              <div
                aria-hidden="true"
                className={`chess-clock-mobile__knob${black.knobPressed ? " chess-clock-mobile__knob_pressed" : ""}`}
              />
            </div>

            <div className="chess-clock-mobile__case">
              <button
                type="button"
                onClick={white.onPress}
                aria-label="Turno de las blancas"
                className={`chess-clock-mobile__tap-zone${white.active ? " chess-clock-mobile__tap-zone_active" : ""}`}
              >
                <div className="chess-clock-mobile__dial-time">
                  <ClockDial hands={white.hands} active={white.active} flagged={white.flagged} lowTime={white.lowTime} />
                  <TimeRoller value={white.time} active={white.active} flagged={white.flagged} />
                </div>
              </button>

              <div className="chess-clock-mobile__actions">
                <button type="button" onClick={reset} aria-label="Reiniciar" className="chess-clock-mobile__action">
                  <RotateCcw size={28} />
                </button>
                <Link href="/" aria-label="Inicio" className="chess-clock-mobile__action">
                  <Home size={28} />
                </Link>
                <button type="button" onClick={handleConfig} aria-label="Configurar" className="chess-clock-mobile__action">
                  <Settings size={28} />
                </button>
              </div>

              <button
                type="button"
                onClick={black.onPress}
                aria-label="Turno de las negras"
                className={`chess-clock-mobile__tap-zone${black.active ? " chess-clock-mobile__tap-zone_active" : ""}`}
              >
                <div className="chess-clock-mobile__dial-time">
                  <ClockDial hands={black.hands} active={black.active} flagged={black.flagged} lowTime={black.lowTime} />
                  <TimeRoller value={black.time} active={black.active} flagged={black.flagged} />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";

export type ClockSide = "w" | "b";

export interface ClockTimeControl {
  label: string;
  base: number;
  inc: number;
}

export const CLOCK_TIME_CONTROLS: ClockTimeControl[] = [
  { label: "3 + 2", base: 180, inc: 2 },
  { label: "5 + 0", base: 300, inc: 0 },
  { label: "10 + 0", base: 600, inc: 0 },
  { label: "15 + 10", base: 900, inc: 10 },
  { label: "30 + 0", base: 1800, inc: 0 },
];

interface ClockState {
  base: number;
  inc: number;
  w: number;
  b: number;
  active: ClockSide | null;
  running: boolean;
  flagged: ClockSide | null;
}

export function formatTime(t: number): string {
  const total = Math.ceil(t);
  const m = Math.floor(total / 60);
  const sec = total % 60;
  if (t < 20 && t > 0) {
    return `${m}:${String(sec).padStart(2, "0")}.${Math.floor((t % 1) * 10)}`;
  }
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function handAngles(t: number) {
  const sec = t % 60;
  const min = (t / 60) % 60;
  const hour = (t / 3600) % 12;
  return {
    hour: hour * 30,
    min: min * 6,
    sec: sec * 6,
  };
}

export interface UseChessClockOptions {
  /**
   * With `false` the clock neither runs nor listens to the keyboard. The clock
   * page mounts both variants (desktop and mobile) and hides them with CSS, so
   * without this both counted at once and both responded to the space bar.
   */
  enabled?: boolean;
}

/** Elements on which the space bar already has a job (activating the control). */
const INTERACTIVE_TARGET = "button, a, input, select, textarea, [role='button']";

export function useChessClock({ enabled = true }: UseChessClockOptions = {}) {
  const [state, setState] = useState<ClockState>({
    base: CLOCK_TIME_CONTROLS[0].base,
    inc: CLOCK_TIME_CONTROLS[0].inc,
    w: CLOCK_TIME_CONTROLS[0].base,
    b: CLOCK_TIME_CONTROLS[0].base,
    active: null,
    running: false,
    flagged: null,
  });

  // Date.now() and the ref sync live in effects: calling them during render is
  // impure (react-hooks/purity rule).
  const lastTick = useRef(0);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!enabled) return;
    lastTick.current = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTick.current) / 1000;
      lastTick.current = now;
      const s = stateRef.current;
      if (!s.running || !s.active || s.flagged) return;
      const key = s.active;
      const remaining = Math.max(0, s[key] - dt);
      setState((current) => {
        const next = { ...current, [key]: remaining };
        if (remaining <= 0) {
          next.flagged = key;
          next.running = false;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [enabled]);

  const press = useCallback((side: ClockSide) => {
    setState((s) => {
      if (s.flagged) return s;
      const next: ClockState = { ...s, active: side === "w" ? "b" : "w", running: true };
      if (s.running && s.active === side) {
        next[side] = s[side] + s.inc;
      }
      return next;
    });
  }, []);

  const toggle = useCallback(() => {
    setState((s) => {
      if (s.flagged) return s;
      if (!s.active) return { ...s, active: "w", running: true };
      return { ...s, running: !s.running };
    });
  }, []);

  const reset = useCallback(() => {
    setState((s) => ({ ...s, w: s.base, b: s.base, active: null, running: false, flagged: null }));
  }, []);

  const selectControl = useCallback((control: ClockTimeControl) => {
    setState((s) => ({
      ...s,
      base: control.base,
      inc: control.inc,
      w: control.base,
      b: control.base,
      active: null,
      running: false,
      flagged: null,
    }));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      // With the focus on a button or a link, the space bar is theirs:
      // intercepting it left "Reiniciar" and "Configurar" without keyboard.
      if (e.target instanceof Element && e.target.closest(INTERACTIVE_TARGET)) return;
      e.preventDefault();
      press(stateRef.current.active === "w" ? "w" : "b");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press, enabled]);

  const whiteActive = state.active === "w" && state.running;
  const blackActive = state.active === "b" && state.running;

  const statusText = state.flagged
    ? `Se acabó el tiempo de ${state.flagged === "w" ? "las blancas" : "las negras"}.`
    : !state.active
      ? "Pulsa un botón para iniciar la partida."
      : state.running
        ? `Corre el reloj de ${state.active === "w" ? "las blancas" : "las negras"}.`
        : "Pausado.";

  const playLabel = state.running ? "Pausar" : state.active ? "Continuar" : "Iniciar";

  return {
    white: {
      time: formatTime(state.w),
      hands: handAngles(state.w),
      active: whiteActive,
      flagged: state.flagged === "w",
      lowTime: state.flagged === "w" || state.w <= 60,
      knobPressed: !whiteActive && state.running && state.active === "b",
      onPress: () => press("w"),
    },
    black: {
      time: formatTime(state.b),
      hands: handAngles(state.b),
      active: blackActive,
      flagged: state.flagged === "b",
      lowTime: state.flagged === "b" || state.b <= 60,
      knobPressed: !blackActive && state.running && state.active === "w",
      onPress: () => press("b"),
    },
    controls: CLOCK_TIME_CONTROLS.map((control) => ({
      ...control,
      active: control.base === state.base && control.inc === state.inc,
      onSelect: () => selectControl(control),
    })),
    playLabel,
    statusText,
    toggle,
    reset,
  };
}

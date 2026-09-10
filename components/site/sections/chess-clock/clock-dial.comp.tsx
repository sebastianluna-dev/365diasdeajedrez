import type { CSSProperties } from "react";
import "./clock-dial.comp.css";

type HandStyle = CSSProperties & { "--hand-rotation": string };

interface ClockDialProps {
  label?: string;
  time?: string;
  hands: { hour: number; min: number; sec: number };
  active: boolean;
  flagged: boolean;
  lowTime: boolean;
  onPress?: () => void;
  compact?: boolean;
}

export function ClockDial({ label, time, hands, active, flagged, lowTime, onPress, compact }: ClockDialProps) {
  const dialClassName = `clock-dial${active ? " clock-dial_active" : ""}${flagged ? " clock-dial_fallen" : ""}`;

  const face = (
    <span className="clock-face">
      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
        <span key={n} className={`clock-face__number clock-face__number_position_${n}`}>
          {n}
        </span>
      ))}
      <span className={`clock-flag${flagged ? " clock-flag_fallen" : lowTime ? " clock-flag_alert" : ""}`}>◤</span>
      <span
        className={`clock-hand clock-hand_type_hour${active ? " clock-hand_active" : ""}`}
        style={{ "--hand-rotation": `${hands.hour}deg` } as HandStyle}
      />
      <span
        className={`clock-hand clock-hand_type_min${active ? " clock-hand_active" : ""}`}
        style={{ "--hand-rotation": `${hands.min}deg` } as HandStyle}
      />
      <span
        className={`clock-hand clock-hand_type_sec${active ? " clock-hand_active" : ""}`}
        style={{ "--hand-rotation": `${hands.sec}deg` } as HandStyle}
      />
      <span className="clock-face__pin" />
    </span>
  );

  return (
    <div className={`clock-dial-column${compact ? " clock-dial-column_compact" : ""}`}>
      {onPress ? (
        <button type="button" onClick={onPress} className={dialClassName}>
          {face}
        </button>
      ) : (
        <div className={dialClassName}>{face}</div>
      )}
      {!compact && (
        <>
          {time !== undefined && (
            <div className={`clock-readout${flagged ? " clock-readout_fallen" : active ? " clock-readout_active" : ""}`}>
              {time}
            </div>
          )}
          {label && <span className="clock-dial-column__label">{label}</span>}
        </>
      )}
    </div>
  );
}

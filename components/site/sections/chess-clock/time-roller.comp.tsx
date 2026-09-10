"use client";

import { useState } from "react";
import "./time-roller.comp.css";

interface TimeRollerDigitProps {
  char: string;
}

function TimeRollerDigit({ char }: TimeRollerDigitProps) {
  const [current, setCurrent] = useState(char);
  const [leaving, setLeaving] = useState<string | null>(null);

  if (char !== current) {
    setLeaving(current);
    setCurrent(char);
  }

  const isSeparator = char === ":" || char === ".";

  return (
    <span
      className={`time-roller__slot${isSeparator ? " time-roller__slot_separator" : ""}`}
      onAnimationEnd={() => setLeaving(null)}
    >
      {leaving !== null && (
        <span key={`leave-${leaving}`} className="time-roller__digit time-roller__digit_leave">
          {leaving}
        </span>
      )}
      <span key={`enter-${current}`} className="time-roller__digit time-roller__digit_enter">
        {current}
      </span>
    </span>
  );
}

interface TimeRollerProps {
  value: string;
  active?: boolean;
  flagged?: boolean;
}

export function TimeRoller({ value, active, flagged }: TimeRollerProps) {
  const chars = value.split("");
  const lastIndex = chars.length - 1;

  return (
    <div className={`time-roller${flagged ? " time-roller_fallen" : active ? " time-roller_active" : ""}`}>
      {chars.map((char, i) => (
        <TimeRollerDigit key={lastIndex - i} char={char} />
      ))}
    </div>
  );
}

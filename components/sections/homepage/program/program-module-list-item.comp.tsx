import { formatTwoDigitNumber } from "@/lib/format-two-digit-number";
import "./program-module-list-item.comp.css";

interface ProgramModuleListItemProps {
  module: { title: string; durationLabel: string };
  moduleNumber: number;
  isActive: boolean;
  onSelect: () => void;
}

export function ProgramModuleListItem({ module, moduleNumber, isActive, onSelect }: ProgramModuleListItemProps) {
  return (
    <button
      type="button"
      className={`program-list__item${isActive ? " program-list__item_active" : ""}`}
      onClick={onSelect}
      // With the number in two digits: on mobile the "01" is the only visible
      // part of the button and it has to be inside its accessible name.
      aria-label={`Módulo ${formatTwoDigitNumber(moduleNumber)}: ${module.title}`}
      aria-pressed={isActive}
    >
      <span className="program-list__number">{formatTwoDigitNumber(moduleNumber)}</span>
      <div className={`program-list__label${isActive ? " program-list__label_active" : ""}`}>
        <p className="program-list__title">{module.title}</p>
        <p>{module.durationLabel}</p>
      </div>
    </button>
  );
}

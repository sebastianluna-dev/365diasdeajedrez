import type { ProgramModule } from "@/interfaces/program-module.interface";
import "./program-module-list-item.comp.css";

interface ProgramModuleListItemProps {
  module: ProgramModule;
  isActive: boolean;
  onSelect: () => void;
}

export function ProgramModuleListItem({ module, isActive, onSelect }: ProgramModuleListItemProps) {
  return (
    <button
      type="button"
      className={`program-list__item${isActive ? " program-list__item_active" : ""}`}
      onClick={onSelect}
    >
      <span className="program-list__number">0{module.moduleNumber}</span>
      <div className={`program-list__label${isActive ? " program-list__label_active" : ""}`}>
        <p className="program-list__title">{module.title}</p>
        <p>{module.durationLabel}</p>
      </div>
    </button>
  );
}

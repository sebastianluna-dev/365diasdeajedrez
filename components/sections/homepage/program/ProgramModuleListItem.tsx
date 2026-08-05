import type { ProgramModule } from "@/interfaces/programModule";

interface ProgramModuleListItemProps {
  module: ProgramModule;
  isActive: boolean;
  onSelect: () => void;
}

export function ProgramModuleListItem({ module, isActive, onSelect }: ProgramModuleListItemProps) {
  return (
    <button
      type="button"
      className={`programListItem${isActive ? " programListItemActive" : ""} duration-150 cursor-pointer bg-dark/5`}
      onClick={onSelect}
    >
      <span className="bg-dark/5 w-12 h-12 flex items-center justify-center rounded-xl text-lg font-semibold duration-150 font-serif">
        0{module.moduleNumber}
      </span>
      <div className={`flex flex-col text-left duration-150 ${isActive ? "text-dark" : "text-dark/80"}`}>
        <p className="font-bold">{module.title}</p>
        <p className="">{module.durationLabel}</p>
      </div>
    </button>
  );
}

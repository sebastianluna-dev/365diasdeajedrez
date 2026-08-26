"use client";

import { useState } from "react";
import type { ProgramModuleContent } from "@/services/home/home.types";
import { ProgramModuleListItem } from "./program-module-list-item.comp";

interface ProgramInteractiveProps {
  modules: ProgramModuleContent[];
}

export function ProgramInteractive({ modules }: ProgramInteractiveProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeModule = modules[activeIndex];

  return (
    <div className="program__wrap">
      <div className="program-list">
        {modules.map((module, index) => (
          <ProgramModuleListItem
            key={module.title}
            module={module}
            moduleNumber={index + 1}
            isActive={index === activeIndex}
            onSelect={() => setActiveIndex(index)}
          />
        ))}
      </div>

      <div className="program-panel">
        <div className="program-panel__badges">
          <span className="program-panel__badge program-panel__badge_variant_primary">
            {activeModule.durationLabel}
          </span>
          <span className="program-panel__badge program-panel__badge_variant_outline">
            Módulo 0{activeIndex + 1} de 0{modules.length}
          </span>
        </div>
        <div>
          <h2 className="program-panel__title">{activeModule.title}</h2>
          <p className="program-panel__description">{activeModule.description}</p>
        </div>
        <div>
          <h3 className="program-panel__subheading">En qué trabajamos</h3>
          <ul className="program-panel__topics">
            {activeModule.topics.map((topic, index) => (
              <li className="program-panel__topic" key={index}>
                {topic}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

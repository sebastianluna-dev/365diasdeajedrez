"use client";

import { useState } from "react";
import { ProgramModuleListItem } from "./program-module-list-item.comp";
import "./program.section.css";

interface ProgramModuleData {
  title: string;
  durationLabel: string;
  subtitle?: string | null;
  description: string;
  topics?: { text: string }[] | null;
}

interface ProgramSectionProps {
  sectionTitle: string;
  sectionDescription: string;
  note?: string;
  modules: ProgramModuleData[];
}

export function ProgramSection({ sectionTitle, sectionDescription, note, modules }: ProgramSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeModule = modules[activeIndex];

  return (
    <section id="programa" className="section section_theme_light program">
      <div className="section__inner">
        <div className="section__head">
          <div>
            <h2 className="section__title program__title">{sectionTitle}</h2>
            <p className="section__text">{sectionDescription}</p>
          </div>
        </div>

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
                {activeModule.topics?.map((item, index) => (
                  <li className="program-panel__topic" key={index}>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {note && <p className="program__note">{note}</p>}
      </div>
    </section>
  );
}

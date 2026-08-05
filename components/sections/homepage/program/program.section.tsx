"use client";

import { useState } from "react";
import { programModules } from "@/data/program-modules.data";
import { ProgramModuleListItem } from "./program-module-list-item.comp";
import "./program.section.css";

export function ProgramSection() {
  const [activeModule, setActiveModule] = useState(programModules[0]);
  return (
    <section id="programa" className="section section_theme_light program">
      <div className="section__inner">
        <div className="section__head">
          <div>
            <h2 className="section__title program__title">Un método diseñado para desarrollar un ajedrez sólido.</h2>
            <p className="section__text">
              Cinco módulos con una progresión natural: desde los principios fundamentales hasta los finales más
              complejos. Cada etapa desarrolla habilidades específicas y prepara el camino para la siguiente.
            </p>
          </div>
        </div>

        <div className="program__wrap">
          <div className="program-list">
            {programModules.map((module) => (
              <ProgramModuleListItem
                key={module.moduleNumber}
                module={module}
                isActive={module.moduleNumber === activeModule.moduleNumber}
                onSelect={() => setActiveModule(module)}
              />
            ))}
          </div>

          <div className="program-panel">
            <div className="program-panel__badges">
              <span className="program-panel__badge program-panel__badge_variant_primary">{activeModule.durationLabel}</span>
              <span className="program-panel__badge program-panel__badge_variant_outline">
                Módulo 0{activeModule.moduleNumber} de 0{programModules.length}
              </span>
            </div>
            <div>
              <h2 className="program-panel__title">{activeModule.title}</h2>
              <p className="program-panel__subtitle">{activeModule.subtitle}</p>
              <p className="program-panel__description">{activeModule.description}</p>
            </div>
            <div>
              <h3 className="program-panel__subheading">En qué trabajamos</h3>
              <ul className="program-panel__topics">
                {activeModule.topics.map((item, index) => (
                  <li className="program-panel__topic" key={index}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="program__note">
          La mitad del programa está dedicada a comprender el juego —fundamentos y medio juego—; la otra mitad, a las
          habilidades técnicas. No buscamos que memorices más movimientos, sino que aprendas a encontrar las mejores
          ideas por ti mismo.
        </p>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { programModules } from "@/data/programModules";
import { ProgramModuleListItem } from "./ProgramModuleListItem";
import "./program.css";

export function ProgramSection() {
  const [activeModule, setActiveModule] = useState(programModules[0]);
  return (
    <section id="programa" className="section section_theme_light program">
      <div className="section__inner">
        <div className="section__head">
          <div>
            <h2 className="section__title max-w-xl">Un método diseñado para desarrollar un ajedrez sólido.</h2>
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

          <div className="program-panel bg-light-gray">
            <div className="flex gap-2 mb-4">
              <span className="bg-primary px-4 py-1 rounded-full font-semibold">{activeModule.durationLabel}</span>
              <span className="bg-dark/5 px-4 py-1 rounded-full font-semibold border-normal-gray border">
                Módulo 0{activeModule.moduleNumber} de 0{programModules.length}
              </span>
            </div>
            <div>
              <h2 className="font-serif text-4xl">{activeModule.title}</h2>
              <p className="font-serif text-xl! text-dark!">{activeModule.subtitle}</p>
              <p className="program-panel__description">{activeModule.description}</p>
            </div>
            <div>
              <h3 className="program-panel__subheading">En qué trabajamos</h3>
              <ul className="flex flex-wrap gap-2">
                {activeModule.topics.map((item, index) => (
                  <li className="bg-dark/5 px-4 py-1 rounded-xl border-dark/15 border" key={index}>
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

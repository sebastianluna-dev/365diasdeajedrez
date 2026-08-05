"use client";

import { useState } from "react";
import { programModules } from "@/data/programModules";
import { ProgramModuleListItem } from "./ProgramModuleListItem";
import "./program.css";

export function ProgramSection() {
  const [activeModule, setActiveModule] = useState(programModules[0]);
  return (
    <section id="programa" className="sectionBlock light">
      <div className="sectionInner">
        <div className="sectionHead">
          <div>
            <h2 className="sectionTitle max-w-xl">Un método diseñado para desarrollar un ajedrez sólido.</h2>
            <p className="sectionText">
              Cinco módulos con una progresión natural: desde los principios fundamentales hasta los finales más
              complejos. Cada etapa desarrolla habilidades específicas y prepara el camino para la siguiente.
            </p>
          </div>
        </div>

        <div className="programCardWrap">
          <div className="programList">
            {programModules.map((module) => (
              <ProgramModuleListItem
                key={module.moduleNumber}
                module={module}
                isActive={module.moduleNumber === activeModule.moduleNumber}
                onSelect={() => setActiveModule(module)}
              />
            ))}
          </div>

          <div className="programPanel bg-light-gray">
            <div className="flex gap-2 mb-4">
              <span className="bg-primary px-4 py-1 rounded-full font-semibold">{activeModule.durationLabel}</span>
              <span className="bg-dark/5 px-4 py-1 rounded-full font-semibold border-normal-gray border">
                Módulo 0{activeModule.moduleNumber} de 0{programModules.length}
              </span>
            </div>
            <div>
              <h2 className="font-serif text-4xl">{activeModule.title}</h2>
              <p className="font-serif text-xl! text-dark!">{activeModule.subtitle}</p>
              <p className="">{activeModule.description}</p>
            </div>
            <div>
              <h3>En qué trabajamos</h3>
              <ul className="programTopics flex flex-wrap gap-2">
                {activeModule.topics.map((item, index) => (
                  <li className="bg-dark/5 px-4 py-1 rounded-xl border-dark/15 border" key={index}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="programNote">
          La mitad del programa está dedicada a comprender el juego —fundamentos y medio juego—; la otra mitad, a las
          habilidades técnicas. No buscamos que memorices más movimientos, sino que aprendas a encontrar las mejores
          ideas por ti mismo.
        </p>
      </div>
    </section>
  );
}

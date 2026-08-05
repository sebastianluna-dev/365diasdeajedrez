"use client";

import { useState } from "react";
import Image from "next/image";
import type { Mentor } from "@/interfaces/mentor.interface";
import "./video.section.css";

interface MentorVideoSectionProps {
  mentor: Mentor;
}

export function MentorVideoSection({ mentor }: MentorVideoSectionProps) {
  const [preparing, setPreparing] = useState(false);

  return (
    <section className="mentor-video">
      <div>
        <h2 className="mentor-video__title">Conoce a {mentor.firstName} antes de tu primera clase.</h2>
        <p className="mentor-video__text">
          Dos minutos donde explica cómo trabaja, qué esperar de una sesión y con qué tipo de jugador consigue mejores
          resultados.
        </p>
        <ul className="mentor-video__points">
          <li className="mentor-video__point">
            <span className="mentor-video__point-icon">♟</span> Cómo estructura el plan de trabajo
          </li>
          <li className="mentor-video__point">
            <span className="mentor-video__point-icon">♟</span> Qué se revisa en la clase de diagnóstico
          </li>
          <li className="mentor-video__point">
            <span className="mentor-video__point-icon">♟</span> Ejemplos de alumnos y su progreso
          </li>
        </ul>
      </div>

      <div className="mentor-video__frame">
        <Image
          className="mentor-video__poster"
          src={mentor.photo}
          alt={mentor.name}
          fill
          sizes="(max-width: 1024px) 100vw, 520px"
        />
        <div className="mentor-video__overlay" />
        <button type="button" className="mentor-video__play" onClick={() => setPreparing(true)}>
          <span className="mentor-video__play-icon">▶</span>
          <span className="mentor-video__play-label">
            {preparing ? "Video en preparación — súbelo para reproducirlo" : "Reproducir presentación"}
          </span>
        </button>
        <span className="mentor-video__duration">2:14 min</span>
      </div>
    </section>
  );
}

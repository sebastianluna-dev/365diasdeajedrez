import type { VideoResource } from "@/interfaces/video-resource.interface";

export const videos: VideoResource[] = [
  {
    slug: "evaluar-una-posicion",
    title: "Cómo evaluar una posición en 10 segundos",
    description: "Un método rápido para decidir quién está mejor antes de calcular una sola variante.",
    duration: "4:12 min",
  },
  {
    slug: "anatomia-ataque-al-rey",
    title: "Anatomía de un ataque al rey",
    description: "Las piezas, casillas y tiempos que convierten una ventaja de desarrollo en un ataque real.",
    duration: "6:35 min",
  },
  {
    slug: "errores-medio-juego",
    title: "Los errores más comunes en el medio juego",
    description: "Los tres fallos que más partidas de club deciden, y cómo dejar de cometerlos.",
    duration: "5:08 min",
  },
];

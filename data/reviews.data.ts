import type { Review } from "@/interfaces/review.interface";

export const reviews: Review[] = [
  {
    slug: "mariana-t",
    avatarInitial: "M",
    avatarColor: "teal",
    name: "Mariana T.",
    time: "7:18 PM",
    messages: [
      { text: "Hoy me sacaron de la teoría en la jugada 6" },
      { text: "Antes me daba pánico, pero pensé en la estructura y encontré el plan sola", reacted: true },
      { text: "Terminé ganando un peón y el final fue técnico" },
      { text: "Gracias por insistir tanto en el porqué de cada jugada" },
    ],
    stat: {
      label: "En promedio",
      value: "6 meses",
      text: "tardan nuestros alumnos en dejar de memorizar aperturas y empezar a jugar con plan.",
    },
  },
  {
    slug: "alejandro-g",
    avatarInitial: "A",
    avatarColor: "orange",
    name: "Alejandro G.",
    time: "10:52 AM",
    messages: [
      { text: "Profe, ya jugué el torneo del fin de semana" },
      {
        text: "Gané las dos partidas donde salió la estructura que vimos en clase — supe exactamente qué plan buscar",
        reacted: true,
      },
      { text: "Cerré con 4.5 de 6 y subí 62 puntos de Elo", reacted: true },
      { text: "Llevaba años estancado y por fin siento que entiendo lo que juego" },
    ],
    stat: {
      label: "Hasta",
      value: "+250",
      text: "puntos de Elo ganan nuestros alumnos en su primer año de entrenamiento estructurado.",
    },
  },
  {
    slug: "ricardo-m",
    avatarInitial: "R",
    avatarColor: "gold",
    name: "Ricardo M.",
    time: "9:04 AM",
    messages: [
      { text: "Mi hijo ganó su primer torneo escolar 🏆" },
      { text: "Pasó de mover piezas sin rumbo a explicarme por qué juega cada cosa", reacted: true },
      { text: "Las clases son exigentes pero las espera toda la semana" },
      { text: "Ya quiere ir al estatal, así que seguimos" },
    ],
    stat: {
      label: "Más de",
      value: "2000",
      text: "clases impartidas a jugadores de todos los niveles, desde principiantes hasta torneo.",
    },
  },
];

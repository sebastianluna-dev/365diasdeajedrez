import type { Review } from "@/interfaces/review.interface";

export const reviews: Review[] = [
  {
    slug: "mariana-t",
    avatarInitial: "M",
    name: "Mariana T.",
    time: "7:18 PM",
    messagesBeforeReaction: [
      "Hoy me sacaron de la teoría en la jugada 6",
      "Antes me daba pánico, pero pensé en la estructura y encontré el plan sola",
    ],
    reactionCount: 1,
    messagesAfterReaction: [
      "Terminé ganando un peón y el final fue técnico",
      "Gracias por insistir tanto en el porqué de cada jugada",
    ],
    stat: {
      label: "En promedio",
      value: "6 meses",
      text: "tardan nuestros alumnos en dejar de memorizar aperturas y empezar a jugar con plan.",
    },
  },
];

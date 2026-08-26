import type { Block } from "payload";

export const ChessGameBlock: Block = {
  slug: "chessGameBlock",
  interfaceName: "ChessGameBlock",
  labels: {
    singular: "Partida de ajedrez",
    plural: "Partidas de ajedrez",
  },
  fields: [
    {
      name: "pgn",
      type: "textarea",
      required: true,
      admin: {
        description: "Partida completa en notación PGN.",
      },
    },
    {
      name: "title",
      type: "text",
    },
    {
      name: "players",
      type: "text",
    },
    {
      name: "event",
      type: "text",
    },
    {
      name: "date",
      type: "date",
    },
  ],
};

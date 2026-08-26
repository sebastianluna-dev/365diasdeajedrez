import type { Block } from "payload";

export const ChessDiagramBlock: Block = {
  slug: "chessDiagramBlock",
  interfaceName: "ChessDiagramBlock",
  labels: {
    singular: "Diagrama de ajedrez",
    plural: "Diagramas de ajedrez",
  },
  fields: [
    {
      name: "fen",
      type: "text",
      required: true,
      admin: {
        description: "Posición en notación FEN.",
      },
    },
    {
      name: "caption",
      type: "text",
    },
    {
      name: "orientation",
      type: "select",
      required: true,
      defaultValue: "white",
      options: [
        { label: "Blancas abajo", value: "white" },
        { label: "Negras abajo", value: "black" },
      ],
    },
  ],
};

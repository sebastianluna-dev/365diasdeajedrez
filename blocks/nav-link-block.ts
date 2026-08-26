import type { Block } from "payload";

export const NavLinkBlock: Block = {
  slug: "navLink",
  interfaceName: "NavLinkBlock",
  labels: {
    singular: "Enlace",
    plural: "Enlaces",
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "label",
          type: "text",
          label: "Texto",
          required: true,
          admin: { width: "50%" },
        },
        {
          name: "href",
          type: "text",
          label: "Destino",
          required: true,
          admin: { width: "50%" },
        },
      ],
    },
  ],
};

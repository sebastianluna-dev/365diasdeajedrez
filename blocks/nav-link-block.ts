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
      name: "label",
      type: "text",
      label: "Texto",
      required: true,
    },
    {
      name: "href",
      type: "text",
      label: "Destino",
      required: true,
    },
  ],
};

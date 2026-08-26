import type { Block } from "payload";

export const NavDropdownBlock: Block = {
  slug: "navDropdown",
  interfaceName: "NavDropdownBlock",
  labels: {
    singular: "Menú desplegable",
    plural: "Menús desplegables",
  },
  fields: [
    {
      name: "label",
      type: "text",
      label: "Texto del menú",
      required: true,
    },
    {
      name: "links",
      type: "array",
      label: "Enlaces del menú",
      required: true,
      minRows: 1,
      labels: {
        singular: "Enlace",
        plural: "Enlaces",
      },
      fields: [
        { name: "label", type: "text", label: "Texto", required: true },
        { name: "href", type: "text", label: "Destino", required: true },
      ],
    },
  ],
};

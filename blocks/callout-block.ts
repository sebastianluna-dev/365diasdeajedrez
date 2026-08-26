import type { Block } from "payload";

export const CalloutBlock: Block = {
  slug: "calloutBlock",
  interfaceName: "CalloutBlock",
  labels: {
    singular: "Aviso destacado",
    plural: "Avisos destacados",
  },
  fields: [
    {
      name: "title",
      type: "text",
    },
    {
      name: "content",
      type: "textarea",
      required: true,
    },
    {
      name: "type",
      type: "select",
      required: true,
      defaultValue: "info",
      options: [
        { label: "Info", value: "info" },
        { label: "Tip", value: "tip" },
        { label: "Advertencia", value: "warning" },
      ],
    },
  ],
};

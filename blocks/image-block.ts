import type { Block } from "payload";

export const ImageBlock: Block = {
  slug: "imageBlock",
  interfaceName: "ImageBlock",
  labels: {
    singular: "Imagen",
    plural: "Imágenes",
  },
  fields: [
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "caption",
      type: "text",
    },
  ],
};

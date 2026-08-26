import type { GlobalConfig } from "payload";
import { anyone, isAdminOrEditor } from "@/lib/payload/access";
import { revalidateHome } from "@/lib/payload/revalidate-home";

export const HomeHero: GlobalConfig = {
  slug: "home-hero",
  label: "Hero",
  admin: {
    group: "Home",
  },
  access: {
    read: anyone,
    update: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateHome],
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Título (H1)",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
      label: "Descripción",
      required: true,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Imagen",
      required: true,
    },
    {
      name: "cta",
      type: "group",
      label: "Botón principal",
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
    },
  ],
};

import type { GlobalConfig } from "payload";
import { anyone, isAdminOrEditor } from "@/lib/payload/access";
import { revalidateHome } from "@/lib/payload/revalidate-home";

export const HomeCta: GlobalConfig = {
  slug: "home-cta",
  label: "CTA flotante",
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
      label: "Título",
      required: true,
    },
    {
      name: "subtitle",
      type: "text",
      label: "Subtítulo",
      required: true,
    },
    {
      name: "ctaLabel",
      type: "text",
      label: "Texto del botón",
      required: true,
    },
  ],
};

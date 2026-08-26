import type { GlobalConfig } from "payload";
import { anyone, isAdminOrEditor } from "@/lib/payload/access";
import { revalidateHome } from "@/lib/payload/revalidate-home";

export const HomeHeader: GlobalConfig = {
  slug: "home-header",
  label: "Header",
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
      name: "ctaLabel",
      type: "text",
      label: "Texto del botón",
      required: true,
    },
  ],
};

import type { GlobalConfig } from "payload";
import { anyone, isAdminOrEditor } from "@/lib/payload/access";
import { revalidateHeader } from "@/lib/payload/revalidate-header";
import { NavLinkBlock } from "@/payload/blocks/nav-link-block";
import { NavDropdownBlock } from "@/payload/blocks/nav-dropdown-block";

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
    afterChange: [revalidateHeader],
  },
  fields: [
    {
      name: "navItems",
      type: "blocks",
      label: "Enlaces de navegación",
      labels: {
        singular: "Elemento",
        plural: "Elementos",
      },
      blocks: [NavLinkBlock, NavDropdownBlock],
    },
    {
      name: "ctaLabel",
      type: "text",
      label: "Texto del botón",
      required: true,
    },
  ],
};

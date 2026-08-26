import type { CollectionConfig } from "payload";
import { anyone, isAdminOrEditor } from "@/lib/payload/access";

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "alt",
    group: "Blog",
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  upload: {
    mimeTypes: ["image/*"],
  },
  fields: [
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

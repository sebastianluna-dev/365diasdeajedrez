import type { CollectionConfig } from "payload";
import { anyone, isAdminOrEditor } from "@/lib/payload/access";
import { slugField } from "@/lib/payload/slug-field";

export const Tags: CollectionConfig = {
  slug: "tags",
  admin: {
    useAsTitle: "name",
    group: "Blog",
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    slugField("name"),
  ],
};

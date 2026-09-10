import type { CollectionConfig } from "payload";
import { isAdmin, isAdminFieldAccess, isAdminOrSelf } from "@/lib/payload/access";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    group: "Administración",
  },
  access: {
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "authorTitle",
      type: "text",
      label: "Título público (autor de blog)",
      admin: {
        description: "Ej: \"Instructor\". Se muestra junto al nombre en los artículos del blog.",
      },
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "admin",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      access: {
        // Only an admin can change roles — an editor can't promote themselves.
        update: isAdminFieldAccess,
      },
    },
  ],
};

import type { GlobalConfig } from "payload";
import { anyone, isAdminOrEditor } from "@/lib/payload/access";
import { revalidateHome } from "@/lib/payload/revalidate-home";

export const HomeProgram: GlobalConfig = {
  slug: "home-program",
  label: "Programa",
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
      name: "sectionTitle",
      type: "text",
      label: "Título de la sección",
      required: true,
    },
    {
      name: "sectionDescription",
      type: "textarea",
      label: "Descripción de la sección",
      required: true,
    },
    {
      name: "note",
      type: "textarea",
      label: "Nota final",
    },
    {
      name: "modules",
      type: "array",
      label: "Módulos",
      required: true,
      minRows: 1,
      labels: {
        singular: "Módulo",
        plural: "Módulos",
      },
      fields: [
        {
          name: "title",
          type: "text",
          label: "Título",
          required: true,
        },
        {
          name: "durationLabel",
          type: "text",
          label: "Duración",
          required: true,
        },
        {
          name: "subtitle",
          type: "text",
          label: "Subtítulo",
        },
        {
          name: "description",
          type: "textarea",
          label: "Descripción",
          required: true,
        },
        {
          name: "topics",
          type: "array",
          label: "Temas",
          labels: {
            singular: "Tema",
            plural: "Temas",
          },
          fields: [
            {
              name: "text",
              type: "text",
              label: "Texto",
              required: true,
            },
          ],
        },
      ],
    },
  ],
};

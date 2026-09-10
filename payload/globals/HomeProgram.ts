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
      name: "topicsHeading",
      type: "text",
      label: "Encabezado de temas",
      required: true,
      admin: {
        description: "Título que aparece sobre la lista de temas de cada módulo (ej. \"En qué trabajamos\").",
      },
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
          type: "row",
          fields: [
            {
              name: "title",
              type: "text",
              label: "Título",
              required: true,
              admin: { width: "50%" },
            },
            {
              name: "durationLabel",
              type: "text",
              label: "Duración",
              required: true,
              admin: { width: "50%" },
            },
            {
              name: "subtitle",
              type: "text",
              label: "Subtítulo",
              admin: { width: "50%" },
            },
          ],
        },
        {
          name: "description",
          type: "textarea",
          label: "Descripción",
          required: true,
        },
        {
          name: "topics",
          type: "text",
          label: "Temas",
          hasMany: true,
          admin: {
            description: "Escribe un tema y presiona Enter para agregarlo a la lista.",
          },
        },
      ],
    },
  ],
};

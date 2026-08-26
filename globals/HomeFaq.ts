import type { GlobalConfig } from "payload";
import { anyone, isAdminOrEditor } from "@/lib/payload/access";
import { revalidateHome } from "@/lib/payload/revalidate-home";

export const HomeFaq: GlobalConfig = {
  slug: "home-faq",
  label: "Preguntas frecuentes",
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
      name: "eyebrow",
      type: "text",
      label: "Texto pequeño superior",
      required: true,
    },
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
      name: "ctaLabel",
      type: "text",
      label: "Texto del botón",
      required: true,
    },
    {
      name: "questions",
      type: "array",
      label: "Preguntas",
      required: true,
      minRows: 1,
      labels: { singular: "Pregunta", plural: "Preguntas" },
      fields: [
        { name: "question", type: "text", label: "Pregunta", required: true },
        { name: "answer", type: "textarea", label: "Respuesta", required: true },
      ],
    },
  ],
};

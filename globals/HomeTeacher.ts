import type { GlobalConfig } from "payload";
import { anyone, isAdminOrEditor } from "@/lib/payload/access";
import { revalidateHome } from "@/lib/payload/revalidate-home";

export const HomeTeacher: GlobalConfig = {
  slug: "home-teacher",
  label: "Maestro",
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
      type: "tabs",
      tabs: [
        {
          label: "Información",
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "eyebrow",
                  type: "text",
                  label: "Texto pequeño superior",
                  required: true,
                  admin: { width: "50%" },
                },
                {
                  name: "name",
                  type: "text",
                  label: "Nombre",
                  required: true,
                  admin: { width: "50%" },
                },
                {
                  name: "badge",
                  type: "text",
                  label: "Insignia",
                  required: true,
                  admin: { width: "50%" },
                },
              ],
            },
            {
              name: "summary",
              type: "textarea",
              label: "Resumen",
              required: true,
            },
            {
              name: "photo",
              type: "upload",
              relationTo: "media",
              label: "Foto",
              required: true,
            },
            {
              name: "ctaLabel",
              type: "text",
              label: "Texto del botón",
              required: true,
            },
          ],
        },
        {
          label: "Estadísticas",
          fields: [
            {
              name: "stats",
              type: "array",
              label: "Estadísticas",
              required: true,
              minRows: 1,
              labels: { singular: "Estadística", plural: "Estadísticas" },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "value", type: "text", label: "Valor", required: true, admin: { width: "50%" } },
                    { name: "label", type: "text", label: "Etiqueta", required: true, admin: { width: "50%" } },
                  ],
                },
              ],
            },
            {
              name: "eloLabel",
              type: "text",
              label: "Texto antes de la tabla de Elo",
              required: true,
            },
            {
              name: "eloRatings",
              type: "array",
              label: "Ratings de Elo",
              required: true,
              minRows: 1,
              labels: { singular: "Rating", plural: "Ratings" },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "label", type: "text", label: "Modalidad", required: true, admin: { width: "50%" } },
                    { name: "value", type: "number", label: "Puntos", required: true, admin: { width: "50%" } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Partida",
          fields: [
            {
              name: "game",
              type: "group",
              label: "Partida destacada",
              fields: [
                {
                  name: "title",
                  type: "text",
                  label: "Título",
                  required: true,
                },
                {
                  name: "paragraphs",
                  type: "array",
                  label: "Párrafos",
                  required: true,
                  minRows: 1,
                  labels: { singular: "Párrafo", plural: "Párrafos" },
                  fields: [{ name: "text", type: "textarea", label: "Texto", required: true }],
                },
                {
                  name: "moves",
                  type: "textarea",
                  label: "Jugadas (SAN separadas por espacio)",
                  required: true,
                  admin: {
                    description: 'Ej: "e4 c6 d4 d5 exd5 cxd5..." — sin números de jugada.',
                  },
                },
                {
                  name: "flipBoard",
                  type: "checkbox",
                  label: "Mostrar tablero desde el lado de las negras",
                  defaultValue: false,
                },
                {
                  name: "annotations",
                  type: "json",
                  label: "Anotaciones de calidad por jugada (opcional)",
                  admin: {
                    description:
                      'Mapa opcional generado por análisis de motor, ej: { "8b": "best", "13w": "mistake" }.',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

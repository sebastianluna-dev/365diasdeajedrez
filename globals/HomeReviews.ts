import type { GlobalConfig } from "payload";
import { anyone, isAdminOrEditor } from "@/lib/payload/access";
import { revalidateHome } from "@/lib/payload/revalidate-home";

export const HomeReviews: GlobalConfig = {
  slug: "home-reviews",
  label: "Reseñas",
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
      name: "reviews",
      type: "array",
      label: "Reseñas",
      required: true,
      minRows: 1,
      labels: { singular: "Reseña", plural: "Reseñas" },
      fields: [
        {
          type: "row",
          fields: [
            { name: "name", type: "text", label: "Nombre", required: true, admin: { width: "50%" } },
            { name: "time", type: "text", label: "Hora", required: true, admin: { width: "50%" } },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "avatarInitial",
              type: "text",
              label: "Inicial del avatar",
              required: true,
              maxLength: 1,
              admin: { width: "50%" },
            },
            {
              name: "avatarColor",
              type: "select",
              label: "Color del avatar",
              required: true,
              admin: { width: "50%" },
              options: [
                { label: "Verde azulado", value: "teal" },
                { label: "Naranja", value: "orange" },
                { label: "Dorado", value: "gold" },
              ],
            },
          ],
        },
        {
          name: "messages",
          type: "array",
          label: "Mensajes del chat",
          required: true,
          minRows: 1,
          labels: { singular: "Mensaje", plural: "Mensajes" },
          fields: [
            {
              type: "row",
              fields: [
                { name: "text", type: "text", label: "Texto", required: true, admin: { width: "50%" } },
                {
                  name: "reacted",
                  type: "checkbox",
                  label: "Con reacción destacada",
                  defaultValue: false,
                  admin: { width: "50%" },
                },
              ],
            },
          ],
        },
        {
          name: "stat",
          type: "group",
          label: "Estadística destacada",
          fields: [
            {
              type: "row",
              fields: [
                { name: "label", type: "text", label: "Etiqueta", required: true, admin: { width: "50%" } },
                { name: "value", type: "text", label: "Valor", required: true, admin: { width: "50%" } },
              ],
            },
            { name: "text", type: "textarea", label: "Texto", required: true },
          ],
        },
      ],
    },
  ],
};

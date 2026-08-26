import type { Field, GlobalConfig } from "payload";
import { anyone, isAdminOrEditor } from "@/lib/payload/access";
import { revalidateHome } from "@/lib/payload/revalidate-home";

const shortFideTitleOptions = [
  { label: "GM", value: "GM" },
  { label: "IM", value: "IM" },
  { label: "FM", value: "FM" },
  { label: "CM", value: "CM" },
  { label: "NM", value: "NM" },
  { label: "WGM", value: "WGM" },
  { label: "WIM", value: "WIM" },
  { label: "WFM", value: "WFM" },
  { label: "WCM", value: "WCM" },
  { label: "WNM", value: "WNM" },
];

const longFideTitleOptions = [
  { label: "Grandmaster", value: "Grandmaster" },
  { label: "International Master", value: "International Master" },
  { label: "FIDE Master", value: "FIDE Master" },
  { label: "Candidate Master", value: "Candidate Master" },
  { label: "National Master", value: "National Master" },
  { label: "Woman Grandmaster", value: "Woman Grandmaster" },
  { label: "Woman International Master", value: "Woman International Master" },
  { label: "Woman FIDE Master", value: "Woman FIDE Master" },
  { label: "Woman Candidate Master", value: "Woman Candidate Master" },
  { label: "Woman National Master", value: "Woman National Master" },
  { label: "Instructor · Jugador federado FIDE", value: "Instructor · Jugador federado FIDE" },
];

function mentorFields(): Field[] {
  return [
    {
      type: "tabs",
      tabs: [
        {
          label: "Información",
          fields: [
            {
              type: "row",
              fields: [
                { name: "slug", type: "text", label: "Slug", required: true, admin: { width: "50%" } },
                { name: "name", type: "text", label: "Nombre", required: true, admin: { width: "50%" } },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "lastName", type: "text", label: "Apellido", required: true, admin: { width: "50%" } },
                { name: "city", type: "text", label: "Ciudad", required: true, admin: { width: "50%" } },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "birthYear", type: "number", label: "Año de nacimiento", required: true, admin: { width: "50%" } },
                {
                  name: "gender",
                  type: "select",
                  label: "Género",
                  required: true,
                  admin: { width: "50%" },
                  options: [
                    { label: "Masculino", value: "male" },
                    { label: "Femenino", value: "female" },
                  ],
                },
              ],
            },
            {
              name: "photo",
              type: "upload",
              relationTo: "media",
              label: "Foto",
              required: true,
            },
            {
              name: "photoFocus",
              type: "text",
              label: "Enfoque de la foto",
              admin: {
                description: "Posición del recorte de la foto en formato CSS object-position, ej: \"80% 20%\".",
              },
            },
            {
              name: "shortDescription",
              type: "text",
              label: "Descripción corta (tarjeta)",
              required: true,
            },
            {
              name: "summary",
              type: "textarea",
              label: "Resumen",
              required: true,
            },
          ],
        },
        {
          label: "FIDE",
          fields: [
            {
              type: "row",
              fields: [
                { name: "fideId", type: "text", label: "ID FIDE", required: true, admin: { width: "50%" } },
                { name: "federation", type: "text", label: "Federación", required: true, admin: { width: "50%" } },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "standardElo", type: "number", label: "Elo estándar", required: true, admin: { width: "50%" } },
                { name: "rapidElo", type: "number", label: "Elo rápidas", required: true, admin: { width: "50%" } },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "blitzElo", type: "number", label: "Elo blitz", required: true, admin: { width: "50%" } },
                { name: "chessComElo", type: "number", label: "Elo Chess.com (opcional)", admin: { width: "50%" } },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "shortFideTitle",
                  type: "select",
                  label: "Título FIDE (corto)",
                  options: shortFideTitleOptions,
                  admin: { width: "50%" },
                },
                {
                  name: "longFideTitle",
                  type: "select",
                  label: "Título FIDE (largo)",
                  options: longFideTitleOptions,
                  admin: { width: "50%" },
                },
              ],
            },
          ],
        },
        {
          label: "Logros",
          fields: [
            {
              name: "achievements",
              type: "array",
              label: "Logros",
              labels: { singular: "Logro", plural: "Logros" },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "year", type: "text", label: "Año", required: true, admin: { width: "50%" } },
                    { name: "title", type: "text", label: "Título", required: true, admin: { width: "50%" } },
                  ],
                },
                { name: "text", type: "textarea", label: "Texto", required: true },
              ],
            },
          ],
        },
        {
          label: "Testimonios",
          fields: [
            {
              name: "testimonials",
              type: "array",
              label: "Testimonios",
              labels: { singular: "Testimonio", plural: "Testimonios" },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "name", type: "text", label: "Nombre", required: true, admin: { width: "50%" } },
                    { name: "detail", type: "text", label: "Detalle", required: true, admin: { width: "50%" } },
                  ],
                },
                { name: "text", type: "textarea", label: "Texto", required: true },
              ],
            },
          ],
        },
        {
          label: "Partida",
          fields: [
            {
              name: "featuredGame",
              type: "group",
              label: "Partida destacada",
              fields: [
                { name: "gameTitle", type: "text", label: "Título", required: true },
                { name: "gameText", type: "textarea", label: "Texto", required: true },
                { name: "gameNote", type: "textarea", label: "Nota", required: true },
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
              ],
            },
          ],
        },
      ],
    },
  ];
}

export const HomeMentors: GlobalConfig = {
  slug: "home-mentors",
  label: "Mentores",
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
      name: "mentors",
      type: "array",
      label: "Mentores",
      required: true,
      minRows: 1,
      labels: { singular: "Mentor", plural: "Mentores" },
      fields: mentorFields(),
    },
  ],
};

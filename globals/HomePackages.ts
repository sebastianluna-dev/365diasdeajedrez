import type { Field, GlobalConfig } from "payload";
import { anyone, isAdminOrEditor } from "@/lib/payload/access";
import { revalidateHome } from "@/lib/payload/revalidate-home";

function packageFields(): Field[] {
  return [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", label: "Nombre", required: true, admin: { width: "50%" } },
        { name: "price", type: "number", label: "Precio", required: true, admin: { width: "50%" } },
        { name: "previousPrice", type: "number", label: "Precio anterior (opcional)", admin: { width: "50%" } },
        { name: "discountPercent", type: "number", label: "% de descuento (opcional)", admin: { width: "50%" } },
        { name: "currency", type: "text", label: "Moneda", required: true, admin: { width: "50%" } },
        { name: "period", type: "text", label: "Periodo", required: true, admin: { width: "50%" } },
      ],
    },
    { name: "description", type: "textarea", label: "Descripción", required: true },
    {
      name: "features",
      type: "text",
      label: "Características",
      hasMany: true,
      required: true,
      admin: {
        description: "Escribe una característica y presiona Enter para agregarla a la lista.",
      },
    },
    {
      type: "row",
      fields: [
        { name: "ctaLabel", type: "text", label: "Texto del botón", required: true, admin: { width: "50%" } },
        {
          name: "ctaUrl",
          type: "text",
          label: "URL del botón",
          required: true,
          admin: {
            width: "50%",
            description: "Enlace al que lleva el botón del plan (WhatsApp, PayPal, etc.).",
          },
        },
        { name: "featured", type: "checkbox", label: "Destacado", defaultValue: false, admin: { width: "50%" } },
      ],
    },
  ];
}

export const HomePackages: GlobalConfig = {
  slug: "home-packages",
  label: "Paquetes",
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
      type: "tabs",
      tabs: [
        {
          label: "Plan 1",
          fields: [{ name: "packageOne", type: "group", label: "Plan 1", fields: packageFields() }],
        },
        {
          label: "Plan 2",
          fields: [{ name: "packageTwo", type: "group", label: "Plan 2", fields: packageFields() }],
        },
      ],
    },
  ],
};

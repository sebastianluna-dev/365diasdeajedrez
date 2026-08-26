import type { Field, GlobalConfig } from "payload";
import { anyone, isAdminOrEditor } from "@/lib/payload/access";
import { revalidateHome } from "@/lib/payload/revalidate-home";

function packageFields(): Field[] {
  return [
    { name: "name", type: "text", label: "Nombre", required: true },
    { name: "price", type: "number", label: "Precio", required: true },
    { name: "previousPrice", type: "number", label: "Precio anterior (opcional)" },
    { name: "discountPercent", type: "number", label: "% de descuento (opcional)" },
    { name: "currency", type: "text", label: "Moneda", required: true },
    { name: "period", type: "text", label: "Periodo", required: true },
    { name: "description", type: "textarea", label: "Descripción", required: true },
    {
      name: "features",
      type: "array",
      label: "Características",
      required: true,
      minRows: 1,
      labels: { singular: "Característica", plural: "Características" },
      fields: [{ name: "text", type: "text", label: "Texto", required: true }],
    },
    { name: "ctaLabel", type: "text", label: "Texto del botón", required: true },
    { name: "featured", type: "checkbox", label: "Destacado", defaultValue: false },
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

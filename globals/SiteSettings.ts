import type { GlobalConfig } from "payload";
import { anyone, isAdminOrEditor } from "@/lib/payload/access";
import { revalidateSiteSettings } from "@/lib/payload/revalidate-site-settings";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Contacto",
  access: {
    read: anyone,
    update: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "whatsappCountryCode",
          type: "select",
          label: "Código de país",
          required: true,
          defaultValue: "52",
          options: [
            { label: "México (+52)", value: "52" },
            { label: "Estados Unidos / Canadá (+1)", value: "1" },
            { label: "España (+34)", value: "34" },
            { label: "Guatemala (+502)", value: "502" },
            { label: "Honduras (+504)", value: "504" },
            { label: "El Salvador (+503)", value: "503" },
            { label: "Nicaragua (+505)", value: "505" },
            { label: "Costa Rica (+506)", value: "506" },
            { label: "Panamá (+507)", value: "507" },
            { label: "Colombia (+57)", value: "57" },
            { label: "Venezuela (+58)", value: "58" },
            { label: "Ecuador (+593)", value: "593" },
            { label: "Perú (+51)", value: "51" },
            { label: "Bolivia (+591)", value: "591" },
            { label: "Chile (+56)", value: "56" },
            { label: "Argentina (+54)", value: "54" },
            { label: "Uruguay (+598)", value: "598" },
            { label: "Paraguay (+595)", value: "595" },
          ],
        },
        {
          name: "whatsappLocalNumber",
          type: "text",
          label: "Número (sin código de país)",
          required: true,
          admin: {
            description: "Solo dígitos, sin espacios ni guiones. Ejemplo: 2291348338",
          },
        },
      ],
    },
    {
      name: "whatsappDefaultMessage",
      type: "textarea",
      label: "Mensaje por defecto de WhatsApp",
      required: true,
      admin: {
        description: "Mensaje precargado al abrir WhatsApp desde el pie de página, el CTA flotante y las preguntas frecuentes.",
      },
    },
  ],
};

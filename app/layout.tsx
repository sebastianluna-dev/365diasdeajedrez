import type { Metadata } from "next";
import "./globals.css";
import { gramatika, suisseIntl } from "@/app/fonts";

export const metadata: Metadata = {
  title: "365 Días de Ajedrez | Academia de ajedrez",
  description:
    "Academia de ajedrez en línea con un método progresivo, cursos personalizados y seguimiento para mejorar tu juego.",
  keywords: ["ajedrez", "academia", "entrenamiento", "clases de ajedrez"],
  openGraph: {
    title: "365 Días de Ajedrez",
    description:
      "Un método progresivo para mejorar tu ajedrez con clases guiadas, seguimiento y recursos de estudio.",
    type: "website",
    locale: "es_MX",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${gramatika.variable} ${suisseIntl.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#16110d] text-[#f2ede7]">{children}</body>
    </html>
  );
}

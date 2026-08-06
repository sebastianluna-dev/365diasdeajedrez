import type { Metadata } from "next";
import { SiteHeader } from "@/components/sections/common/site-header.comp";
import { LegalPageSection } from "@/components/sections/legal/legal-page.section";
import { Footer } from "@/components/sections/common/footer.comp";
import type { LegalPageContent } from "@/interfaces/legal-page.interface";
import "./aviso-de-privacidad-page.css";

export const metadata: Metadata = {
  title: "Aviso de privacidad | 365 Días de Ajedrez",
  description:
    "365DiasDeAjedrez trata los datos personales de sus alumnos y visitantes con el único fin de prestar el servicio de clases y de mantener contacto con quienes lo solicitan.",
};

const content: LegalPageContent = {
  title: "Aviso de privacidad",
  intro:
    "365DiasDeAjedrez trata los datos personales de sus alumnos y visitantes con el único fin de prestar el servicio de clases y de mantener contacto con quienes lo solicitan.",
  updatedLabel: "Última actualización: agosto de 2026",
  cards: [
    {
      id: "datos",
      title: "Datos que recabamos",
      paragraphs: [
        "Nombre, correo electrónico, número de teléfono y, cuando el alumno lo comparte, su nivel de juego, usuario en plataformas de ajedrez e identificador FIDE.",
        "No solicitamos datos sensibles ni información financiera fuera de la necesaria para procesar el pago de las clases.",
      ],
    },
    {
      id: "uso",
      title: "Para qué los usamos",
      items: [
        "Agendar, impartir y dar seguimiento a las clases.",
        "Elaborar el plan de estudio y registrar el progreso del alumno.",
        "Enviar material de apoyo y avisos relacionados con el servicio.",
        "Emitir comprobantes y llevar el control administrativo de los pagos.",
      ],
    },
    {
      title: "Con quién se comparten",
      paragraphs: [
        "No vendemos ni cedemos datos personales a terceros. Solo se comparten con los proveedores que hacen posible el servicio: plataformas de videollamada, procesadores de pago y servicios de correo.",
        "Cada proveedor accede únicamente a la información mínima necesaria para su función.",
      ],
    },
    {
      id: "derechos",
      title: "Tus derechos",
      highlighted: true,
      paragraphs: [
        "Puedes solicitar en cualquier momento el acceso, la rectificación, la cancelación de tus datos o la oposición a su uso, así como revocar el consentimiento que nos otorgaste.",
      ],
      action: { label: "contacto@365diasdeajedrez.com", href: "mailto:contacto@365diasdeajedrez.com" },
    },
  ],
  closing: {
    title: "Conservación, seguridad y cambios",
    paragraphs: [
      "Conservamos los datos mientras exista una relación activa con el alumno y durante el plazo que exijan las obligaciones fiscales aplicables. Aplicamos medidas razonables de seguridad para evitar accesos no autorizados.",
      "Si este aviso cambia, publicaremos la versión actualizada en esta misma página con su fecha correspondiente.",
    ],
  },
};

export default function AvisoDePrivacidadPage() {
  return (
    <div className="aviso-de-privacidad-page">
      <SiteHeader />
      <LegalPageSection {...content} />
      <Footer />
    </div>
  );
}

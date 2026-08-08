import type { Metadata } from "next";
import { SiteHeader } from "@/components/sections/common/site-header.section";
import { LegalPageSection } from "@/components/sections/legal/legal-page.section";
import { Footer } from "@/components/sections/common/footer.section";
import type { LegalPageContent } from "@/interfaces/legal-page.interface";
import "./terminos-y-condiciones-page.css";

export const metadata: Metadata = {
  title: "Términos y condiciones | 365 Días de Ajedrez",
  description:
    "Estas condiciones regulan la contratación de clases y el uso del sitio de 365DiasDeAjedrez. Al reservar una clase o suscribirte a un plan, aceptas lo aquí descrito.",
};

const content: LegalPageContent = {
  title: "Términos y condiciones",
  intro:
    "Estas condiciones regulan la contratación de clases y el uso del sitio de 365DiasDeAjedrez. Al reservar una clase o suscribirte a un plan, aceptas lo aquí descrito.",
  updatedLabel: "Última actualización: agosto de 2026",
  cards: [
    {
      id: "servicio",
      title: "El servicio",
      paragraphs: [
        "Ofrecemos clases de ajedrez en línea, individuales y en vivo, impartidas por los instructores de la academia mediante videollamada con tablero compartido.",
        "Cada plan indica el número de clases incluidas al mes y su duración. El material de apoyo que entregamos es para uso personal del alumno.",
      ],
    },
    {
      title: "Reservas y puntualidad",
      paragraphs: [
        "Las clases se agendan de común acuerdo entre alumno e instructor. Recomendamos conectarse unos minutos antes para aprovechar la sesión completa.",
        "Si el alumno se retrasa, la clase termina a la hora prevista. Si el instructor no puede impartirla, se reprograma sin costo.",
      ],
    },
    {
      title: "Cancelaciones y reprogramación",
      paragraphs: [
        "Puedes reprogramar una clase avisando con al menos 24 horas de anticipación. Con menos aviso, la sesión se considera impartida.",
        "Las clases no utilizadas dentro del mes contratado no se acumulan al mes siguiente, salvo acuerdo expreso con la academia.",
      ],
    },
    {
      id: "pagos",
      title: "Pagos",
      paragraphs: [
        "Los planes se pagan por adelantado al inicio de cada periodo mensual. Los precios están expresados en pesos mexicanos.",
        "Un plan puede cancelarse en cualquier momento; la baja aplica al terminar el periodo ya pagado y no genera reembolsos parciales.",
      ],
    },
    {
      title: "Conducta y uso del material",
      paragraphs: [
        "Esperamos respeto entre alumnos e instructores. La academia puede terminar la relación ante conductas ofensivas o que impidan el desarrollo normal de las clases.",
        "El contenido del sitio, el material de estudio y las grabaciones son propiedad de 365DiasDeAjedrez y no pueden redistribuirse ni comercializarse sin autorización.",
      ],
    },
    {
      title: "Dudas sobre estas condiciones",
      highlighted: true,
      paragraphs: ["Si algo no queda claro antes de contratar, escríbenos y lo resolvemos contigo."],
      action: { label: "contacto@365diasdeajedrez.com", href: "mailto:contacto@365diasdeajedrez.com" },
    },
  ],
  closing: {
    title: "Cambios en los términos",
    paragraphs: [
      "Podemos actualizar estas condiciones para reflejar cambios en el servicio o en los planes. La versión vigente será siempre la publicada en esta página, con su fecha de actualización.",
    ],
  },
};

export default function TerminosYCondicionesPage() {
  return (
    <div className="terminos-y-condiciones-page">
      <SiteHeader />
      <LegalPageSection {...content} />
      <Footer />
    </div>
  );
}

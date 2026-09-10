import { ImageResponse } from "next/og";

// Imagen Open Graph por defecto del sitio público, generada en el build. Se
// dibuja con código y no con una foto porque así no depende de ningún archivo
// en public/ ni de Cloudinary, y cambia con el texto. Las páginas que tienen
// imagen propia (los artículos) la sustituyen desde su `generateMetadata`.
//
// `ImageResponse` no lee woff2, y las fuentes del sitio sólo existen en ese
// formato; se usa la fuente por defecto del generador. Sólo texto latino: un
// glifo de pieza (♞) obligaba al generador a descargar una fuente en el build.

export const alt = "365 Días de Ajedrez, academia de ajedrez en línea";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "linear-gradient(135deg, #16110d 0%, #2b2118 100%)",
        color: "#f2ede7",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "#ff9143",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#16110d",
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          365
        </div>
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase", color: "#aca7a3" }}>
          365 Días de Ajedrez
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, maxWidth: 980 }}>
          Un método progresivo para mejorar tu ajedrez
        </div>
        <div style={{ fontSize: 32, color: "#aca7a3" }}>Clases guiadas, seguimiento y recursos de estudio</div>
      </div>
      <div style={{ height: 8, width: 220, background: "#ff9143", borderRadius: 4 }} />
    </div>,
    size,
  );
}

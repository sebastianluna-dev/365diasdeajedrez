"use client";

// Last resort: only used when the root layout of one of the three areas
// itself fails, so it has to bring its own `<html>` and `<body>` and cannot
// rely on any stylesheet being loaded. That is why it uses inline styles.
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#16110d",
          color: "#f2ede7",
          fontFamily: "Arial, sans-serif",
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        <div style={{ maxWidth: 560 }}>
          <h1 style={{ fontSize: 32, margin: "0 0 12px" }}>Algo salió mal</h1>
          <p style={{ margin: "0 0 24px", color: "#aca7a3", lineHeight: 1.6 }}>
            {error.digest ? `Código del error: ${error.digest}` : "Inténtalo de nuevo en un momento."}
          </p>
          <button
            type="button"
            onClick={retry}
            style={{
              padding: "12px 22px",
              border: 0,
              borderRadius: 999,
              background: "#ff9143",
              color: "#16110d",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}

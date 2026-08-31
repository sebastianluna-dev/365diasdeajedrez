import "./platform-notice.comp.css";

interface PlatformNoticeProps {
  message: string;
  variant?: "error" | "success" | "info";
}

/**
 * Aviso de resultado de una acción. Los formularios de la plataforma son
 * `<form action={serverAction}>` y devuelven el fallo por redirect con
 * `?error=<code>`; la página traduce el code con su mapa de mensajes y lo pinta
 * aquí. `role="alert"` para que un lector de pantalla lo anuncie al volver.
 */
export function PlatformNotice({ message, variant = "error" }: PlatformNoticeProps) {
  return (
    <p className={`platform-notice platform-notice_variant_${variant}`} role="alert">
      {message}
    </p>
  );
}

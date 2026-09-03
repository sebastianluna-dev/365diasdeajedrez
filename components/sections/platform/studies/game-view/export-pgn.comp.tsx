"use client";

import { useState } from "react";

interface ExportPgnProps {
  pgn: string;
  white: string;
  black: string;
  title?: string;
}

/** «Luna, Sebastián – Cervantes, Thalía.pgn», sin lo que rompa un nombre de archivo. */
function fileName(white: string, black: string, title?: string): string {
  const base = title ?? `${white} - ${black}`;
  return `${base.replace(/[\\/:*?"<>|]/g, "").slice(0, 80)}.pgn`;
}

export function ExportPgn({ pgn, white, black, title }: ExportPgnProps) {
  const [copied, setCopied] = useState(false);

  const download = () => {
    // El PGN ya está en memoria: no hace falta pedirlo al servidor para bajarlo.
    const url = URL.createObjectURL(new Blob([pgn], { type: "application/x-chess-pgn" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName(white, black, title);
    link.click();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pgn);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin permiso de portapapeles queda la descarga, que no depende de él.
    }
  };

  return (
    <div className="game-aside__export">
      <button type="button" className="game-aside__export-button" onClick={copy}>
        {copied ? "Copiado" : "Copiar PGN"}
      </button>
      <button type="button" className="game-aside__export-button" onClick={download}>
        Descargar
      </button>
    </div>
  );
}

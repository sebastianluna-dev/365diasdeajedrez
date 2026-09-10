import type { ChessDiagramBlock } from "@/payload-types";
import { StaticDiagram } from "@/components/common/static-diagram.comp";

// Adaptador del bloque de Payload al diagrama común: antes era una copia del
// componente y de su hoja, y las dos ya se habían desincronizado en el pie.
export function ChessDiagramBlockRenderer({ fen, caption, orientation }: ChessDiagramBlock) {
  return <StaticDiagram fen={fen} orientation={orientation} caption={caption ?? undefined} context="article" />;
}

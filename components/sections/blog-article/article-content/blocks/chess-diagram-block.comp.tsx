import type { ChessDiagramBlock } from "@/payload-types";
import { StaticDiagram } from "@/components/common/static-diagram.comp";

// Adapter from the Payload block to the shared diagram: it used to be a copy
// of the component and of its sheet, and the two had already drifted apart in the caption.
export function ChessDiagramBlockRenderer({ fen, caption, orientation }: ChessDiagramBlock) {
  return <StaticDiagram fen={fen} orientation={orientation} caption={caption ?? undefined} context="article" />;
}

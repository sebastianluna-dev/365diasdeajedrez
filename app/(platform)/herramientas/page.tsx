import { notFound } from "next/navigation";

// «Herramientas»: the analysis board and «Importar partida» (planning/jugar,
// phase 4). Until they are built — and while ANALYSIS_BOARD_ENABLED is off —
// there is nothing here; the folder exists so the proxy protects the prefix
// from the first commit.
export default function ToolsPage(): never {
  notFound();
}

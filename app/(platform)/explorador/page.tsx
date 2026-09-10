import type { Metadata } from "next";
import { GameExplorerSection } from "@/components/platform/sections/explorer/game-explorer.section";

export const metadata: Metadata = {
  title: "Explorador de partidas",
};

export default function ExplorerPage() {
  return <GameExplorerSection />;
}

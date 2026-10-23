import type { Metadata } from "next";
import { explorerOriginOf } from "@/components/platform/sections/explorer/explorer-views.const";
import { GameExplorerSection } from "@/components/platform/sections/explorer/game-explorer.section";

export const metadata: Metadata = {
  title: "Explorador de partidas",
};

interface ExplorerPageProps {
  /** `?origen=` narrows the search to one origin of the games. */
  searchParams: Promise<{ origen?: string | string[] }>;
}

export default async function ExplorerPage({ searchParams }: ExplorerPageProps) {
  const { origen } = await searchParams;
  return (
    // The new design system (2026-10-23): the page takes the window and
    // bleeds onto the canvas; the explorer draws the workspace.
    <div className="platform-page platform-page_width_full platform-page_frame_bleed">
      <GameExplorerSection origin={explorerOriginOf(origen)} />
    </div>
  );
}

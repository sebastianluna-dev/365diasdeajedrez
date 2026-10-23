import { ExplorerSkeleton } from "@/components/platform/sections/explorer/explorer-skeleton.comp";

export default function ExplorerLoading() {
  return (
    // The page's own frame (`page.tsx`), so the workspace lands where the
    // explorer's will.
    <div className="platform-page platform-page_width_full platform-page_frame_bleed">
      <ExplorerSkeleton />
    </div>
  );
}

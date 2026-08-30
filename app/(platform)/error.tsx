"use client";

import { PlatformError } from "@/components/common/platform-error.comp";

export default function PlatformErrorBoundary({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <PlatformError retry={retry} />;
}

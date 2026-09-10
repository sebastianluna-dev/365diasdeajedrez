"use client";

import { PlatformError } from "@/components/platform/shared/platform-error.comp";

export default function PlatformErrorBoundary({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  // The `digest` is the only part of the error that reaches the browser in
  // production, and it is the same one `instrumentation.ts` logs on the server:
  // showing it is what lets a student say "I got code X" and have it found.
  return <PlatformError retry={retry} digest={error.digest} />;
}

type FbqEventParams = Record<string, string | number | boolean | undefined>;

type Fbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * Sends a Meta Pixel event. No-ops on the server or if the base
 * pixel script (see MetaPixel component) hasn't initialized `fbq` yet.
 */
export function fbEvent(name: string, params?: FbqEventParams): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;

  if (params) {
    window.fbq("track", name, params);
  } else {
    window.fbq("track", name);
  }
}

"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { fbEvent, META_PIXEL_ID } from "@/lib/meta-pixel";

function MetaPixelPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    fbEvent("PageView");
  }, [pathname, searchParams]);

  return null;
}

export function MetaPixel() {
  if (!META_PIXEL_ID || process.env.NEXT_PUBLIC_APP_ENV !== "production") return null;

  // `lazyOnload` like GA: the pixel does not compete with hydration. Its
  // initial PageView is fired by the snippet itself when it runs, and the
  // navigation ones (MetaPixelPageViews) are not lost because `fbEvent` is a
  // no-op if `fbq` does not exist yet.
  return (
    <>
      <Script id="meta-pixel-base" strategy="lazyOnload">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element -- required noscript fallback per Meta's base code, must be a plain <img> */}
        <img
          height="1"
          width="1"
          alt=""
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
      <Suspense fallback={null}>
        <MetaPixelPageViews />
      </Suspense>
    </>
  );
}

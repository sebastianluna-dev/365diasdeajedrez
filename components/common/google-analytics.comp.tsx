import Script from "next/script";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// `lazyOnload`: gtag pesa más que el JS propio de la portada y no tiene por
// qué competir con la hidratación. El pageview llega unos cientos de ms más
// tarde, después de `load`, y no se pierde: `gtag('config')` lo dispara al
// ejecutarse, sea cuando sea.
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_APP_ENV !== "production") {
    return null;
  }

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="lazyOnload" />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}

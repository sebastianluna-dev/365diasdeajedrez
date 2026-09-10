import Script from "next/script";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// `lazyOnload`: gtag weighs more than the home page's own JS and has no
// reason to compete with hydration. The pageview arrives a few hundred ms
// later, after `load`, and is not lost: `gtag('config')` fires it when it
// runs, whenever that is.
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

/**
 * Üçüncü parti script'ler — hepsi site.config.js ile koşullu.
 * Hiçbiri yapılandırılmamışsa sayfaya tek byte bile eklenmez.
 */

import Script from "next/script";
import siteConfig from "~/site.config";

export default function Scripts() {
  const { ads, analytics } = siteConfig;
  const gaId = analytics.googleAnalyticsId;

  return (
    <>
      {ads.enabled && ads.client ? (
        <Script
          id="adsbygoogle-init"
          async
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ads.client}`}
        />
      ) : null}

      {gaId ? (
        <>
          <Script
            id="ga-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','${gaId}');`}
          </Script>
        </>
      ) : null}
    </>
  );
}

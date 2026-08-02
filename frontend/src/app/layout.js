import { Geist, Geist_Mono } from "next/font/google";

import siteConfig from "~/site.config";
import ThemeVars from "@/components/ThemeVars";
import Scripts from "@/components/Scripts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { StickyMobileAdSlot } from "@/components/ads";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

import "./globals.css";

/**
 * ⚠️ `latin-ext` ZORUNLU — çıkarma.
 * Türkçe'nin ğ Ğ ş Ş İ karakterleri `latin` alt kümesinde DEĞİL, `latin-ext`
 * içinde. Sadece `latin` yüklenirse tarayıcı bu glifleri geç indirir ve ilk
 * boyamada "değişim", "İş", "Şirket" gibi kelimeler yedek yazı tipiyle çizilip
 * sonra sıçrar. Türkçe bir yayın için görünür bir kusur.
 *
 * `display: "swap"` — metin, yazı tipi inerken görünmez kalmaz (LCP için).
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

/* Sayısal veri (fiyat, yüzde, endeks) için — tabular hizalama şart. */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

/** @type {import("next").Metadata} */
export const metadata = {
  /* Göreli yolların (canonical, OG görseli) çözülebilmesi için zorunlu. */
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    /* Alt sayfalar sadece kendi başlığını verir; şablon otomatik uygulanır. */
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.description,
  keywords: siteConfig.seo.defaultKeywords,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/rss.xml" },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    /* Görsel `src/app/opengraph-image.js` tarafından otomatik üretilir. */
  },
  twitter: {
    card: "summary_large_image",
    ...(siteConfig.social.twitterHandle
      ? { site: siteConfig.social.twitterHandle, creator: siteConfig.social.twitterHandle }
      : {}),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  ...(siteConfig.analytics.googleSiteVerification
    ? { verification: { google: siteConfig.analytics.googleSiteVerification } }
    : {}),
};

/** @type {import("next").Viewport} */
export const viewport = {
  themeColor: siteConfig.theme.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang={siteConfig.lang}
      /* Next 16 artık smooth scroll'u kendisi bastırmıyor;
         yumuşak kaydırmayı bu attribute ile açıkça talep ediyoruz. */
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <head>
        {/* site.config.js renklerini CSS değişkenlerine bas — ilk boyamadan önce */}
        <ThemeVars />
      </head>
      <body className="flex min-h-full flex-col bg-canvas text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white"
        >
          İçeriğe atla
        </a>

        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />

        {/* Mobil alt yapışkan reklam — NEXT_PUBLIC_MOBILE_STICKY_AD_ENABLED
            "true" değilse hiç render edilmez (varsayılan: kapalı). */}
        <StickyMobileAdSlot />

        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <Scripts />
      </body>
    </html>
  );
}

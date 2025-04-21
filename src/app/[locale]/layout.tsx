import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./component/navbar";
import Footer from "./component/footer";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Providers from "./provider";
import Script from "next/script";

export const metadata: Metadata = {
  title: {
    default: "CloudyForge | Military Auctions & Project Revenge",
    template: "%s | CloudyForge"
  },
  description: "Support Ukraine through military collectible auctions and Project Revenge - sending powerful messages to Russians via artillery strikes funded by your contributions.",
  keywords: [
    "military auction",
    "support Ukraine",
    "war artifacts",
    "collectibles",
    "Project Revenge",
    "artillery messages",
    "Russian warship",
    "military donations",
    "CloudyForge",
    "signed shells",
    "Send artillery messages to Russian",
    "Russian invader"
  ],
  openGraph: {
    title: "CloudyForge | Military Auctions & Project Revenge",
    description: "Auction platform funding artillery strikes with personalized messages to Russian forces. Every purchase makes an impact.",
    url: "https://cloudyforge.com",
    siteName: "CloudyForge",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CloudyForge | Military Auctions & Project Revenge",
    description: "Turn your donations into artillery messages to Russian forces. Auction proceeds fund precise strikes.",
    creator: "@GloOouD",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://cloudyforge.com",
    languages: {
      "en-US": "https://cloudyforge.com/en",
      "uk-UA": "https://cloudyforge.com/uk",
    },
  },
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as any)) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        {/* Favicon and App Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />

        <meta name="google-site-verification" content="MZOifn7gpbzgnDuK4QRHFI0TNqFCyiIevGmgbfOV7hk" />

        {/* Preload critical assets */}
        <link rel="preload" href="/hero-image.webp" as="image" />
        <link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />

        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-KEBTZX90N8"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KEBTZX90N8', {
              page_path: window.location.pathname,
            });
          `}
        </Script>

        {/* Project Revenge Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "CloudyForge",
            "url": "https://cloudyforge.com",
            "logo": "https://cloudyforge.com/web-app-manifest-192x192.png",
            "description": "Military collectibles auction and artillery message platform supporting Ukraine",
            "sameAs": [
              "https://twitter.com/GloOouD",
            ],
            "foundingDate": "2024",
            "keywords": "Ukraine, military auction, Project Revenge, artillery messages, signed shell"
          })}
        </script>

        {/* Auction Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "CloudyForge Auctions",
            "applicationCategory": "MilitaryCollectibles",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "category": "MilitaryArtifacts"
            }
          })}
        </script>
      </head>
      <body className="flex flex-col min-h-screen bg-gray-900 text-white">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Navbar />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
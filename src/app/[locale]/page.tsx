import MainPageContent from "./MainPageContent";
import type { Metadata } from "next";

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
    "donations",
    "CloudyForge",
    "signed shells"
  ],
  openGraph: {
    title: "CloudyForge | Military Auctions & Project Revenge",
    description: "Auction platform funding artillery strikes with personalized messages to Russian forces. Every purchase makes an impact.",
    url: "https://www.cloudyforge.com",
    siteName: "CloudyForge",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CloudyForge | Military Auctions & Project Revenge",
    description: "Turn your donations into artillery messages to Russian forces. Auction proceeds fund precise strikes.",
    creator: "@GloOouD",
    images: ["https://www.cloudyforge.com/web-app-manifest-512x512.png"]
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
    canonical: "https://www.cloudyforge.com",
    languages: {
      "en-US": "https://www.cloudyforge.com/en",
      "uk-UA": "https://www.cloudyforge.com/uk",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
    other: {
      rel: "manifest",
      url: "/site.webmanifest"
    }
  },
  metadataBase: new URL("https://www.cloudyforge.com")
};

export default function MainPage() {
  return <MainPageContent />;
}
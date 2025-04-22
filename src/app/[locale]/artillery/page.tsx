import SendMessage from "./ArtilleryPageContent";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Project Revenge | Send Messages via Artillery",
    template: "%s | CloudyForge"
  },
  description: "Personalize artillery shells with your messages to Russian forces. 100% of funds support Ukrainian armed forces. Video confirmation included.",
  keywords: [
    "artillery message",
    "send message to Russians",
    "Project Revenge",
    "Ukraine support",
    "military donation",
    "personalized shells",
    "artillery strike",
    "war donation",
    "sign my bomb",
    "cloudyforge artillery"
  ],
  openGraph: {
    title: "Project Revenge | Send Your Message via Artillery",
    description: "Your text on Ukrainian artillery shells. Pay for message delivery to Russian positions with video proof.",
    url: "https://www.cloudyforge.com/artillery",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Send Messages via Artillery | Project Revenge",
    description: "Put your words on Ukrainian shells. 100% goes to military support."
  },
  alternates: {
    canonical: "https://www.cloudyforge.com/artillery",
    languages: {
      "en-US": "https://www.cloudyforge.com/en/artillery",
      "uk-UA": "https://www.cloudyforge.com/uk/artillery",
    },
  },
  robots: {
    index: true,
    follow: true
  },
  verification: {
    google: "MZOifn7gpbzgnDuK4QRHFI0TNqFCyiIevGmgbfOV7hk"
  }
};

export default function ArtilleryPage() {
    return <SendMessage />
  }
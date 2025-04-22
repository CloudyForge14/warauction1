import AuctionItemsClient from './AuctionItemsClient';

export const metadata = {
  title: "Military Auctions | CloudyForge",
  description: "Bid on authentic war artifacts to support Ukraine. Each purchase funds artillery strikes through Project Revenge.",
  keywords: [
    "military auctions",
    "auction",
    "war artifacts for sale",
    "signed artillery shells",
    "support Ukraine army",
    "war artifacts",
    "military collectibles",
  ],
  openGraph: {
    title: "Live Military Auctions | CloudyForge",
    description: "Exclusive auctions funding artillery messages to Russian forces.",
  },
  alternates: {
    canonical: "https://cloudyforge.com/auction",
    languages: {
      "en-US": "https://cloudyforge.com/en/auction",
      "uk-UA": "https://cloudyforge.com/uk/auction",
    },
  }
};

export default function AuctionPage() {
  return <AuctionItemsClient />;
}
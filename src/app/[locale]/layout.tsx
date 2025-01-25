import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./component/navbar";
import Footer from "./component/footer";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Providers from "./provider"; // <-- импортируем Client Provider

export const metadata: Metadata = {
  title: "CloudyForge",
  description: "Support Ukraine soldiers via CloudyForge",
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Messages for next-intl
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="flex flex-col min-h-screen bg-gray-900 text-white">
        <SpeedInsights />

        {/* next-intl на клиенте */}
        <NextIntlClientProvider messages={messages}>
          {/* React Query на клиенте */}
          <Providers>
            <Navbar />

            <main className="flex-1">{children}</main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

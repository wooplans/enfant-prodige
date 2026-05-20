import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import FacebookPixel from "@/components/FacebookPixel";

export const metadata: Metadata = {
  title: "Enfant Prodige BD | Livres Personnalisés pour Enfants au Cameroun",
  description:
    "Offrez à votre enfant une BD avec son prénom sur la couverture et dans les dialogues. 3 séries illustrées, livrées en 48h à Yaoundé et Douala. Commandez sur WhatsApp.",
  keywords: "livre personnalisé enfant, BD personnalisée, Cameroun, Yaoundé, Douala, cadeau enfant africain",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "Enfant Prodige BD | Livres Personnalisés pour Enfants au Cameroun",
    description:
      "Offrez à votre enfant une BD avec son prénom sur la couverture et dans les dialogues. 3 séries illustrées, livrées en 48h à Yaoundé et Douala. Commandez sur WhatsApp.",
    type: "website",
    locale: "fr_CM",
    siteName: "Enfant Prodige BD",
    images: [
      {
        url: "/covers/academie-genies.jpg",
        width: 1200,
        height: 630,
        alt: "BD personnalisée Enfant Prodige",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enfant Prodige BD | Livres Personnalisés pour Enfants au Cameroun",
    description:
      "Offrez à votre enfant une BD avec son prénom sur la couverture et dans les dialogues.",
    images: ["/covers/academie-genies.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col bg-amber-50 text-gray-900 antialiased font-sans">
        <Suspense fallback={null}>
          <FacebookPixel />
          <AnalyticsTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}

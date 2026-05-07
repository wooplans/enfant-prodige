import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Enfant Prodige BD | Livres Personnalisés pour Enfants au Cameroun",
  description:
    "Offrez à votre enfant une BD avec son prénom sur la couverture et dans les dialogues. 3 séries illustrées, livrées en 24h à Yaoundé et Douala. Commandez via WhatsApp.",
  keywords: "livre personnalisé enfant, BD personnalisée, Cameroun, Yaoundé, Douala, cadeau enfant africain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-amber-50 text-gray-900 antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

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
  title: "Enfant Prodige BD | Bandes Dessinées Africaines au Cameroun",
  description:
    "Découvrez et commandez des bandes dessinées africaines originales. Livraison partout au Cameroun. Commandez via WhatsApp.",
  keywords: "bande dessinée, BD, Cameroun, Afrique, comics, manga africain",
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

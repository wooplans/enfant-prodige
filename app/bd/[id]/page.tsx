import { getPublicCatalogue, getPublicSeriesBySlug } from "@/lib/series";
import BDDetailClient from "@/components/BDDetailClient";
import SiteChrome from "@/components/SiteChrome";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPaymentSettings } from "@/lib/payment-settings";
import { getDeliveryDateLabel } from "@/lib/delivery";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const bd = await getPublicSeriesBySlug(id);

  if (!bd) {
    notFound();
  }

  const description =
    bd.id === "academie-genies"
      ? "Offrez à votre garçon de 7 à 12 ans une BD personnalisée avec son prénom, imprimée en couleur et livrée à Douala ou Yaoundé."
      : bd.description;
  const title =
    bd.id === "academie-genies"
      ? "BD personnalisée garçon à Douala et Yaoundé"
      : `${bd.serie} | BD personnalisée enfant`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `/bd/${bd.id}`,
      images: [
        {
          url: bd.couverture,
          width: 1200,
          height: 630,
          alt: `Couverture ${bd.serie}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${bd.serie} | Enfant Prodige BD`,
      description,
      images: [bd.couverture],
    },
  };
}

export default async function PageBD({ params }: Props) {
  const { id } = await params;
  const bd = await getPublicSeriesBySlug(id);

  if (!bd) {
    notFound();
  }

  await getPublicCatalogue();
  const paymentSettings = await getPaymentSettings();
  const deliveryDateLabel = getDeliveryDateLabel(new Date(), 48);
  const page = (
    <BDDetailClient
      bd={bd}
      landingPageMode={bd.landingPageMode}
      paymentSettings={paymentSettings}
      deliveryDateLabel={deliveryDateLabel}
    />
  );

  if (bd.landingPageMode) return page;

  return <SiteChrome showFooter={false}>{page}</SiteChrome>;
}

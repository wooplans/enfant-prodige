import { getPublicCatalogue, getPublicSeriesBySlug } from "@/lib/series";
import BDDetailClient from "@/components/BDDetailClient";
import DecouvreLesMetiersLanding from "@/components/DecouvreLesMetiersLanding";
import SauveLesAnimauxLanding from "@/components/SauveLesAnimauxLanding";
import SiteChrome from "@/components/SiteChrome";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPaymentSettings } from "@/lib/payment-settings";
import { getDeliveryDateLabel } from "@/lib/delivery";

interface Props {
  params: Promise<{ id: string }>;
}

const landingMetadataById: Record<string, { title: string; description: string }> = {
  "sauve-les-animaux": {
    title: "Sauve les Animaux | Landing WhatsApp",
    description:
      "Une landing WhatsApp pour une BD personnalisée où votre enfant sauve les animaux et devient le héros de l'histoire.",
  },
  "decouvre-les-metiers": {
    title: "Découvre les Métiers | Landing WhatsApp",
    description:
      "Une landing WhatsApp pour une BD personnalisée où votre enfant découvre les métiers, imagine son avenir et apprend en s'amusant.",
  },
  "academie-genies": {
    title: "BD personnalisée garçon à Douala et Yaoundé",
    description:
      "Offrez à votre garçon de 7 à 12 ans une BD personnalisée avec son prénom, imprimée en couleur et livrée à Douala ou Yaoundé.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const bd = await getPublicSeriesBySlug(id);

  if (!bd) {
    notFound();
  }

  const landingMeta = landingMetadataById[bd.id];
  const description = landingMeta?.description ?? bd.description;
  const title = landingMeta?.title ?? `${bd.serie} | BD personnalisée enfant`;

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

  let page;
  if (bd.id === "sauve-les-animaux") {
    page = <SauveLesAnimauxLanding bd={bd} />;
  } else if (bd.id === "decouvre-les-metiers") {
    page = <DecouvreLesMetiersLanding bd={bd} />;
  } else {
    page = (
      <BDDetailClient
        bd={bd}
        landingPageMode={bd.landingPageMode}
        paymentSettings={paymentSettings}
        deliveryDateLabel={deliveryDateLabel}
      />
    );
  }

  if (bd.landingPageMode) return page;

  return <SiteChrome showFooter={false}>{page}</SiteChrome>;
}

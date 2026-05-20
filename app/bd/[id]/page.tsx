import { getPublicCatalogue, getPublicSeriesBySlug, getSeriesPaidCount } from "@/lib/series";
import BDDetailClient from "@/components/BDDetailClient";
import SiteChrome from "@/components/SiteChrome";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
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

  const description = bd.description;

  return {
    title: `${bd.serie} | BD personnalisée enfant`,
    description,
    openGraph: {
      title: `${bd.serie} | Enfant Prodige BD`,
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

  const soldCount = await getSeriesPaidCount(id);
  await getPublicCatalogue();
  const deliveryDateLabel = getDeliveryDateLabel(new Date(), 48);
  const landingPageMode = bd.landingPageMode || bd.id === "academie-genies";
  const page = (
    <BDDetailClient
      bd={bd}
      landingPageMode={landingPageMode}
      deliveryDateLabel={deliveryDateLabel}
      soldCount={soldCount}
    />
  );

  if (landingPageMode) return page;

  return <SiteChrome showFooter={false}>{page}</SiteChrome>;
}

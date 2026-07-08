import { getPublicCatalogue, getPublicSeriesBySlug } from "@/lib/series";
import BDDetailClientClone from "@/components/BDDetailClientClone";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const bd = await getPublicSeriesBySlug("sauve-les-animaux-clone");

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

export default async function PageBDClone() {
  const bd = await getPublicSeriesBySlug("sauve-les-animaux-clone");

  if (!bd) {
    notFound();
  }

  const catalogue = await getPublicCatalogue();
  const autresSeries = catalogue.filter((b) => b.id !== bd.id);

  return <BDDetailClientClone bd={bd} autresSeries={autresSeries} />;
}

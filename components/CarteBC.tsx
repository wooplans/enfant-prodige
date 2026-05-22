"use client";

import Link from "next/link";
import Image from "next/image";
import type { BD } from "@/lib/catalogue";
import { trackAnalyticsEvent } from "@/components/AnalyticsTracker";

interface CarteBDProps {
  bd: BD;
}

export default function CarteBD({ bd }: CarteBDProps) {
  const trackSeriesClick = (placement: string) => {
    trackAnalyticsEvent({
      eventType: "cta_click",
      metadata: {
        source: "catalogue_card",
        placement,
        href: `/bd/${bd.id}`,
        seriesId: bd.id,
        seriesSlug: bd.slug || bd.id,
        seriesTitle: bd.serie,
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden flex flex-col border border-amber-100">
      {/* Couverture */}
      <Link
        href={`/bd/${bd.id}`}
        onClick={() => trackSeriesClick("cover")}
        className="relative block bg-amber-100 aspect-[2/3] overflow-hidden group"
      >
        <Image
          src={bd.couverture}
          alt={`Couverture de ${bd.serie}`}
          fill
          sizes="(min-width: 768px) 33vw, 50vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Badge âge */}
        <span className="absolute top-2 left-2 bg-white/90 text-gray-700 text-sm font-bold px-2 py-0.5 rounded-full shadow">
          {bd.ageMax >= 99 ? `${bd.ageMin} ans et plus` : `${bd.ageMin}–${bd.ageMax} ans`}
        </span>
      </Link>

      {/* Infos */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-sm text-green-700 font-medium uppercase tracking-wide mb-1 line-clamp-1">
          {bd.genre}
        </span>
        <Link href={`/bd/${bd.id}`} onClick={() => trackSeriesClick("title")}>
          <h3 className="font-bold text-gray-900 hover:text-green-700 transition-colors leading-tight text-sm">
            {bd.serie}
          </h3>
        </Link>
        <p className="text-sm text-gray-700 mt-0.5">✨ Avec le prénom de votre enfant</p>

        <p className="text-sm text-gray-600 mt-2 line-clamp-2 flex-1">{bd.description}</p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xl font-bold text-green-800">
              {bd.prix.toLocaleString("fr-FR")} FCFA
            </div>
            <div className="text-sm text-gray-700">
              + {bd.fraisLivraison.toLocaleString("fr-FR")} FCFA livraison
            </div>
          </div>

          <Link
            href={`/bd/${bd.id}`}
            onClick={() => trackSeriesClick("button")}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-3 py-2 rounded-xl flex items-center justify-center gap-1 transition-colors text-center leading-tight"
          >
            Pré-commander
          </Link>
        </div>
      </div>
    </div>
  );
}

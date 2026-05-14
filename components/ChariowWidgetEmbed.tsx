"use client";

import { useEffect, useMemo, useRef } from "react";

type Props = {
  html: string;
  productUrl: string;
  productCode: string;
  childName?: string;
  fallbackLabel?: string;
};

export default function ChariowWidgetEmbed({
  html,
  productUrl,
  productCode,
  childName,
  fallbackLabel = "Ouvrir le paiement Chariow",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const snippet = useMemo(() => html.trim(), [html]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    if (!snippet) return;

    const template = document.createElement("template");
    template.innerHTML = snippet;
    const nodes = Array.from(template.content.childNodes);

    for (const node of nodes) {
      if (node.nodeName.toLowerCase() === "script") {
        const script = document.createElement("script");
        const source = node as HTMLScriptElement;
        for (const attr of Array.from(source.attributes)) {
          script.setAttribute(attr.name, attr.value);
        }
        script.text = source.textContent ?? "";
        container.appendChild(script);
      } else {
        container.appendChild(node.cloneNode(true));
      }
    }
  }, [snippet]);

  if (!snippet) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
        <div className="text-xs font-bold uppercase tracking-wide text-gray-500">Chariow</div>
        <div className="mt-1 text-sm font-semibold text-gray-900">Produit {productCode}</div>
        {childName && <div className="mt-1 text-sm font-bold text-gray-950">Pour {childName}</div>}
        <a
          href={productUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-green-600"
        >
          {fallbackLabel}
        </a>
      </div>
    );
  }

  return (
    <div className="w-full" data-chariow-product={productCode}>
      {childName && (
        <div className="mb-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-center">
          <div className="text-xs font-bold uppercase tracking-wide text-green-700">Commande pour</div>
          <div className="mt-1 text-base font-extrabold text-green-950">{childName}</div>
        </div>
      )}
      <div ref={containerRef} className="w-full" />
    </div>
  );
}

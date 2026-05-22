"use client";

import { useEffect, useState } from "react";

interface Props {
  onCommander: () => void;
  shakeStartId?: string;
  label?: string;
}

export default function StickyCommanderBar({ onCommander, shakeStartId, label = "Commander sur WhatsApp" }: Props) {
  const [visible, setVisible] = useState(false);
  const [shakeEnabled, setShakeEnabled] = useState(false);

  useEffect(() => {
    const getShakeStartY = () => {
      if (!shakeStartId) return Number.POSITIVE_INFINITY;

      const el = document.getElementById(shakeStartId);
      if (!el) return Number.POSITIVE_INFINITY;

      const rect = el.getBoundingClientRect();
      return window.scrollY + rect.top;
    };

    let shakeStartY = getShakeStartY();

    const onScroll = () => {
      const currentY = window.scrollY;
      setVisible(currentY > 200);
      setShakeEnabled(currentY >= shakeStartY);
    };

    const onResize = () => {
      shakeStartY = getShakeStartY();
      onScroll();
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [shakeStartId]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl px-4 py-3 flex flex-col items-center gap-1.5">
      <button
        type="button"
        onPointerDown={onCommander}
        onClick={onCommander}
        className="relative flex w-full max-w-2xl items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#25D366] px-3 py-3 text-base font-bold text-white transition-colors hover:bg-[#1ebe5d] active:bg-[#19a853]"
        style={shakeEnabled ? { animation: "sticky-shake 3s ease-in-out infinite" } : undefined}
      >
        <span className="cta-flash-light" aria-hidden="true" />
        <span className="relative z-10">{label}</span>
        <span className="relative z-10" aria-hidden="true">→</span>
      </button>
      <p className="text-xs font-semibold text-gray-500">📦 Expédition partout au Cameroun · 9 900 FCFA</p>
    </div>
  );
}

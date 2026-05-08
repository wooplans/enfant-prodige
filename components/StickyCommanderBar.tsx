"use client";

import { useEffect, useState } from "react";

interface Props {
  onCommander: () => void;
  shakeStartId?: string;
}

export default function StickyCommanderBar({ onCommander, shakeStartId }: Props) {
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
      setVisible(currentY > 400);
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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl px-4 py-3 flex items-center justify-center">
      <button
        onClick={onCommander}
        className="w-full max-w-2xl bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold text-base px-3 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        style={shakeEnabled ? { animation: "sticky-shake 3s ease-in-out infinite" } : undefined}
      >
        <span>*</span> Personnaliser pour mon enfant
      </button>
    </div>
  );
}

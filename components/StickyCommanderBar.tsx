"use client";

import { useEffect, useState } from "react";

interface Props {
  prix: number;
  onCommander: () => void;
}

export default function StickyCommanderBar({ prix, onCommander }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl px-4 py-3 flex items-center gap-3">
      <div className="shrink-0">
        <div className="text-xs text-gray-500">BD personnalisée</div>
        <div className="font-extrabold text-green-800 text-lg leading-tight">
          {prix.toLocaleString("fr-FR")} FCFA
        </div>
      </div>
      <button
        onClick={onCommander}
        className="flex-1 min-w-0 bg-green-600 hover:bg-green-500 text-white font-bold text-sm px-3 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        <span>✨</span> Personnaliser pour mon enfant
      </button>
    </div>
  );
}

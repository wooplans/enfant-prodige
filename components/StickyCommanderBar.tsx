"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

interface Props {
  onCommander: () => void;
  shakeStartId?: string;
  label?: string;
  countdownLabel?: string;
  leadingIcon?: ReactNode;
}

export default function StickyCommanderBar({
  onCommander,
  shakeStartId,
  label = "Personnaliser pour mon enfant",
  countdownLabel,
  leadingIcon,
}: Props) {
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
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e6e6e6] bg-white/96 px-4 py-3 shadow-[0_-10px_32px_rgba(0,0,0,0.08)] backdrop-blur-md">
      <div className="mx-auto grid max-w-2xl gap-2">
        {countdownLabel && (
          <div className="rounded-lg border border-[#e6e6e6] bg-[#dd5b00]/10 px-3 py-2 text-center text-xs font-extrabold text-[#dd5b00]">
            {countdownLabel}
          </div>
        )}
        <button
          type="button"
          onClick={onCommander}
          className="relative flex w-full items-center justify-center overflow-hidden rounded-full bg-[#0075de] px-5 py-3.5 text-base font-extrabold text-white shadow-[0_12px_28px_rgba(0,117,222,0.22)] transition-colors hover:bg-[#005bab] active:bg-[#005bab]"
          style={shakeEnabled ? { animation: "sticky-shake 3s ease-in-out infinite" } : undefined}
        >
          <span className="cta-flash-light" aria-hidden="true" />
          <span className="relative z-10 flex items-center gap-2">
            {leadingIcon}
            <span>{label}</span>
          </span>
        </button>
      </div>
    </div>
  );
}

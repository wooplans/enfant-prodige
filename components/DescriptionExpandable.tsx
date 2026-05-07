"use client";

import { useState } from "react";

interface Props {
  texte: string;
}

export default function DescriptionExpandable({ texte }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <p className={`text-gray-600 leading-relaxed text-sm ${!expanded ? "line-clamp-4" : ""}`}>
        {texte}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 text-green-700 font-semibold text-sm flex items-center gap-1"
      >
        {expanded ? "Voir moins ↑" : "Lire la suite ↓"}
      </button>
    </div>
  );
}

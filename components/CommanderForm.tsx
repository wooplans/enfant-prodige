"use client";

interface Props {
  prix: number;
  fraisLivraison: number;
  onCommander: () => void;
}

export default function CommanderForm({ prix, fraisLivraison, onCommander }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <span className="text-2xl sm:text-3xl font-extrabold text-green-800">
          {prix.toLocaleString("fr-FR")} FCFA
        </span>
        <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full">
          En stock
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-5">
        + {fraisLivraison.toLocaleString("fr-FR")} FCFA frais de livraison
        <span className="text-green-600 font-medium"> · payés à la réception</span>
      </p>

      <button
        onClick={onCommander}
        className="w-full bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg"
      >
        <span>✨</span>
        Commander cette BD
      </button>
      <p className="text-xs text-gray-400 text-center mt-2">
        Personnalisation avec le prénom · Livraison 24h · Mobile Money
      </p>
    </div>
  );
}

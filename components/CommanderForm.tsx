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
      <p className="text-sm text-gray-600 mb-5">
        + {fraisLivraison.toLocaleString("fr-FR")} FCFA frais de livraison
        <span className="text-green-600 font-medium"> · payés à la réception</span>
      </p>

      <button
        type="button"
        onPointerDown={onCommander}
        onClick={onCommander}
        className="w-full bg-[#25D366] hover:bg-[#1ebe5d] active:bg-[#19a853] text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.549 4.107 1.51 5.845L.057 23.885a.5.5 0 0 0 .609.63l6.208-1.624A11.95 11.95 0 0 0 12 24c6.626 0 12-5.373 12-12S18.626 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.001-1.368l-.356-.213-3.705.969.993-3.617-.235-.374A9.818 9.818 0 0 1 2.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z" />
        </svg>
        Commander sur WhatsApp
      </button>
      <p className="text-sm text-gray-600 text-center mt-2">
        Personnalisation avec le prénom · Livraison 24h · Paiement à la réception
      </p>
    </div>
  );
}

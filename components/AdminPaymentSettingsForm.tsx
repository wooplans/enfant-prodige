"use client";

import { useActionState } from "react";
import { savePaymentSettingsAction } from "@/app/admin/actions";
import type { PaymentSettings } from "@/lib/payment-settings";

type Props = {
  settings: PaymentSettings;
};

const initialState = { ok: true, message: "" };

export default function AdminPaymentSettingsForm({ settings }: Props) {
  const [state, formAction, pending] = useActionState(savePaymentSettingsAction, initialState);

  return (
    <form action={formAction} className="space-y-5 rounded-3xl border border-amber-100 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-green-700">Paiements</p>
        <h2 className="text-2xl font-extrabold text-gray-950">Configuration globale</h2>
        <p className="mt-1 text-sm text-gray-600">
          Chariow est le fournisseur par défaut. Monetbil reste activable depuis ce panneau.
        </p>
      </div>

      {state.message && (
        <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${state.ok ? "border border-green-200 bg-green-50 text-green-800" : "border border-red-200 bg-red-50 text-red-700"}`}>
          {state.message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-gray-800">Fournisseur par défaut</span>
          <select name="defaultProvider" defaultValue={settings.defaultProvider} className="admin-input">
            <option value="chariow">Chariow</option>
            <option value="monetbil">Monetbil</option>
          </select>
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3">
          <input name="monetbilEnabled" type="checkbox" defaultChecked={settings.monetbilEnabled} className="h-4 w-4 accent-green-700" />
          <span>
            <span className="block text-sm font-bold text-gray-800">Activer Monetbil</span>
            <span className="block text-xs text-gray-500">Permet à Monetbil d’apparaître comme option active.</span>
          </span>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-gray-800">Code produit Chariow</span>
          <input name="chariowProductCode" defaultValue={settings.chariowProductCode} className="admin-input" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-gray-800">Lien produit / paiement Chariow</span>
          <input name="chariowProductUrl" defaultValue={settings.chariowProductUrl} className="admin-input" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-bold text-gray-800">Snippet Snap Chariow</span>
        <textarea
          name="chariowSnapSnippet"
          defaultValue={settings.chariowSnapSnippet}
          rows={7}
          className="admin-input font-mono text-xs"
          placeholder={`Colle ici le code HTML du widget Snap commençant par <div id="chariow-widget" ...>`}
        />
      </label>

      <div className="rounded-2xl bg-amber-50 p-4 text-sm text-gray-700">
        Produit Chariow actif: <span className="font-bold text-gray-950">{settings.chariowProductCode}</span>
      </div>

      <button
        disabled={pending}
        className="rounded-2xl bg-green-700 px-6 py-3 text-sm font-bold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {pending ? "Enregistrement..." : "Enregistrer les réglages"}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = {
  ok: false,
  message: "",
};

export default function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
      {state.message && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.message}
        </div>
      )}
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold text-gray-800">Mot de passe admin</span>
        <input name="password" type="password" autoComplete="current-password" required className="admin-input" />
      </label>
      <button disabled={pending} className="w-full rounded-2xl bg-green-700 px-6 py-3 text-sm font-bold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300">
        {pending ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}

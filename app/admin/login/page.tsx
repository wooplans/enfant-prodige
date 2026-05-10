import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/AdminLoginForm";
import SiteChrome from "@/components/SiteChrome";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) redirect("/admin");

  return (
    <SiteChrome>
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-green-700">Administration</p>
        <h1 className="text-3xl font-extrabold text-gray-950">Connexion admin</h1>
        <p className="mt-2 text-sm text-gray-600">Accès réservé à la gestion des séries.</p>
      </div>
      <AdminLoginForm />
    </div>
    </SiteChrome>
  );
}

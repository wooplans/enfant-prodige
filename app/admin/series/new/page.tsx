import AdminSeriesForm from "@/components/AdminSeriesForm";
import SiteChrome from "@/components/SiteChrome";
import { requireAdminPage } from "@/lib/admin-auth";

export default async function NewSeriesPage() {
  await requireAdminPage();

  return (
    <SiteChrome>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">Nouvelle série</p>
          <h1 className="text-3xl font-extrabold text-gray-950">Ajouter une série</h1>
        </div>
        <AdminSeriesForm />
      </div>
    </SiteChrome>
  );
}

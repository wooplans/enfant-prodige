import { notFound } from "next/navigation";
import AdminSeriesForm from "@/components/AdminSeriesForm";
import SiteChrome from "@/components/SiteChrome";
import { requireAdminPage } from "@/lib/admin-auth";
import { getAdminSeriesById } from "@/lib/series";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditSeriesPage({ params }: Props) {
  await requireAdminPage();
  const { id } = await params;
  const series = await getAdminSeriesById(id);

  if (!series) notFound();

  return (
    <SiteChrome>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">Modifier</p>
          <h1 className="text-3xl font-extrabold text-gray-950">{series.serie}</h1>
        </div>
        <AdminSeriesForm series={series} />
      </div>
    </SiteChrome>
  );
}

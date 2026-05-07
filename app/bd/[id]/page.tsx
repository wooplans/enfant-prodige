import { catalogue } from "@/lib/catalogue";
import BDDetailClient from "@/components/BDDetailClient";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return catalogue.map((bd) => ({
    id: bd.id,
  }));
}

export default async function PageBD({ params }: Props) {
  const { id } = await params;
  const bd = catalogue.find((b) => b.id === id);

  if (!bd) {
    notFound();
  }

  const autresSeries = catalogue.filter((b) => b.id !== bd.id);

  return <BDDetailClient bd={bd} autresSeries={autresSeries} />;
}

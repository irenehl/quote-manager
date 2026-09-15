import { getStore } from "@/lib/store";
import { notFound } from "next/navigation";
import { QuoteDocument } from "@/components/quote-document";
import { PrintBar } from "@/components/print-bar";
export const dynamic = "force-dynamic";
export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const q = getStore().quotes.find((q) => q.id === id);
  if (!q) notFound();
  return (
    <main className="document-page">
      <PrintBar />
      <QuoteDocument quote={q} />
    </main>
  );
}

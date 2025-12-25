// Datei: frontend/src/app/orders/new/page.tsx
import OrderForm from "@/components/order/OrderForm";
import { getProducts, getClients } from "@/lib/api";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NewOrderPage({ searchParams }: Props) {
  // 1. Produkte und Kunden parallel laden
  const [products, clients] = await Promise.all([
    getProducts(),
    getClients()
  ]);

  // 2. Prüfen, ob eine ClientID in der URL steht (z.B. ?clientId=123)
  const resolvedParams = await searchParams;
  const rawClientId = resolvedParams.clientId;
  const clientId = typeof rawClientId === "string" ? rawClientId : null;

  return (
    <main style={{ padding: 24 }}>
      {/* 3. Das Formular anzeigen */}
      <OrderForm
        products={products}
        clients={clients || []} // Wichtig: Fallback leeres Array, falls clients undefined ist
        initialClientId={clientId}
      />
    </main>
  );
}
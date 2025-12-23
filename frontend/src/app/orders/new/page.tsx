// frontend/src/app/orders/new/page.tsx
import OrderForm from "@/components/order/OrderForm";
import { getProducts } from "@/lib/api";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NewOrderPage({ searchParams }: Props) {
  // 1. Produkte laden (Server-Side)
  const products = await getProducts();

  // 2. searchParams auflösen (Next.js 15)
  const resolvedParams = await searchParams;

  // 3. clientId sicher extrahieren
  const rawClientId = resolvedParams.clientId;
  const clientId = typeof rawClientId === "string" ? rawClientId : null;

  return (
    <main style={{ padding: 24 }}>
      <OrderForm
        products={products}
        clientId={clientId}
      />
    </main>
  );
}
import OrderForm from "@/components/order/OrderForm";
import { getProducts } from "@/lib/api";

// In Next.js 15/16 ist searchParams ein Promise und die Werte können string, array oder undefined sein
interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NewOrderPage({ searchParams }: Props) {
  // 1. Produkte laden (Parallel zur Params-Auflösung möglich, hier sequenziell völlig okay)
  const products = await getProducts();

  // 2. searchParams auflösen (WICHTIG in Next.js 16)
  const resolvedParams = await searchParams;

  // 3. clientId sicher extrahieren (nur string erlauben)
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
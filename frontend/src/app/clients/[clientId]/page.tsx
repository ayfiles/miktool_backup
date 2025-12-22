import { getOrdersByClient } from "@/lib/api";
import ClientOrdersClient from "@/components/order/ClientOrdersClient";

interface Props {
  params: Promise<{
    clientId: string;
  }>;
}

export default async function ClientOrdersPage({ params }: Props) {
  // WICHTIG: params muss in Next.js 15+ erst awaited werden!
  const { clientId } = await params;

  // ✅ Server darf async
  const orders = await getOrdersByClient(clientId);

  return (
    <ClientOrdersClient
      clientId={clientId}
      initialOrders={orders}
    />
  );
}
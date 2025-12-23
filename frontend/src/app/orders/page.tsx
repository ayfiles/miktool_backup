// frontend/src/app/orders/page.tsx
import { getAllOrders } from "@/lib/api";
import OrdersListClient from "@/components/order/OrdersListClient";

export default async function OrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="container mx-auto py-8">
      <OrdersListClient initialOrders={orders} />
    </div>
  );
}
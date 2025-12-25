// frontend/src/app/orders/page.tsx
import { getAllOrders, getProducts, getClients } from "@/lib/api";
import OrdersListClient from "@/components/order/OrdersListClient";

export default async function OrdersPage() {
  // 👇 WICHTIG: Wir müssen Orders, Produkte UND Kunden laden!
  const [orders, products, clients] = await Promise.all([
    getAllOrders(),
    getProducts(),
    getClients()
  ]);

  return (
    <div className="container mx-auto py-8">
      <OrdersListClient 
        initialOrders={orders} 
        products={products} 
        clients={clients || []} // Fallback, damit es nicht crasht
      />
    </div>
  );
}
import { getClients, getOrdersByClient } from "@/lib/api";
import { notFound } from "next/navigation";
import ClientOrdersClient from "@/components/order/ClientOrdersClient";

interface Props {
  params: Promise<{ clientId: string }>;
}

export default async function ClientDetailPage({ params }: Props) {
  // 1. Parameter auflösen (Next.js 15)
  const { clientId } = await params;

  // 2. Kunden und Bestellungen parallel laden
  // (Wir laden alle Clients, um den richtigen zu finden, da wir noch keine getClientById haben)
  const [clients, orders] = await Promise.all([
    getClients(),
    getOrdersByClient(clientId)
  ]);

  // Den passenden Kunden suchen
  const client = clients.find((c) => c.id === clientId);

  // Wenn Kunde nicht existiert -> 404 Seite
  if (!client) {
    return notFound();
  }

  return (
    <ClientOrdersClient 
      client={client}   // ✅ Das ganze Objekt übergeben
      orders={orders}   // ✅ WICHTIG: Die Prop muss 'orders' heißen!
    />
  );
}
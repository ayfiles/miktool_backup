import { getInventory } from "@/lib/api";
import InventoryClient from "@/components/inventory/InventoryClient";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const items = await getInventory();

  return (
    <div className="container mx-auto py-8 px-4">
       <InventoryClient initialItems={items || []} />
    </div>
  );
}
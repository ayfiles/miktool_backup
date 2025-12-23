import { getAllOrders } from "@/lib/api";
import ProductionKanban from "@/components/production/ProductionKanban";
import { Layers } from "lucide-react";

export const dynamic = "force-dynamic"; 

export default async function ProductionPage() {
  const orders = await getAllOrders();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6 gap-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
             <Layers className="h-8 w-8" /> Production Board
           </h1>
           <p className="text-muted-foreground mt-1">
             Drag cards to update their production status.
           </p>
        </div>
      </div>

      {/* Das Board */}
      <div className="flex-1 overflow-hidden">
         <ProductionKanban initialOrders={orders} />
      </div>
    </div>
  );
}
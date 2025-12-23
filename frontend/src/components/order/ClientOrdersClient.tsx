"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/lib/api";
import DeleteOrderButton from "@/components/order/DeleteOrderButton";
import { FileText, Plus, Calendar } from "lucide-react";

// ✅ Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ClientOrdersClient({
  clientId,
  initialOrders,
}: {
  clientId: string;
  initialOrders: any[];
}) {
  const router = useRouter();

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      router.refresh(); // ✅ Lädt Daten neu ohne harte Seite-Reload
    } catch (err) {
      console.error(err);
      alert("Fehler beim Ändern des Status.");
    }
  };

  return (
    <main className="max-w-4xl mx-auto py-8 space-y-6">
      
      {/* HEADER & ACTION */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Orders</h1>
          <p className="text-muted-foreground">Manage production orders for this client.</p>
        </div>
        <Link href={`/orders/new?clientId=${clientId}`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Order
          </Button>
        </Link>
      </div>

      {/* ORDER LIST */}
      <div className="grid gap-4">
        {initialOrders.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8 text-center text-muted-foreground">
              No orders found. Create one to get started.
            </CardContent>
          </Card>
        ) : (
          initialOrders.map((order) => (
            <Card key={order.id} className="bg-zinc-900 border-zinc-800 overflow-hidden transition-all hover:border-zinc-700">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                
                {/* LEFT: INFO */}
                <CardHeader className="pb-2 sm:pb-6">
                  <div className="flex items-center gap-3 mb-1">
                    <CardTitle className="font-mono text-lg">
                      #{order.id.slice(0, 8)}
                    </CardTitle>
                    <StatusBadge status={order.status} />
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {new Date(order.created_at).toLocaleString()}
                  </CardDescription>
                </CardHeader>

                {/* RIGHT: ACTIONS */}
                <CardContent className="pb-6 sm:pt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  
                  {/* STATUS SELECTOR */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Status:</span>
                    <Select 
                      defaultValue={order.status} 
                      onValueChange={(val) => handleStatusChange(order.id, val)}
                    >
                      <SelectTrigger className="w-[140px] h-8 bg-zinc-950 border-zinc-800 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* BUTTONS */}
                  <div className="flex items-center gap-2">
                    {/* PDF Button */}
                    <a
                      href={`http://localhost:3001/orders/${order.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="h-8 border-zinc-700 hover:bg-zinc-800">
                        <FileText className="mr-2 h-3 w-3" /> PDF
                      </Button>
                    </a>

                    {/* Delete Button (Wrapper) */}
                    <div className="scale-90 origin-right">
                       <DeleteOrderButton orderId={order.id} />
                    </div>
                  </div>

                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}

// Helper für schicke Badges
function StatusBadge({ status }: { status: string }) {
  let className = "text-zinc-400 border-zinc-700"; 
  
  if (status === "production") className = "text-orange-400 border-orange-400/30 bg-orange-400/10";
  if (status === "done") className = "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
  if (status === "confirmed") className = "text-blue-400 border-blue-400/30 bg-blue-400/10";

  return (
    <Badge variant="outline" className={`${className} uppercase text-[10px]`}>
      {status}
    </Badge>
  );
}
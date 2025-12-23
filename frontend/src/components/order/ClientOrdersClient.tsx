"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  FileText, 
  Trash2, 
  Plus, 
  Package, 
  Calendar,
  MoreHorizontal,
  Download
} from "lucide-react";
import { toast } from "sonner";

import { deleteOrder, downloadOrderPdf } from "@/lib/api";
import { Client } from "@/types/client";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  client: Client;
  orders: any[]; // Wir nennen es hier explizit 'orders', damit es zur page.tsx passt
}

export default function ClientOrdersClient({ client, orders: initialOrders }: Props) {
  const router = useRouter();
  // Wir speichern die orders im State, damit wir sie löschen können ohne Reload
  const [orders, setOrders] = useState(initialOrders || []);

  async function handleDelete(orderId: string) {
    if (!confirm("Delete this order permanently?")) return;

    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success("Order deleted");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete order");
    }
  }

  async function handleDownloadPdf(orderId: string) {
    toast.promise(
      async () => {
        const blob = await downloadOrderPdf(orderId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `production-sheet-${orderId.slice(0, 8)}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      },
      {
        loading: 'Generating PDF...',
        success: 'PDF downloaded!',
        error: 'Failed to generate PDF',
      }
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <span className="bg-zinc-800 text-xs px-2 py-0.5 rounded text-zinc-400">ID: {client.id}</span>
          </p>
        </div>
        
        {/* NEW ORDER BUTTON */}
        <Link href={`/orders/new?clientId=${client.id}`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Order
          </Button>
        </Link>
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Package className="h-5 w-5" /> Order History
        </h2>

        {orders.length === 0 ? (
          <Card className="bg-zinc-900 border-dashed border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-10 w-10 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No orders found for this client.</p>
              <Link href={`/orders/new?clientId=${client.id}`} className="mt-4">
                <Button variant="outline">Create first order</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                <div className="flex items-center p-4 sm:p-6 gap-4">
                  
                  {/* Icon */}
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 grid gap-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">
                            Order #{order.id.slice(0, 8)}
                        </h3>
                        <Badge variant="outline" className="text-xs font-normal">
                            {order.status}
                        </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> 
                            {format(new Date(order.created_at), "dd. MMM yyyy")}
                        </span>
                        <span>•</span>
                        <span>{order.items_count} Items</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                     <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDownloadPdf(order.id)}
                        className="hidden sm:flex"
                     >
                        <Download className="mr-2 h-3 w-3" /> PDF
                     </Button>

                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                             <DropdownMenuItem onClick={() => handleDownloadPdf(order.id)}>
                                <Download className="mr-2 h-4 w-4" /> Download PDF
                             </DropdownMenuItem>
                             <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDelete(order.id)}
                             >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                             </DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
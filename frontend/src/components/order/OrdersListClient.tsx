"use client";

import { useState, useMemo, useEffect } from "react"; // ✅ useEffect importieren
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  Search, 
  Download, 
  Trash2, 
  MoreHorizontal, 
  FileText, 
  Calendar,
  User
} from "lucide-react";
import { toast } from "sonner";
import { deleteOrder, downloadOrderPdf } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  id: string;
  created_at: string;
  status: string;
  clientName: string;
  itemsCount: number;
  client?: { id: string }; // Optional, falls vorhanden
}

interface Props {
  initialOrders: Order[];
}

export default function OrdersListClient({ initialOrders }: Props) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("date-desc");

  // ✅ FIX: Hydration Error vermeiden
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🔍 FILTER & SORT LOGIK
  const filteredAndSorted = useMemo(() => {
    let result = [...orders];

    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(
        (o) =>
          o.clientName.toLowerCase().includes(lowerQuery) ||
          o.id.toLowerCase().includes(lowerQuery)
      );
    }

    result.sort((a, b) => {
      if (sort === "date-desc") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "date-asc") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "client") return a.clientName.localeCompare(b.clientName);
      if (sort === "count-desc") return b.itemsCount - a.itemsCount;
      return 0;
    });

    return result;
  }, [orders, query, sort]);

  // 🗑️ DELETE
  async function handleDelete(id: string) {
    if (!confirm("Delete this order?")) return;
    try {
      await deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      toast.success("Order deleted");
      router.refresh();
    } catch (e) {
      toast.error("Failed to delete order");
    }
  }

  // 📄 DOWNLOAD PDF
  async function handleDownload(id: string) {
    toast.promise(
      async () => {
        const blob = await downloadOrderPdf(id);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `order-${id.slice(0, 8)}.pdf`;
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

  // ✅ Warten bis Client bereit ist, bevor wir rendern
  if (!isMounted) {
    return <div className="p-8 text-center text-muted-foreground">Loading orders...</div>;
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
           <p className="text-muted-foreground">Manage and track all production orders.</p>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by client or order ID..."
            className="pl-9 bg-zinc-900 border-zinc-800"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-[200px]">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="bg-zinc-900 border-zinc-800">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest first</SelectItem>
              <SelectItem value="date-asc">Oldest first</SelectItem>
              <SelectItem value="client">Client (A-Z)</SelectItem>
              <SelectItem value="count-desc">Item Count (High-Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* LIST */}
      <div className="grid gap-3">
        {filteredAndSorted.length === 0 ? (
           <div className="text-center py-12 text-muted-foreground border border-dashed border-zinc-800 rounded-lg">
             No orders found matching your criteria.
           </div>
        ) : (
          filteredAndSorted.map((order) => (
            <Card key={order.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="flex items-center p-4 gap-4">
                
                {/* ICON */}
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>

                {/* INFO MAIN */}
                <div className="flex-1 grid gap-1 md:grid-cols-4 md:gap-4 items-center">
                   
                   {/* 1. ID & Client */}
                   <div className="md:col-span-1">
                      <div className="font-semibold text-white truncate">{order.clientName}</div>
                      <div className="text-xs text-muted-foreground font-mono">#{order.id.slice(0, 8)}</div>
                   </div>

                   {/* 2. Date */}
                   <div className="hidden md:flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-3 w-3" />
                      {format(new Date(order.created_at), "dd. MMM yyyy")}
                   </div>

                   {/* 3. Items Count */}
                   <div className="hidden md:block text-sm text-muted-foreground">
                      {order.itemsCount} Items
                   </div>

                   {/* 4. Status Badge */}
                   <div className="flex justify-start md:justify-end">
                      <Badge variant={order.status === 'production' ? 'default' : 'outline'}>
                        {order.status}
                      </Badge>
                   </div>
                </div>

                {/* ACTIONS */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleDownload(order.id)}>
                      <Download className="mr-2 h-4 w-4" /> Download PDF
                    </DropdownMenuItem>
                    {/* Link zum Client */}
                    {order.client && ( 
                         <DropdownMenuItem asChild>
                            <Link href={`/clients/${order.client.id}`}>
                                <User className="mr-2 h-4 w-4" /> Go to Client
                            </Link>
                         </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600"
                        onClick={() => handleDelete(order.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
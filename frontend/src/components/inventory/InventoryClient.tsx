"use client";

import { useState, useMemo } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Package, 
  Plus, 
  Minus, 
  Trash2,
  Tag,
  Barcode
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { updateInventoryQuantity, deleteInventoryItem } from "@/lib/api";
// NEU: Importiere den Dialog
import CreateInventoryItemDialog from "./CreateInventoryItemDialog";

type InventoryItem = {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  quantity: number;
  min_quantity?: number;
};

type Props = {
  initialInventory: InventoryItem[];
};

export default function InventoryClient({ initialInventory }: Props) {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory || []);
  const [query, setQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // 🔍 Filter Logik
  const filteredInventory = useMemo(() => {
    const q = query.toLowerCase();
    if (!inventory) return [];
    
    return inventory.filter((item) => {
      const matchName = item.name?.toLowerCase().includes(q);
      const matchSku = item.sku?.toLowerCase().includes(q);
      const matchCategory = item.category?.toLowerCase().includes(q);
      return matchName || matchSku || matchCategory;
    });
  }, [inventory, query]);

  // 🔄 Callback wenn neues Item erstellt wurde
  const handleItemCreated = (newItem: InventoryItem) => {
    setInventory((prev) => [newItem, ...prev]);
  };

  // 🔄 Update Menge
  async function handleUpdateQuantity(id: string, currentQty: number, change: number) {
    const newQty = currentQty + change;
    if (newQty < 0) return;

    setLoadingId(id);
    try {
      await updateInventoryQuantity(id, newQty);
      
      setInventory((prev) => 
        prev.map((item) => item.id === id ? { ...item, quantity: newQty } : item)
      );
      toast.success("Stock updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update stock");
    } finally {
      setLoadingId(null);
    }
  }

  // 🗑️ Löschen
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this inventory item?")) return;
    
    setLoadingId(id);
    try {
      await deleteInventoryItem(id);
      setInventory((prev) => prev.filter((item) => item.id !== id));
      toast.success("Item deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete item");
    } finally {
      setLoadingId(null);
    }
  }

  const getStockStatus = (qty: number, minQty: number = 10) => {
    if (qty === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (qty < minQty) return <Badge variant="secondary" className="text-orange-600 bg-orange-50 hover:bg-orange-100">Low Stock</Badge>;
    return <Badge variant="outline" className="text-green-600 bg-green-50">In Stock</Badge>;
  };

  return (
    <div className="w-full px-6 md:px-10 py-8 space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" /> Inventory Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your raw materials and product stock levels.
          </p>
        </div>
        
        {/* NEU: Hier ist jetzt der Button! */}
        <CreateInventoryItemDialog onItemCreated={handleItemCreated} />
      </div>

      <div className="space-y-4">
        
        {/* SEARCH */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU or category..."
            className="pl-10 bg-card"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Item Name</TableHead>
                <TableHead className="w-[15%]">SKU / Code</TableHead>
                <TableHead className="w-[15%]">Category</TableHead>
                <TableHead className="w-[20%]">Stock Level</TableHead>
                <TableHead className="w-[15%]">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No items found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.name || "Unnamed Item"}
                    </TableCell>
                    
                    <TableCell>
                      {item.sku ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Barcode className="h-3 w-3" />
                          <span className="font-mono">{item.sku}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {item.category ? (
                         <div className="flex items-center gap-2">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            <Badge variant="secondary" className="font-normal text-xs">
                                {item.category}
                            </Badge>
                         </div>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8"
                          disabled={loadingId === item.id || item.quantity <= 0}
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className={`w-12 text-center font-mono font-medium ${item.quantity < (item.min_quantity || 10) ? 'text-orange-600' : ''}`}>
                          {item.quantity}
                        </span>

                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8"
                          disabled={loadingId === item.id}
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>

                    <TableCell>
                      {getStockStatus(item.quantity, item.min_quantity)}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-red-600"
                        onClick={() => handleDelete(item.id)}
                        disabled={loadingId === item.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="text-xs text-muted-foreground text-center">
          Showing {filteredInventory.length} items
        </div>

      </div>
    </div>
  );
}
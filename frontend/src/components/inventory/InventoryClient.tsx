"use client";

import { useState, useMemo, useEffect } from "react";
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
  Barcode,
  RefreshCw,
  Loader2,
  Edit
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  updateInventoryQuantity, 
  deleteInventoryItem, 
  syncInventory, 
  getInventory 
} from "@/lib/api";
import CreateInventoryItemDialog from "./CreateInventoryItemDialog";
// ✅ NEU: Import des Edit-Dialogs
import EditInventoryItemDialog from "./EditInventoryItemDialog";

type InventoryItem = {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  quantity: number;
  min_quantity?: number;
  branch?: string;
  fabric?: string;
  // Weitere Felder für den Dialog:
  gsm?: string;
  fit?: string;
  gender?: string;
};

type Props = {
  initialInventory: InventoryItem[];
};

export default function InventoryClient({ initialInventory }: Props) {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory || []);
  const [query, setQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // ✅ NEU: State für den Edit-Modus
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // 🔄 Daten vom Server frisch laden
  async function refreshData() {
    try {
      const data = await getInventory();
      setInventory(data);
    } catch (error) {
      console.error("Refresh failed", error);
    }
  }

  // 🔍 Filter Logik
  const filteredInventory = useMemo(() => {
    const q = query.toLowerCase();
    if (!inventory) return [];
    
    return inventory.filter((item) => {
      const matchName = item.name?.toLowerCase().includes(q);
      const matchSku = item.sku?.toLowerCase().includes(q);
      const matchCategory = item.category?.toLowerCase().includes(q);
      const matchFabric = item.fabric?.toLowerCase().includes(q);
      return matchName || matchSku || matchCategory || matchFabric;
    });
  }, [inventory, query]);

  // 🔄 Sync mit Produktkatalog
  async function handleSync() {
    setSyncing(true);
    try {
      const result = await syncInventory();
      await refreshData();
      
      if (result.count > 0) {
        toast.success(`${result.count} neue Produkte ins Lager übernommen!`);
      } else {
        toast.info("Lager ist bereits auf dem neuesten Stand.");
      }
    } catch (error) {
      toast.error("Synchronisierung fehlgeschlagen.");
    } finally {
      setSyncing(false);
    }
  }

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
      toast.success("Bestand aktualisiert");
    } catch (error) {
      toast.error("Fehler beim Update");
    } finally {
      setLoadingId(null);
    }
  }

  // 🗑️ Löschen
  async function handleDelete(id: string) {
    if (!confirm("Item wirklich aus dem Lager entfernen?")) return;
    
    setLoadingId(id);
    try {
      await deleteInventoryItem(id);
      setInventory((prev) => prev.filter((item) => item.id !== id));
      toast.success("Item entfernt");
    } catch (error) {
      toast.error("Löschen fehlgeschlagen");
    } finally {
      setLoadingId(null);
    }
  }

  // ✅ NEU: Handler zum Öffnen des Edit-Dialogs
  function openEditDialog(item: InventoryItem) {
    setEditingItem(item);
    setIsEditOpen(true);
  }

  const getStockStatus = (qty: number, minQty: number = 10) => {
    if (qty === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (qty <= minQty) return <Badge variant="secondary" className="text-orange-600 bg-orange-50">Low Stock</Badge>;
    return <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">In Stock</Badge>;
  };

  return (
    <div className="w-full px-6 md:px-10 py-8 space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" /> Inventory
          </h1>
          <p className="text-muted-foreground mt-2">
            Verwalte Bestände und synchronisiere sie mit deinem Produktkatalog.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleSync} 
            disabled={syncing}
            className="gap-2"
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Sync with Catalog
          </Button>

          <CreateInventoryItemDialog onItemCreated={refreshData} />
        </div>
      </div>

      <div className="space-y-4">
        
        {/* SEARCH */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Name, SKU, Stoff oder Kategorie..."
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
                <TableHead>SKU / Code</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Keine Einträge gefunden.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{item.name || "Unnamed Item"}</span>
                        {item.branch && <span className="text-[10px] text-muted-foreground uppercase">{item.branch}</span>}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {item.sku ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                          <Barcode className="h-3 w-3" />
                          {item.sku}
                        </div>
                      ) : "-"}
                    </TableCell>
                    
                    <TableCell>
                       <div className="flex flex-col gap-1">
                          {item.category && (
                            <div className="flex items-center gap-1 text-[11px]">
                               <Tag size={10} /> {item.category}
                            </div>
                          )}
                          {item.fabric && <span className="text-[10px] text-muted-foreground italic truncate max-w-[100px]">{item.fabric}</span>}
                       </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7"
                          disabled={loadingId === item.id || item.quantity <= 0}
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className={`w-8 text-center font-mono font-bold ${item.quantity <= (item.min_quantity || 10) ? 'text-orange-600' : ''}`}>
                          {item.quantity}
                        </span>

                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7"
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
                      {/* ✅ NEU: Edit Button öffnet Dialog */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-blue-600 mr-1"
                        onClick={() => openEditDialog(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

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
      </div>

      {/* ✅ NEU: Edit Dialog Component */}
      <EditInventoryItemDialog 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        item={editingItem} 
        onItemUpdated={refreshData} 
      />

    </div>
  );
}
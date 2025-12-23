"use client";

import { useState } from "react";
import { 
  Box, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Search,
  MinusCircle,
  PlusCircle
} from "lucide-react";
import { toast } from "sonner";
import { addInventoryItem, updateInventoryQuantity, deleteInventoryItem } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  min_quantity: number;
}

export default function InventoryClient({ initialItems }: { initialItems: InventoryItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false); // Modal state

  // Form State
  const [newItem, setNewItem] = useState({ name: "", category: "General", sku: "", quantity: 0, min_quantity: 5 });

  // 🔍 FILTER
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) || 
    item.sku?.toLowerCase().includes(query.toLowerCase())
  );

  // ➕ CREATE
  async function handleCreate() {
    if (!newItem.name) return toast.error("Name is required");
    try {
      const created = await addInventoryItem(newItem);
      setItems([...items, created]);
      setIsOpen(false);
      setNewItem({ name: "", category: "General", sku: "", quantity: 0, min_quantity: 5 });
      toast.success("Item added to inventory");
    } catch (e) {
      toast.error("Failed to add item");
    }
  }

  // 🔢 UPDATE STOCK
  async function handleUpdateStock(id: string, current: number, change: number) {
    const newQty = Math.max(0, current + change);
    // Optimistic Update
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));
    
    try {
      await updateInventoryQuantity(id, newQty);
    } catch (e) {
      toast.error("Failed to update stock");
      // Rollback wäre hier sauberer, aber für MVP ok
    }
  }

  // 🗑️ DELETE
  async function handleDelete(id: string) {
    if (!confirm("Remove item from inventory?")) return;
    try {
      await deleteInventoryItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success("Item removed");
    } catch (e) {
      toast.error("Failed to delete item");
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Box className="h-8 w-8" /> Inventory
          </h1>
          <p className="text-muted-foreground">Track raw materials and stock levels.</p>
        </div>

        {/* ADD DIALOG */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Item Name</Label>
                <Input value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="e.g. Black T-Shirt XL" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                   <Label>Category</Label>
                   <Input value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} placeholder="e.g. Blanks" />
                </div>
                <div className="grid gap-2">
                   <Label>SKU (Optional)</Label>
                   <Input value={newItem.sku} onChange={e => setNewItem({...newItem, sku: e.target.value})} placeholder="e.g. TS-BLK-XL" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                   <Label>Initial Quantity</Label>
                   <Input type="number" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} />
                </div>
                <div className="grid gap-2">
                   <Label>Low Stock Warning</Label>
                   <Input type="number" value={newItem.min_quantity} onChange={e => setNewItem({...newItem, min_quantity: Number(e.target.value)})} />
                </div>
              </div>
              <Button onClick={handleCreate} className="mt-2">Save Item</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          className="pl-9 bg-zinc-900 border-zinc-800 w-full md:w-[300px]" 
          placeholder="Search items..." 
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {/* LIST */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const isLow = item.quantity <= item.min_quantity;
          
          return (
            <Card key={item.id} className={`bg-zinc-900 border-zinc-800 ${isLow ? 'border-red-900/50 bg-red-950/10' : ''}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                      {item.sku && <span className="font-mono text-xs opacity-50">{item.sku}</span>}
                    </div>
                  </div>
                  {isLow && (
                    <div className="flex items-center text-red-500 text-xs font-bold border border-red-500/20 bg-red-500/10 px-2 py-1 rounded">
                      <AlertTriangle className="h-3 w-3 mr-1" /> LOW
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-6">
                   <div className="text-3xl font-bold tabular-nums">
                     {item.quantity}
                   </div>
                   
                   <div className="flex items-center gap-2">
                     <Button 
                        variant="outline" size="icon" className="h-8 w-8"
                        onClick={() => handleUpdateStock(item.id, item.quantity, -1)}
                     >
                       <MinusCircle className="h-4 w-4" />
                     </Button>
                     <Button 
                        variant="outline" size="icon" className="h-8 w-8"
                        onClick={() => handleUpdateStock(item.id, item.quantity, 1)}
                     >
                       <PlusCircle className="h-4 w-4" />
                     </Button>
                     <div className="w-px h-6 bg-zinc-800 mx-1"></div>
                     <Button 
                        variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => handleDelete(item.id)}
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  );
}
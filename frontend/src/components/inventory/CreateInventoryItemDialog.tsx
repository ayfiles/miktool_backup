"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { addInventoryItem, getProducts } from "@/lib/api";
import { Product } from "@/types/product";

type Props = {
  onItemCreated: (item: any) => void;
};

export default function CreateInventoryItemDialog({ onItemCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // ✅ FIX: Hydration Error verhindern
  // Diese Zeilen sind entscheidend!
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Produkte für das Dropdown
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: "0",
    min_quantity: "10"
  });

  // Lade Produkte, wenn der Dialog aufgeht
  useEffect(() => {
    if (open) {
      loadProducts();
    }
  }, [open]);

  async function loadProducts() {
    try {
      const data = await getProducts();
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to load products", error);
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProductId(productId);
      setFormData(prev => ({
        ...prev,
        name: product.name, 
        sku: product.id.slice(0, 8).toUpperCase(),
        category: "Finished Good"
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Item name is required");

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        quantity: parseInt(formData.quantity) || 0,
        min_quantity: parseInt(formData.min_quantity) || 10,
        product_id: selectedProductId || undefined
      };

      const newItem = await addInventoryItem(payload);
      
      toast.success("Item linked & added to inventory");
      onItemCreated(newItem); 
      setOpen(false);
      
      setFormData({ name: "", sku: "", category: "", quantity: "0", min_quantity: "10" });
      setSelectedProductId(null);

    } catch (error: any) {
      toast.error(error.message || "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  // ✅ WICHTIG: Wenn die Komponente noch nicht auf dem Client ist, 
  // rendern wir NUR den Button. Das verhindert den ID-Konflikt mit dem Server.
  if (!isMounted) {
    return (
      <Button>
        <Plus className="mr-2 h-4 w-4" /> Add Item
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Inventory Item</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          <div className="grid gap-2 bg-muted/30 p-3 rounded border border-dashed">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Link to Product (Optional)</Label>
            <Select onValueChange={handleProductSelect}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select a product from database..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProductId && (
               <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                 <LinkIcon size={12} /> Linked to Product ID: {selectedProductId.slice(0,8)}...
               </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input 
              id="name" 
              placeholder="e.g. T-Shirt Heavy Cotton" 
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="sku">SKU / Code</Label>
              <Input 
                id="sku" 
                placeholder="TS-BLK-L" 
                value={formData.sku}
                onChange={(e) => handleChange("sku", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input 
                id="category" 
                placeholder="Raw Material" 
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity">Initial Stock</Label>
              <Input 
                id="quantity" 
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="min_quantity">Low Stock Warning</Label>
              <Input 
                id="min_quantity" 
                type="number"
                min="0"
                value={formData.min_quantity}
                onChange={(e) => handleChange("min_quantity", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Item
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}
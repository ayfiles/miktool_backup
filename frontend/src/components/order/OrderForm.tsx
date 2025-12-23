"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/lib/api"; // ✅ FIX: Importiert jetzt die sichere Funktion
import { Product } from "@/types/product";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner"; // ✅ NEU: Toasts statt Text-Fehler

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type BrandingMethod = "print" | "embroidery";
type BrandingPosition = "front" | "back";

interface OrderItem {
  productId: string;
  color: string;
  size: string;
  quantity: number;
  branding: {
    method: BrandingMethod;
    position: BrandingPosition;
  };
}

interface Props {
  products: Product[];
  clientId: string | null;
}

export default function OrderForm({ products, clientId }: Props) {
  const router = useRouter();
  
  /* --- Temporary item selection --- */
  const [productId, setProductId] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [method, setMethod] = useState<BrandingMethod>("print");
  const [position, setPosition] = useState<BrandingPosition>("front");

  /* --- Order state --- */
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  // error state entfernt -> wir nutzen jetzt Toasts!

  const selectedProduct = products.find((p) => p.id === productId);

  function getProduct(id: string) {
    return products.find((p) => p.id === id);
  }

  /* --- Logic --- */
  function addItem() {
    if (!productId || !color || !size || quantity < 1) {
      toast.error("Please select product, color, size and quantity."); // ✅ Toast Error
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        productId,
        color,
        size,
        quantity,
        branding: { method, position },
      },
    ]);

    // Reset fields (keeping product for faster entry)
    setColor("");
    setSize("");
    setQuantity(1);
    toast.success("Item added to list"); // Optional: Kleines Feedback
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    toast.info("Item removed");
  }

  /* --- SUBMIT --- */
  async function submitOrder() {
    if (!clientId) {
      toast.error("No client selected.");
      return;
    }

    if (items.length === 0) {
      toast.error("Add at least one item.");
      return;
    }

    setLoading(true);

    try {
      // ✅ FIX: Wir nutzen jetzt createOrder() statt fetch()
      await createOrder({
        clientId,
        items: items.map((i) => ({
          productId: i.productId,
          color: i.color,
          size: i.size,
          quantity: i.quantity,
          branding: i.branding,
        })),
      });

      // ✅ Success Feedback
      toast.success("Order created successfully! 🎉");

      // Nach Erfolg zurück zur Client-Seite
      router.refresh();
      router.push(`/clients/${clientId}`);
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to create order. Please try again."); // ✅ Error Feedback
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">New Order</h2>
        <p className="text-muted-foreground">Add items to create a production sheet.</p>
      </div>

      {/* 1. ADD PRODUCT CARD */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg">Add Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Product Select */}
          <div className="space-y-2">
            <Label>Product</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select product..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProduct && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              
              {/* Color */}
              <div className="space-y-2">
                <Label>Color</Label>
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProduct.available_colors.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <Label>Size</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProduct.available_sizes.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input 
                  type="number" 
                  min={1} 
                  value={quantity} 
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="bg-zinc-950 border-zinc-700"
                />
              </div>

              {/* Branding */}
              <div className="space-y-2">
                <Label>Method</Label>
                <Select value={method} onValueChange={(v: any) => setMethod(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="print">Print</SelectItem>
                    <SelectItem value="embroidery">Embroidery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

        </CardContent>
        <CardFooter>
          <Button onClick={addItem} className="w-full" disabled={!selectedProduct}>
            <Plus className="mr-2 h-4 w-4" /> Add to List
          </Button>
        </CardFooter>
      </Card>

      {/* 2. ITEM LIST */}
      {items.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Order Items ({items.length})</h3>
          </div>
          
          <div className="space-y-2">
            {items.map((item, i) => {
               const p = getProduct(item.productId);
               return (
                 <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                   <div>
                     <div className="font-medium text-white">{p?.name}</div>
                     <div className="text-sm text-zinc-400">
                       {item.color} • {item.size} • {item.branding.method}
                     </div>
                   </div>
                   <div className="flex items-center gap-4">
                     <div className="font-mono text-lg font-bold">x{item.quantity}</div>
                     <Button variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </div>
                 </div>
               )
            })}
          </div>

          <Separator className="my-6 bg-zinc-800" />

          {/* 3. SUBMIT BUTTON */}
          <Button size="lg" className="w-full text-md" onClick={submitOrder} disabled={loading}>
            {loading ? (
              "Saving..." 
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Create Order
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
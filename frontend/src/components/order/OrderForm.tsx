"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/lib/api"; 
import { Product } from "@/types/product";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react"; // ArrowLeft neu
import { toast } from "sonner"; 
import Link from "next/link"; // Link neu

// UI Components
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

  const selectedProduct = products.find((p) => p.id === productId);

  function getProduct(id: string) {
    return products.find((p) => p.id === id);
  }

  /* --- Logic --- */
  function addItem() {
    if (!productId || !color || !size || quantity < 1) {
      toast.error("Please select product, color, size and quantity."); 
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

    // Reset fields (aber Produkt lassen für schnellere Eingabe)
    // setColor(""); // Optional
    setQuantity(1);
    toast.success("Item added to list");
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

      toast.success("Order created successfully! 🎉");

      // Redirect zurück zum Kunden
      router.refresh();
      router.push(`/clients/${clientId}`);
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!clientId) {
      return <div className="p-8 text-center">Error: No Client ID provided.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* HEADER MIT BACK BUTTON */}
      <div className="flex items-center gap-4">
        <Link href={`/clients/${clientId}`}>
            <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
            </Button>
        </Link>
        <div>
            <h2 className="text-3xl font-bold tracking-tight">New Order</h2>
            <p className="text-muted-foreground">Add items to create a production sheet.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_320px]">
        
        {/* LEFT COLUMN: Add Items & List */}
        <div className="space-y-6">
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
                            <SelectItem key={c} value={c}>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full border border-white/20" style={{ backgroundColor: c }}></div>
                                    {c}
                                </div>
                            </SelectItem>
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

            {/* ITEM LIST PREVIEW */}
            {items.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold px-1">Items in Cart</h3>
                    {items.map((item, i) => {
                    const p = getProduct(item.productId);
                    return (
                        <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg animate-in fade-in">
                            <div>
                                <div className="font-medium text-white">{p?.name}</div>
                                <div className="text-sm text-zinc-400 flex flex-wrap gap-2 mt-1">
                                    <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs">{item.color}</span>
                                    <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs">{item.size}</span>
                                    <span className="capitalize text-zinc-500 text-xs flex items-center">{item.branding.method}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="font-mono text-lg font-bold">x{item.quantity}</div>
                                <Button variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )
                    })}
                </div>
            )}
        </div>

        {/* RIGHT COLUMN: Summary & Action */}
        <div className="space-y-6">
             <Card className="bg-zinc-900 border-zinc-800 sticky top-8">
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between text-sm mb-4">
                        <span className="text-muted-foreground">Total Items</span>
                        <span className="font-mono text-lg">{items.reduce((acc, i) => acc + i.quantity, 0)}</span>
                    </div>
                    <Separator className="bg-zinc-800 my-4" />
                    <Button size="lg" className="w-full" onClick={submitOrder} disabled={loading || items.length === 0}>
                        {loading ? "Saving..." : (
                        <>
                            <Save className="mr-2 h-4 w-4" /> Create Order
                        </>
                        )}
                    </Button>
                </CardContent>
             </Card>
        </div>

      </div>
    </div>
  );
}
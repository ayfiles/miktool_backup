"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/lib/api"; 
import { Product } from "@/types/product";
import { Client } from "@/types/client";
import { Plus, Trash2, Save, ArrowLeft, User } from "lucide-react";
import { toast } from "sonner"; 
import Link from "next/link";

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
  clients: Client[];
  initialClientId: string | null;
  isDialog?: boolean;
  onSuccess?: () => void;
}

export default function OrderForm({ 
  products, 
  clients = [], 
  initialClientId, 
  isDialog = false,
  onSuccess 
}: Props) {
  const router = useRouter();
  
  const [selectedClientId, setSelectedClientId] = useState<string>(initialClientId || "");
  const [productId, setProductId] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [method, setMethod] = useState<BrandingMethod>("print");
  const [position, setPosition] = useState<BrandingPosition>("front");

  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedProduct = products.find((p) => p.id === productId);

  // 👇 DEBUGGING: Hier prüfen wir, was wirklich ankommt
  if (selectedProduct) {
      console.log("--- DEBUG ORDER FORM ---");
      console.log("Selected Product:", selectedProduct.name);
      console.log("Available Colors (Product Level):", selectedProduct.available_colors);
      console.log("Inventory Array (Backend Data):", selectedProduct.inventory);
  }

  // 🟢 Smarte Berechnung der verfügbaren Optionen
  const availableOptions = useMemo(() => {
    if (!selectedProduct) return { colors: [], sizes: [] };

    // 1. Farben aus dem Inventory sammeln (Unique Values)
    let invColors = new Set<string>();
    let invSizes = new Set<string>();

    if (selectedProduct.inventory && selectedProduct.inventory.length > 0) {
        selectedProduct.inventory.forEach((item: any) => {
            if (item.color) invColors.add(item.color);
            if (item.size) invSizes.add(item.size);
        });
    }

    // 2. Fallback auf die Produkt-Felder, falls Inventory leer ist
    const finalColors = invColors.size > 0 
        ? Array.from(invColors) 
        : (selectedProduct.available_colors || []);

    const finalSizes = invSizes.size > 0 
        ? Array.from(invSizes) 
        : (selectedProduct.available_sizes || []);
    
    // Kleines Extra-Debug für die berechneten Werte
    console.log("Calculated Options -> Colors:", finalColors, "Sizes:", finalSizes);

    return { colors: finalColors, sizes: finalSizes };
  }, [selectedProduct]);


  function addItem() {
    // Validierung: Wir erlauben das Hinzufügen nur, wenn Optionen gewählt wurden
    // ODER wenn das Produkt gar keine Optionen hat (z.B. One-Size ohne Farbe)
    const needsColor = availableOptions.colors.length > 0;
    const needsSize = availableOptions.sizes.length > 0;

    if (needsColor && !color) {
        toast.error("Please select a color.");
        return;
    }
    if (needsSize && !size) {
        toast.error("Please select a size.");
        return;
    }
    if (quantity < 1) {
      toast.error("Quantity must be at least 1."); 
      return;
    }

    setItems((prev) => [
      ...prev,
      { 
          productId, 
          color: color || "N/A", // Fallback für Anzeige 
          size: size || "N/A", 
          quantity, 
          branding: { method, position } 
      },
    ]);
    setQuantity(1);
    toast.success("Item added to list");
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    toast.info("Item removed");
  }

  async function submitOrder() {
    if (!selectedClientId) {
      toast.error("Please select a client first!");
      return;
    }
    if (items.length === 0) {
      toast.error("Add at least one item.");
      return;
    }

    setLoading(true);

    try {
      await createOrder({
        clientId: selectedClientId,
        items: items.map((i) => ({
          productId: i.productId,
          color: i.color,
          size: i.size,
          quantity: i.quantity,
          branding: i.branding,
        })),
      });

      toast.success("Order created successfully! 🎉");
      router.refresh(); 

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/clients/${selectedClientId}`);
      }
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const backHref = initialClientId ? `/clients/${initialClientId}` : "/orders";

  return (
    <div className={isDialog ? "space-y-6" : "max-w-4xl mx-auto space-y-8 pb-20"}>
      
      {!isDialog && (
        <div className="flex items-center gap-4">
            <Link href={backHref}>
                <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <div>
                <h2 className="text-3xl font-bold tracking-tight">New Order</h2>
                <p className="text-muted-foreground">Add items to create a production sheet.</p>
            </div>
        </div>
      )}

      <div className={`grid gap-6 ${isDialog ? 'grid-cols-1' : 'md:grid-cols-[1fr_320px]'}`}>
        
        <div className="space-y-6">

            {!initialClientId && (
                <Card className="bg-zinc-900 border-zinc-800 border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-500" />
                            Select Client
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                            <SelectTrigger className="bg-zinc-950 border-zinc-700 h-10">
                                <SelectValue placeholder="Search or select a client..." />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            )}

            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Add Item</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                            
                            {/* COLOR SELECT */}
                            <div className="space-y-2">
                                <Label>Color</Label>
                                <Select value={color} onValueChange={setColor} disabled={availableOptions.colors.length === 0}>
                                <SelectTrigger>
                                    <SelectValue placeholder={availableOptions.colors.length > 0 ? "Select..." : "None"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableOptions.colors.map((c) => (
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

                            {/* SIZE SELECT */}
                            <div className="space-y-2">
                                <Label>Size</Label>
                                <Select value={size} onValueChange={setSize} disabled={availableOptions.sizes.length === 0}>
                                <SelectTrigger>
                                    <SelectValue placeholder={availableOptions.sizes.length > 0 ? "Select..." : "None"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableOptions.sizes.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="bg-zinc-950 border-zinc-700" />
                            </div>
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

            {items.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold px-1">Items in Cart</h3>
                    {items.map((item, i) => {
                    const p = products.find((p) => p.id === item.productId);
                    return (
                        <div key={i} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg animate-in fade-in text-sm">
                            <div>
                                <div className="font-medium text-white">{p?.name}</div>
                                <div className="text-zinc-400 flex gap-2 mt-1">
                                    <span className="bg-zinc-800 px-1.5 rounded">{item.color}</span>
                                    <span className="bg-zinc-800 px-1.5 rounded">{item.size}</span>
                                    <span className="capitalize">{item.branding.method}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="font-mono font-bold">x{item.quantity}</div>
                                <Button variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-red-400 h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )
                    })}
                </div>
            )}
        </div>

        <div className="space-y-6">
             <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between text-sm mb-4">
                        <span className="text-muted-foreground">Total Items</span>
                        <span className="font-mono text-lg">{items.reduce((acc, i) => acc + i.quantity, 0)}</span>
                    </div>
                    
                    {!selectedClientId && (
                        <div className="mb-4 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-500 text-xs">
                            Select a client to finish.
                        </div>
                    )}

                    <Separator className="bg-zinc-800 my-4" />
                    <Button 
                        size="lg" 
                        className="w-full" 
                        onClick={submitOrder} 
                        disabled={loading || items.length === 0 || !selectedClientId}
                    >
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
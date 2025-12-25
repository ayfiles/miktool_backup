"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateInventoryItem } from "@/lib/api";
import { toast } from "sonner";
import { Package, Save, AlertTriangle } from "lucide-react";
import { Product } from "@/types/product";

interface Props {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void; // Um die Liste neu zu laden
}

export default function ProductStockDialog({ product, open, onClose, onUpdate }: Props) {
  const [loading, setLoading] = useState<string | null>(null); // ID des Items, das gerade lädt
  
  // Wir nutzen direkt das Inventory-Array aus dem Produkt-Objekt
  // (Das wird durch getAllProducts() mitgeliefert)
  const inventory = product?.inventory || [];

  const handleQuantityChange = async (itemId: string, newQty: number) => {
    setLoading(itemId);
    try {
      await updateInventoryItem(itemId, { quantity: newQty });
      toast.success("Bestand aktualisiert");
      onUpdate(); // Liste im Hintergrund neu laden
    } catch (e) {
      toast.error("Fehler beim Speichern");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             <Package className="h-5 w-5 text-blue-500" />
             Lagerbestand verwalten: <span className="text-muted-foreground">{product?.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
            {inventory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                    Keine Lagerplätze für dieses Produkt gefunden.
                </div>
            ) : (
                <div className="grid gap-2">
                    {/* Header */}
                    <div className="grid grid-cols-4 text-sm font-semibold text-muted-foreground px-2">
                        <div>Farbe</div>
                        <div>Größe</div>
                        <div>Aktuell</div>
                        <div>Aktion</div>
                    </div>

                    {/* Liste der Varianten */}
                    {inventory.map((item) => (
                        <div key={item.id} className="grid grid-cols-4 items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-border">
                            
                            {/* Farbe */}
                            <div className="flex items-center gap-2">
                                {item.color ? (
                                    <>
                                        <div className="h-3 w-3 rounded-full border shadow-sm" style={{ backgroundColor: item.color }}></div>
                                        <span>{item.color}</span>
                                    </>
                                ) : <span className="text-muted-foreground">-</span>}
                            </div>

                            {/* Größe */}
                            <div className="font-mono">
                                {item.size || <span className="text-muted-foreground">-</span>}
                            </div>

                            {/* Input für Menge */}
                            <div>
                                <Input 
                                    type="number" 
                                    defaultValue={item.quantity} 
                                    className="h-8 w-24 text-right font-mono"
                                    onBlur={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (val !== item.quantity) handleQuantityChange(item.id, val);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const val = parseInt(e.currentTarget.value);
                                            handleQuantityChange(item.id, val);
                                            e.currentTarget.blur();
                                        }
                                    }}
                                />
                            </div>

                            {/* Status Info */}
                            <div className="text-xs text-muted-foreground flex items-center">
                                {loading === item.id ? (
                                    <span className="animate-pulse text-blue-500">Speichert...</span>
                                ) : (item.min_quantity && item.quantity <= item.min_quantity) ? (
                                    <span className="text-amber-500 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> Low Stock
                                    </span>
                                ) : (
                                    <span>OK</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="flex justify-end border-t pt-4">
            <Button onClick={onClose}>Fertig</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
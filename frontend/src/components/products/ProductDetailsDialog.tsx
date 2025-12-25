"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { updateProduct } from "@/lib/api";
import { createBrowserClient } from "@supabase/ssr";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Box, UploadCloud, ImageIcon, Layers, Tag, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import ProductImageTint from "./ProductImageTint";
import ProductVariantImages from "./ProductVariantImages";
import ProductStockDialog from "./ProductStockDialog"; // Integrieren wir direkt
import { getColorHex } from "@/lib/colorUtils";

interface Props {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ProductDetailsDialog({ product, open, onClose, onUpdate }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});
  
  // Image State
  const [previewColor, setPreviewColor] = useState("White");
  
  // Sub-Dialogs
  const [isStockOpen, setIsStockOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData(product);
      if (product.available_colors && product.available_colors.length > 0) {
        setPreviewColor(product.available_colors[0]);
      }
    }
  }, [product]);

  if (!product) return null;

  const handleChange = (field: keyof Product, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProduct(product.id, formData);
      toast.success("Produkt aktualisiert!");
      onUpdate();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Speichern");
    } finally {
      setIsLoading(false);
    }
  };

  // HYBRID BILD LOGIK (Kennen wir schon)
  const realAsset = product.product_assets?.find(
    asset => asset.color === previewColor && asset.view === 'front'
  );
  const baseImageToTint = product.image_front_url;

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-zinc-50/50 dark:bg-zinc-950/50 backdrop-blur-xl">
        
        {/* Header Area */}
        <div className="p-6 border-b bg-background/50 sticky top-0 z-10 backdrop-blur-md flex justify-between items-center">
            <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    {formData.name}
                    <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                        {product.branch || "General"}
                    </Badge>
                </DialogTitle>
                <DialogDescription>
                    Produkt-Details bearbeiten & Inventar verwalten.
                </DialogDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>Abbrechen</Button>
                <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Speichern
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
            
            {/* ================= LEFT COLUMN: VISUALS (4 Cols) ================= */}
            <div className="md:col-span-5 flex flex-col gap-4">
                
                {/* 1. Main Image Card */}
                <div className="bg-background border rounded-xl overflow-hidden shadow-sm aspect-[4/5] relative group">
                    <div className="absolute top-3 left-3 z-10">
                         <Badge variant={product.isLowStock ? "destructive" : "secondary"} className="shadow-sm">
                            {product.stock} Stk. Lagernd
                         </Badge>
                    </div>
                    
                    <div className="w-full h-full flex items-center justify-center p-6 bg-white dark:bg-zinc-900">
                         {realAsset ? (
                            <div className="relative w-full h-full animate-in fade-in duration-300">
                                <Image src={realAsset.base_image} alt="Product" fill className="object-contain" />
                                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-[10px] rounded backdrop-blur-md">
                                    Original Foto
                                </div>
                            </div>
                         ) : baseImageToTint ? (
                            <div className="relative w-full h-full animate-in fade-in duration-300">
                                <ProductImageTint 
                                    src={baseImageToTint} 
                                    colorName={previewColor} 
                                    alt="Preview" 
                                    className="w-full h-full" 
                                />
                                <div className="absolute bottom-2 right-2 px-2 py-1 bg-blue-500/80 text-white text-[10px] rounded backdrop-blur-md">
                                    Auto-Preview
                                </div>
                            </div>
                         ) : (
                            <div className="text-zinc-300 font-bold text-6xl">{product.name.substring(0,2)}</div>
                         )}
                    </div>

                    {/* Quick Image Actions Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                        <ProductVariantImages product={product} />
                    </div>
                </div>

                {/* 2. Color Selector Box */}
                <div className="bg-background border rounded-xl p-4 shadow-sm">
                    <Label className="text-xs text-muted-foreground uppercase font-bold mb-3 block">Verfügbare Farben</Label>
                    <div className="flex flex-wrap gap-2">
                        {product.available_colors.map((color) => {
                             const isReal = product.product_assets?.some(a => a.color === color && a.view === 'front');
                             return (
                                <button
                                    key={color}
                                    onClick={() => setPreviewColor(color)}
                                    className={`
                                        w-8 h-8 rounded-full border shadow-sm transition-all relative
                                        ${previewColor === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'}
                                    `}
                                    style={{ backgroundColor: getColorHex(color) }}
                                    title={color}
                                >
                                    {isReal && <div className="absolute inset-0 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm"/></div>}
                                </button>
                             )
                        })}
                    </div>
                </div>

            </div>


            {/* ================= RIGHT COLUMN: DATA (8 Cols) ================= */}
            <div className="md:col-span-7 flex flex-col gap-4">

                {/* Box 1: General Info */}
                <div className="bg-background border rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase border-b pb-2">
                        <Tag className="w-4 h-4" /> Basis Informationen
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Produkt Name</Label>
                            <Input value={formData.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Kategorie</Label>
                            <Input value={formData.category || ""} onChange={(e) => handleChange("category", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Preis (Netto €)</Label>
                            <Input 
                                type="number" 
                                value={formData.base_price || ""} 
                                onChange={(e) => handleChange("base_price", parseFloat(e.target.value))} 
                                className="font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Branche</Label>
                            <Input value={formData.branch || ""} onChange={(e) => handleChange("branch", e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Beschreibung</Label>
                        <Textarea 
                            rows={3} 
                            value={formData.description || ""} 
                            onChange={(e) => handleChange("description", e.target.value)} 
                            className="resize-none"
                        />
                    </div>
                </div>

                {/* Box 2: Tech Specs */}
                <div className="bg-background border rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase border-b pb-2">
                        <Layers className="w-4 h-4" /> Technische Details
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Material</Label>
                            <Input value={formData.fabric || ""} onChange={(e) => handleChange("fabric", e.target.value)} placeholder="100% Cotton" />
                        </div>
                        <div className="space-y-2">
                            <Label>Grammatur (GSM)</Label>
                            <Input value={formData.gsm || ""} onChange={(e) => handleChange("gsm", e.target.value)} placeholder="180 gsm" />
                        </div>
                        <div className="space-y-2">
                            <Label>Passform (Fit)</Label>
                            <Input value={formData.fit || ""} onChange={(e) => handleChange("fit", e.target.value)} placeholder="Regular" />
                        </div>
                        <div className="space-y-2">
                            <Label>Geschlecht</Label>
                            <Input value={formData.gender || ""} onChange={(e) => handleChange("gender", e.target.value)} placeholder="Unisex" />
                        </div>
                    </div>
                </div>

                {/* Box 3: Inventory Action */}
                <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl p-5 flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                            <Box className="w-4 h-4" /> Lagerbestand
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Gesamt: <span className="font-mono font-bold">{product.stock}</span> Einheiten über alle Varianten.
                        </p>
                    </div>
                    <Button onClick={() => setIsStockOpen(true)} variant="secondary" className="border-blue-200 dark:border-blue-800">
                        Lager verwalten
                    </Button>
                </div>

            </div>
        </div>

      </DialogContent>
    </Dialog>

    {/* Der Stock Manager wird hier "nested" geöffnet */}
    {product && (
        <ProductStockDialog 
            open={isStockOpen} 
            product={product} 
            onClose={() => setIsStockOpen(false)} 
            onUpdate={onUpdate} // Wichtig: Damit sich die Gesamt-Zahl aktualisiert
        />
    )}
    </>
  );
}
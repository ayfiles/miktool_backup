"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { updateProduct } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Box, Layers, Tag, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import ProductImageTint from "./ProductImageTint";
import ProductVariantImages from "./ProductVariantImages";
import ProductStockDialog from "./ProductStockDialog"; 
import { getColorHex } from "@/lib/colorUtils";
import { Separator } from "@/components/ui/separator";

interface Props {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ProductDetailsDialog({ product, open, onClose, onUpdate }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [previewColor, setPreviewColor] = useState("White");
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
      toast.success("Produkt gespeichert");
      onUpdate();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Speichern");
    } finally {
      setIsLoading(false);
    }
  };

  const realAsset = product.product_assets?.find(
    asset => asset.color === previewColor && asset.view === 'front'
  );
  const baseImageToTint = product.image_front_url;

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      {/* UPDATE:
          - w-[95vw]: Nutzt 95% der Bildschirmbreite.
          - max-w-screen-2xl: Erlaubt sehr breite Darstellung (bis ca. 1536px).
          - h-[92vh]: Nutzt fast die gesamte Höhe.
      */}
      <DialogContent
        className="w-[calc(100vw-2rem)] sm:w-[95vw] max-w-[calc(100vw-2rem)] sm:max-w-screen-2xl h-[92vh] flex flex-col p-0 gap-0 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-xl border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden shadow-2xl rounded-2xl"
      >
        
        {/* === HEADER === */}
        <div className="px-8 py-6 border-b bg-background/80 backdrop-blur-md flex justify-between items-center shrink-0 z-20">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-4">
                    <DialogTitle className="text-2xl font-bold tracking-tight">
                        {formData.name}
                    </DialogTitle>
                    <Badge variant="secondary" className="text-sm font-normal px-3 py-0.5 h-7">
                        {product.branch || "General"}
                    </Badge>
                </div>
                <DialogDescription className="text-base">
                    Produkt-Übersicht & Einstellungen
                </DialogDescription>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="lg" onClick={onClose} className="text-muted-foreground hover:text-foreground">
                    Abbrechen
                </Button>
                <Button onClick={handleSave} disabled={isLoading} size="lg" className="px-10 h-12 text-base shadow-lg shadow-blue-500/10">
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                    Speichern
                </Button>
            </div>
        </div>

        {/* === MAIN CONTENT (Scrollable) === */}
        <div className="flex-1 overflow-y-auto p-8">
            {/* Grid breakpoint auf 'md' geändert, damit es früher zweispaltig wird */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 h-full">
                
                {/* === LEFT COLUMN: VISUALS (5/12) === */}
                <div className="md:col-span-5 flex flex-col gap-6 h-full min-h-[500px]">
                    
                    {/* Main Image Box */}
                    <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm relative group flex items-center justify-center p-10">
                        
                        <div className="absolute top-6 left-6 z-10">
                             <Badge variant={product.isLowStock ? "destructive" : "outline"} className="text-sm px-3 py-1 backdrop-blur-md bg-background/50 border-zinc-200/50 shadow-sm">
                                {product.stock} Stück
                             </Badge>
                        </div>
                        
                        {/* Bild Container */}
                        <div className="relative w-full h-full">
                             {realAsset ? (
                                <Image 
                                    src={realAsset.base_image} 
                                    alt="Product" 
                                    fill 
                                    className="object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105" 
                                    priority
                                />
                             ) : baseImageToTint ? (
                                <ProductImageTint 
                                    src={baseImageToTint} 
                                    colorName={previewColor} 
                                    alt="Preview" 
                                    className="w-full h-full drop-shadow-2xl transition-transform duration-700 group-hover:scale-105" 
                                />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-100 dark:text-zinc-800 font-black text-9xl select-none">
                                    {product.name.substring(0,2)}
                                </div>
                             )}
                        </div>

                        {/* Floating Action Bar */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5 bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 backdrop-blur-md shadow-2xl cursor-default">
                             <ProductVariantImages product={product} />
                             <Separator orientation="vertical" className="h-5 bg-white/20" />
                             <span className="text-xs font-medium px-1 whitespace-nowrap">
                                {realAsset ? "Original Foto" : "Digital Preview"}
                             </span>
                        </div>
                    </div>

                    {/* Color Selector */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm shrink-0">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 block">
                            Farbvariante wählen
                        </Label>
                        <div className="flex flex-wrap gap-3">
                            {product.available_colors.map((color) => {
                                 const isReal = product.product_assets?.some(a => a.color === color && a.view === 'front');
                                 return (
                                    <button
                                        key={color}
                                        onClick={() => setPreviewColor(color)}
                                        className={`
                                            w-12 h-12 rounded-full border-2 shadow-sm transition-all relative flex items-center justify-center
                                            ${previewColor === color ? 'border-blue-500 scale-110 shadow-md ring-4 ring-blue-500/10' : 'border-transparent hover:scale-105'}
                                        `}
                                        style={{ backgroundColor: getColorHex(color) }}
                                        title={color}
                                    >
                                        {previewColor === color && <div className="w-full h-full rounded-full border-2 border-white/40" />}
                                        {isReal && <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 border-2 border-white rounded-full shadow-sm" />}
                                    </button>
                                 )
                            })}
                        </div>
                    </div>
                </div>


                {/* === RIGHT COLUMN: DATA (7/12) === */}
                <div className="md:col-span-7 flex flex-col gap-6 h-full">

                    {/* Section 1: Stammdaten */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm flex-1 flex flex-col min-h-[300px] min-h-0">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                                <Tag className="w-6 h-6 text-zinc-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Produktdaten</h3>
                                <p className="text-sm text-muted-foreground">Basisinformationen bearbeiten</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div className="space-y-2.5">
                                <Label className="text-base font-medium">Produkt Name</Label>
                                <Input 
                                    value={formData.name || ""} 
                                    onChange={(e) => handleChange("name", e.target.value)} 
                                    className="h-12 text-lg bg-zinc-50/50 dark:bg-zinc-900 border-zinc-200"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-base font-medium">Kategorie</Label>
                                <Input 
                                    value={formData.category || ""} 
                                    onChange={(e) => handleChange("category", e.target.value)} 
                                    className="h-12 text-lg bg-zinc-50/50 dark:bg-zinc-900 border-zinc-200"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-base font-medium">Preis (Netto)</Label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg">€</span>
                                    <Input 
                                        type="number" 
                                        value={formData.base_price || ""} 
                                        onChange={(e) => handleChange("base_price", parseFloat(e.target.value))} 
                                        className="h-12 text-lg pl-10 font-mono bg-zinc-50/50 dark:bg-zinc-900 border-zinc-200"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-base font-medium">Branche</Label>
                                <Input 
                                    value={formData.branch || ""} 
                                    onChange={(e) => handleChange("branch", e.target.value)} 
                                    className="h-12 text-lg bg-zinc-50/50 dark:bg-zinc-900 border-zinc-200"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-3 flex-1 min-h-0">
                            <Label className="text-base font-medium">Beschreibung</Label>
                            <Textarea 
                                value={formData.description || ""} 
                                onChange={(e) => handleChange("description", e.target.value)} 
                                className="flex-1 min-h-[120px] min-h-0 resize-none bg-zinc-50/50 dark:bg-zinc-900 border-zinc-200 text-base leading-relaxed p-4"
                            />
                        </div>
                    </div>

                    {/* Section 2: Specs & Stock (Fixed Height) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0 h-[220px]">
                        
                        {/* Specs Card */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <Layers className="w-5 h-5" />
                                <h4 className="text-sm font-bold uppercase tracking-wider">Specs</h4>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs uppercase text-muted-foreground">GSM</Label>
                                        <Input value={formData.gsm || ""} onChange={(e) => handleChange("gsm", e.target.value)} className="h-10 text-base mt-1.5" />
                                    </div>
                                    <div>
                                        <Label className="text-xs uppercase text-muted-foreground">Fit</Label>
                                        <Input value={formData.fit || ""} onChange={(e) => handleChange("fit", e.target.value)} className="h-10 text-base mt-1.5" />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs uppercase text-muted-foreground">Material</Label>
                                    <Input value={formData.fabric || ""} onChange={(e) => handleChange("fabric", e.target.value)} className="h-10 text-base mt-1.5" />
                                </div>
                            </div>
                        </div>

                        {/* Stock Action Card */}
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-3xl p-8 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            
                            <div>
                                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
                                    <Box className="w-6 h-6" />
                                    <h4 className="font-bold text-lg">Lagerbestand</h4>
                                </div>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <div className="text-4xl font-black text-blue-900 dark:text-blue-100">
                                        {product.stock}
                                    </div>
                                    <div className="text-sm text-blue-600/70 dark:text-blue-300/60 font-medium">Einheiten</div>
                                </div>
                            </div>

                            <Button 
                                onClick={() => setIsStockOpen(true)} 
                                className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 border-0"
                            >
                                <Maximize2 className="w-5 h-5 mr-2" />
                                Bestand verwalten
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </div>

      </DialogContent>
    </Dialog>

    {product && (
        <ProductStockDialog 
            open={isStockOpen} 
            product={product} 
            onClose={() => setIsStockOpen(false)} 
            onUpdate={onUpdate} 
        />
    )}
    </>
  );
}
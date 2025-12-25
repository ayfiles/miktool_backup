"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Product, ProductAsset } from "@/types/product";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageIcon, UploadCloud, Loader2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { getColorHex } from "@/lib/colorUtils";
import ProductImageTint from "./ProductImageTint"; // 👈 Wichtig!

interface Props {
  product: Product;
}

export default function ProductVariantImages({ product }: Props) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<ProductAsset[]>([]);
  const [uploadingColor, setUploadingColor] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (open && product.id) {
      loadAssets();
    }
  }, [open, product.id]);

  const loadAssets = async () => {
    const { data } = await supabase
      .from("product_assets")
      .select("*")
      .eq("product_id", product.id);
    
    if (data) setAssets(data);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, color: string, view: 'front' | 'back') => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    
    setUploadingColor(`${color}-${view}`);

    try {
      // 1. Upload
      const fileExt = file.name.split('.').pop();
      const fileName = `${product.id}/${color}-${view}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      // 2. DB Eintrag aktualisieren (altes löschen, neues rein)
      await supabase.from("product_assets").delete()
        .eq("product_id", product.id)
        .eq("color", color)
        .eq("view", view);

      const { error: dbError } = await supabase.from("product_assets").insert({
        product_id: product.id,
        color: color,
        view: view,
        base_image: publicUrlData.publicUrl
      });

      if (dbError) throw dbError;

      toast.success("Echtes Bild gespeichert!");
      loadAssets();

    } catch (error: any) {
      console.error(error);
      toast.error("Upload fehlgeschlagen");
    } finally {
      setUploadingColor(null);
    }
  };

  // Löscht das echte Bild, damit wieder die Automatik (Tint) greift
  const handleReset = async (color: string, view: 'front' | 'back') => {
      await supabase.from("product_assets").delete()
        .eq("product_id", product.id)
        .eq("color", color)
        .eq("view", view);
      
      toast.info("Zurück auf Automatik gesetzt");
      loadAssets();
  };

  const getRealAssetUrl = (color: string, view: 'front' | 'back') => {
    return assets.find(a => a.color === color && a.view === view)?.base_image;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
           <ImageIcon className="mr-2 h-3 w-3"/> Varianten
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Varianten Vorschau: {product.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Das System generiert Bilder automatisch. Lade eigene Bilder hoch, um die Automatik zu überschreiben.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {(!product.available_colors || product.available_colors.length === 0) && (
             <p className="text-muted-foreground text-center">Keine Farben definiert.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.available_colors?.map((color) => (
                <div key={color} className="border rounded-lg p-3 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: getColorHex(color) }}></div>
                        <span className="font-bold text-sm">{color}</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    {['front', 'back'].map((view) => {
                        const realUrl = getRealAssetUrl(color, view as 'front' | 'back');
                        const baseWhiteUrl = view === 'front' ? product.image_front_url : product.image_back_url;

                        return (
                            <div key={view} className="space-y-1 relative group">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground">{view}</span>
                                    {realUrl && (
                                        <button onClick={() => handleReset(color, view as any)} className="text-[10px] text-red-500 hover:underline flex items-center">
                                            <RefreshCcw className="h-3 w-3 mr-1"/> Reset
                                        </button>
                                    )}
                                </div>

                                <div className="relative h-32 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-black/20 flex items-center justify-center overflow-hidden">
                                    
                                    {/* 1. Entscheidung: Echt oder Fake? */}
                                    {realUrl ? (
                                        // ECHTES BILD
                                        <Image src={realUrl} alt={view} fill className="object-contain" />
                                    ) : baseWhiteUrl ? (
                                        // AUTOMATIK (TINT)
                                        <ProductImageTint 
                                            src={baseWhiteUrl} 
                                            colorName={color} 
                                            alt={`${color} ${view}`} 
                                            className="w-full h-full"
                                        />
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Kein Basis-Bild</span>
                                    )}

                                    {/* Upload Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                        <label className="cursor-pointer text-white text-xs hover:underline bg-black/60 px-3 py-1.5 rounded flex items-center gap-2">
                                            {uploadingColor === `${color}-${view}` ? <Loader2 className="animate-spin h-3 w-3"/> : <UploadCloud className="h-3 w-3"/>}
                                            {realUrl ? "Ändern" : "Echtes Foto"}
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, color, view as any)} />
                                        </label>
                                    </div>

                                    {/* Badge wenn Automatisch */}
                                    {!realUrl && baseWhiteUrl && (
                                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-blue-500/10 text-blue-500 text-[9px] rounded font-medium border border-blue-200 dark:border-blue-900">
                                            Auto
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useState, useEffect } from "react";
import { createProduct } from "@/lib/api"; 
import { createBrowserClient } from "@supabase/ssr"; 
import { Plus, Loader2, Info, UploadCloud, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Product } from "@/types/product";

type Props = {
  onProductCreated?: (product: Product) => void;
};

export default function CreateProductDialog({ onProductCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Files State
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    colors: "",
    sizes: "",
    base_price: "",
    branch: "",
    gender: "",
    fit: "",
    fabric: "",
    gsm: "",
  });

  // Supabase Client für den Upload erstellen
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadImage = async (file: File, pathPrefix: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${pathPrefix}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let frontUrl = "";
      let backUrl = "";

      // 1. Bilder hochladen
      if (frontFile) {
        frontUrl = await uploadImage(frontFile, "front");
      }
      if (backFile) {
        backUrl = await uploadImage(backFile, "back");
      }

      // 2. Daten vorbereiten
      const cleanArray = (str: string) => 
        str.split(",").map((s) => s.trim()).filter((s) => s !== "");

      const payload = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        available_colors: cleanArray(formData.colors),
        available_sizes: cleanArray(formData.sizes),
        base_price: parseFloat(formData.base_price) || 0,
        branch: formData.branch,
        gender: formData.gender,
        fit: formData.fit,
        fabric: formData.fabric,
        gsm: formData.gsm,
        image_front_url: frontUrl,
        image_back_url: backUrl,
      };

      const newProduct = await createProduct(payload as any);

      toast.success("Produkt erstellt! 🎉");
      if (onProductCreated) onProductCreated(newProduct);
      setOpen(false);
      
      // Reset Form
      setFormData({
        name: "", category: "", description: "", colors: "", sizes: "", base_price: "",
        branch: "", gender: "", fit: "", fabric: "", gsm: ""
      });
      setFrontFile(null);
      setBackFile(null);

    } catch (error: any) {
      console.error(error);
      toast.error("Fehler: " + (error.message || "Speichern fehlgeschlagen"));
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return <Button><Plus className="mr-2 h-4 w-4" /> Add Product</Button>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Neues Produkt anlegen</DialogTitle>
            <DialogDescription>Fülle die Details aus, um das Produkt und Inventar anzulegen.</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            
            {/* 1. BASIS INFORMATIONEN */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2 pb-2 border-b">
                    <Info size={14}/> Basis Informationen
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Produktname *</Label>
                        <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="z.B. Heavy Cotton Tee" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Kategorie</Label>
                        <Input id="category" value={formData.category} onChange={(e) => handleChange("category", e.target.value)} placeholder="z.B. T-Shirts" />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="base_price">Preis (€)</Label>
                        <Input id="base_price" type="number" step="0.01" value={formData.base_price} onChange={(e) => handleChange("base_price", e.target.value)} placeholder="0.00" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="colors">Farben (Komma getrennt)</Label>
                        <Input id="colors" value={formData.colors} onChange={(e) => handleChange("colors", e.target.value)} placeholder="Red, Blue, Black" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sizes">Größen (Komma getrennt)</Label>
                        <Input id="sizes" value={formData.sizes} onChange={(e) => handleChange("sizes", e.target.value)} placeholder="S, M, L, XL" />
                    </div>
                </div>
            </div>

            {/* 2. PRODUKTDETAILS (DIE NEUEN FELDER) */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2 pb-2 border-b">
                    <Layers size={14}/> Details & Material
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="branch">Branche</Label>
                        <Input id="branch" value={formData.branch} onChange={(e) => handleChange("branch", e.target.value)} placeholder="z.B. Gastro" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="gender">Geschlecht</Label>
                        <Input id="gender" value={formData.gender} onChange={(e) => handleChange("gender", e.target.value)} placeholder="Unisex, Men..." />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="fit">Passform (Fit)</Label>
                        <Input id="fit" value={formData.fit} onChange={(e) => handleChange("fit", e.target.value)} placeholder="Regular, Slim..." />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="fabric">Material</Label>
                        <Input id="fabric" value={formData.fabric} onChange={(e) => handleChange("fabric", e.target.value)} placeholder="100% Cotton" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="gsm">Grammatur (GSM)</Label>
                        <Input id="gsm" value={formData.gsm} onChange={(e) => handleChange("gsm", e.target.value)} placeholder="180 gsm" />
                    </div>
                </div>
            </div>

            {/* 3. BILD UPLOAD */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2 pb-2 border-b">
                   <UploadCloud size={14}/> Produktbilder
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                    {/* FRONT IMAGE */}
                    <div className="grid gap-2">
                        <Label htmlFor="front-file">Vorderseite (Front)</Label>
                        <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-4 text-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer relative h-32 flex flex-col items-center justify-center">
                            <Input 
                                id="front-file" 
                                type="file" 
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => e.target.files && setFrontFile(e.target.files[0])}
                            />
                            {frontFile ? (
                                <span className="text-green-600 font-medium text-sm break-all">{frontFile.name}</span>
                            ) : (
                                <>
                                  <UploadCloud className="h-6 w-6 text-muted-foreground mb-2" />
                                  <span className="text-xs text-muted-foreground">Hier klicken<br/>(Front-Ansicht)</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* BACK IMAGE */}
                    <div className="grid gap-2">
                        <Label htmlFor="back-file">Rückseite (Back)</Label>
                        <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-4 text-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer relative h-32 flex flex-col items-center justify-center">
                            <Input 
                                id="back-file" 
                                type="file" 
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => e.target.files && setBackFile(e.target.files[0])}
                            />
                            {backFile ? (
                                <span className="text-green-600 font-medium text-sm break-all">{backFile.name}</span>
                            ) : (
                                <>
                                  <UploadCloud className="h-6 w-6 text-muted-foreground mb-2" />
                                  <span className="text-xs text-muted-foreground">Hier klicken<br/>(Rück-Ansicht)</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Speichere..." : "Produkt anlegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
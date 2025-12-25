"use client";

import { useState, useEffect } from "react";
import { createProduct } from "@/lib/api"; 
import { Plus, Loader2, Info } from "lucide-react";
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
    technical_drawing_url: "",
    ghost_mannequin_url: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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
        technical_drawing_url: formData.technical_drawing_url,
        ghost_mannequin_url: formData.ghost_mannequin_url
      };

      const newProduct = await createProduct(payload as any);

      toast.success("Produkt erfolgreich erstellt");
      if (onProductCreated) onProductCreated(newProduct);
      setOpen(false);
      
      setFormData({
        name: "", category: "", description: "", colors: "", sizes: "", base_price: "",
        branch: "", gender: "", fit: "", fabric: "", gsm: "",
        technical_drawing_url: "", ghost_mannequin_url: ""
      });

    } catch (error: any) {
      toast.error("Fehler beim Erstellen");
      console.error(error);
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* 👇 HIER WAR DER FEHLER: Das "/" fehlte */}
          <DialogHeader>
            <DialogTitle>Neues Produkt anlegen</DialogTitle>
            <DialogDescription>Manuelle Erfassung der SevenHills Produktdaten.</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Basis Info Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <Info size={14}/> Basis Informationen
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Produktname *</Label>
                        <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Kategorie</Label>
                        <Input id="category" value={formData.category} onChange={(e) => handleChange("category", e.target.value)} placeholder="z.B. Hemden" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="base_price">Preis (netto)</Label>
                        <Input id="base_price" type="number" step="0.01" value={formData.base_price} onChange={(e) => handleChange("base_price", e.target.value)} placeholder="0.00" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="branch">Branche</Label>
                        <Input id="branch" value={formData.branch} onChange={(e) => handleChange("branch", e.target.value)} placeholder="z.B. Küche" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="gender">Geschlecht</Label>
                        <Input id="gender" value={formData.gender} onChange={(e) => handleChange("gender", e.target.value)} placeholder="Universal / Herren" />
                    </div>
                </div>
            </div>

            {/* Textil Details Section */}
            <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-bold uppercase text-muted-foreground">Textil Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="fabric">Stoffzusammensetzung</Label>
                        <Input id="fabric" value={formData.fabric} onChange={(e) => handleChange("fabric", e.target.value)} placeholder="z.B. 100% Cotton" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="gsm">Grammatur (GSM)</Label>
                        <Input id="gsm" value={formData.gsm} onChange={(e) => handleChange("gsm", e.target.value)} placeholder="z.B. 180 GSM" />
                    </div>
                </div>
                
                <div className="grid gap-2">
                    <Label htmlFor="fit">Passform (Fit)</Label>
                    <Input id="fit" value={formData.fit} onChange={(e) => handleChange("fit", e.target.value)} placeholder="Regular / Oversize" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="colors">Verfügbare Farben</Label>
                        <Input 
                            id="colors" 
                            value={formData.colors} 
                            onChange={(e) => handleChange("colors", e.target.value)} 
                            placeholder="Red, Blue, Black (Komma getrennt)" 
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sizes">Verfügbare Größen</Label>
                        <Input 
                            id="sizes" 
                            value={formData.sizes} 
                            onChange={(e) => handleChange("sizes", e.target.value)} 
                            placeholder="S, M, L (Komma getrennt)" 
                        />
                    </div>
                </div>
            </div>

            {/* Assets & Media Section */}
            <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-bold uppercase text-muted-foreground">Media & Zeichnungen</h3>
                <div className="grid gap-2">
                    <Label htmlFor="technical_drawing_url">Technische Zeichnung URL</Label>
                    <Input id="technical_drawing_url" value={formData.technical_drawing_url} onChange={(e) => handleChange("technical_drawing_url", e.target.value)} placeholder="https://..." />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="ghost_mannequin_url">Ghost Mannequin URL</Label>
                    <Input id="ghost_mannequin_url" value={formData.ghost_mannequin_url} onChange={(e) => handleChange("ghost_mannequin_url", e.target.value)} placeholder="https://..." />
                </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Produkt speichern
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
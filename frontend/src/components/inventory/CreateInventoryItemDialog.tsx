"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Plus, Loader2, Link as LinkIcon, Info, Package } from "lucide-react";
import { toast } from "sonner";
import { addInventoryItem, getProducts } from "@/lib/api";

type Props = {
  onItemCreated: (item: any) => void;
};

export default function CreateInventoryItemDialog({ onItemCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  useEffect(() => { setIsMounted(true); }, []);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: "0",
    min_quantity: "10",
    branch: "",
    gender: "",
    fit: "",
    fabric: "",
    gsm: ""
  });

  useEffect(() => {
    if (open) loadProducts();
  }, [open]);

  async function loadProducts() {
    try {
      const data = await getProducts();
      setProducts(data || []);
    } catch (err) { console.error(err); }
  }

  const handleProductSelect = (productId: string) => {
    const p = products.find(x => x.id === productId);
    if (p) {
      setSelectedProductId(productId);
      setFormData({
        ...formData,
        name: p.name,
        category: p.category || "Finished Good",
        sku: p.id.slice(0, 8).toUpperCase(),
        branch: p.branch || "",
        gender: p.gender || "",
        fit: p.fit || "",
        fabric: p.fabric || "",
        gsm: p.gsm || ""
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
        min_quantity: parseInt(formData.min_quantity) || 10,
        product_id: selectedProductId || undefined
      };
      const newItem = await addInventoryItem(payload);
      toast.success("Inventar-Item erstellt");
      onItemCreated(newItem);
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Fehler");
    } finally { setLoading(false); }
  };

  if (!isMounted) return <Button><Plus className="mr-2 h-4 w-4" /> Add Item</Button>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Inventar aufstocken</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Link Section */}
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-3">
                <Label className="text-xs font-bold text-primary uppercase">Mit Produkt verknüpfen</Label>
                <Select onValueChange={handleProductSelect}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Produkt auswählen..." /></SelectTrigger>
                    <SelectContent>
                        {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Stammdaten */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2"><Info size={14}/> Stammdaten</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Bezeichnung *</Label>
                        <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="grid gap-2">
                        <Label>SKU / Interner Code</Label>
                        <Input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="z.B. SH-001" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Initialer Bestand</Label>
                        <Input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Warnung bei (Min)</Label>
                        <Input type="number" value={formData.min_quantity} onChange={e => setFormData({...formData, min_quantity: e.target.value})} />
                    </div>
                </div>
            </div>

            {/* SevenHills Textil Details */}
            <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2"><Package size={14}/> Textil Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Stoff</Label>
                        <Input value={formData.fabric} onChange={e => setFormData({...formData, fabric: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Grammatur (GSM)</Label>
                        <Input value={formData.gsm} onChange={e => setFormData({...formData, gsm: e.target.value})} />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2"><Label>Fit</Label><Input value={formData.fit} onChange={e => setFormData({...formData, fit: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>Branche</Label><Input value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>Gender</Label><Input value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} /></div>
                </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Abbrechen</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Item speichern
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Info, Package } from "lucide-react";
import { toast } from "sonner";
import { updateInventoryItem } from "@/lib/api";

type Props = {
  item: any | null;       // Das Item, das bearbeitet wird
  open: boolean;          // Steuert Sichtbarkeit von außen
  onOpenChange: (open: boolean) => void;
  onItemUpdated: () => void; // Callback zum Neuladen der Tabelle
};

export default function EditInventoryItemDialog({ item, open, onOpenChange, onItemUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: "0", // ✅ NEU: Bestand im State
    min_quantity: "10",
    branch: "",
    gender: "",
    fit: "",
    fabric: "",
    gsm: ""
  });

  // Wenn sich das "item" ändert (beim Öffnen), Formular füllen
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        sku: item.sku || "",
        category: item.category || "",
        quantity: item.quantity?.toString() || "0", // ✅ NEU: Bestand laden
        min_quantity: item.min_quantity?.toString() || "10",
        branch: item.branch || "",
        gender: item.gender || "",
        fit: item.fit || "",
        fabric: item.fabric || "",
        gsm: item.gsm || ""
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity) || 0, // ✅ NEU: Bestand senden
        min_quantity: parseInt(formData.min_quantity) || 10,
      };
      
      await updateInventoryItem(item.id, payload);
      
      toast.success("Item aktualisiert");
      onItemUpdated(); // Tabelle neu laden
      onOpenChange(false); // Dialog schließen
    } catch (err: any) {
      toast.error("Fehler beim Speichern");
      console.error(err);
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Item bearbeiten: {item?.name}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Stammdaten */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <Info size={14}/> Stammdaten
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Bezeichnung *</Label>
                        <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="grid gap-2">
                        <Label>SKU / Interner Code</Label>
                        <Input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                    </div>
                </div>
                
                {/* ✅ NEU: Bestand und Min-Bestand nebeneinander */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Aktueller Bestand</Label>
                        <Input 
                            type="number" 
                            value={formData.quantity} 
                            onChange={e => setFormData({...formData, quantity: e.target.value})} 
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Warnung bei (Min)</Label>
                        <Input 
                            type="number" 
                            value={formData.min_quantity} 
                            onChange={e => setFormData({...formData, min_quantity: e.target.value})} 
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                     <Label>Kategorie</Label>
                     <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
            </div>

            {/* SevenHills Textil Details */}
            <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <Package size={14}/> Textil Details
                </h3>
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
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Speichern
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useState, useEffect } from "react"; // 👈 useEffect importieren
import Papa from "papaparse";
import { createBulkProducts } from "@/lib/api"; 
import { Upload, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Props {
  onSuccess: () => void;
}

export default function ProductImportDialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  // 🟢 FIX FÜR HYDRATION ERROR
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const products = results.data.map((row: any) => ({
            name: row.name,
            category: row.category,
            description: row.description,
            base_price: parseFloat(row.price || row.base_price || "0"),
            available_colors: row.colors ? row.colors.split(",").map((s: string) => s.trim()) : [],
            available_sizes: row.sizes ? row.sizes.split(",").map((s: string) => s.trim()) : [],
            branch: row.branch || "",
            gsm: row.gsm || "",
            fabric: row.fabric || ""
          }));

          console.log("Importing:", products);

          await createBulkProducts(products);
          
          toast.success(`${products.length} Produkte importiert! 🎉`);
          setOpen(false);
          setFile(null);
          onSuccess();

        } catch (error) {
          console.error(error);
          toast.error("Fehler beim Import.");
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        setLoading(false);
        toast.error("Fehler beim Lesen der Datei");
      }
    });
  };

  // 🟢 FALLBACK: Wenn noch nicht gemountet, zeige nur den Button (vermeidet ID-Konflikt)
  if (!isMounted) {
    return (
      <Button variant="outline">
        <Upload className="mr-2 h-4 w-4" /> Import CSV
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" /> Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Produkte importieren</DialogTitle>
          <DialogDescription>
            Lade eine CSV Datei hoch (name, category, price, colors, sizes).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 font-semibold mb-2">
                <Info className="h-4 w-4 text-blue-500" />
                <span>CSV Format</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Spalten: name, category, price, colors, sizes<br/>
              Bsp: "Shirt", "Top", "19.99", "Red,Blue", "S,M"
            </div>
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground file:bg-transparent file:text-sm file:font-medium file:text-foreground"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
             <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
             <Button onClick={handleUpload} disabled={!file || loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Importieren
             </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
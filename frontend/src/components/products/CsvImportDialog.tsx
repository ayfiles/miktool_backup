"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileSpreadsheet, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { createBulkProducts } from "@/lib/api";

type Props = {
  onSuccess: () => void;
};

function expandSizeRange(rangeStr: string): string[] {
  if (!rangeStr) return [];
  if (rangeStr.includes(",")) return rangeStr.split(",").map(s => s.trim());
  if (rangeStr.includes("-")) {
    const parts = rangeStr.split("-").map(s => s.trim());
    const sizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];
    const start = sizes.indexOf(parts[0]);
    const end = sizes.indexOf(parts[1]);
    if (start !== -1 && end !== -1 && start <= end) return sizes.slice(start, end + 1);
  }
  return [rangeStr];
}

export default function CsvImportDialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState("");
  
  // ✅ FIX: Hydration Error verhindern
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true, 
      skipEmptyLines: true,
      complete: (results) => {
        const parsedProducts = results.data
          .filter((row: any) => row['Produktname']) 
          .map((row: any) => ({
            name: row['Produktname'] || "Unbenannt",
            category: row['Kategorie'] || "Allgemein",
            description: row['Bemerkungen'] || "",
            base_price: parseFloat(row['Preis pro Stück (netto)']?.replace(",", ".") || "0") || 0,
            available_sizes: expandSizeRange(row['Größen']),
            available_colors: row['Farben'] ? row['Farben'].split(",").map((s:string) => s.trim()) : [],
            branch: row['Branche'] || null,
            gender: row['Geschlecht'] || null,
            fit: row['Fit'] || null,
            fabric: row['Stoff'] || null,
            gsm: row['GSM'] || null,
            technical_drawing_url: row['technische Zeichnung URL'] || null,
            ghost_mannequin_url: row['Ghost Mannequin URL'] || null
          }));
        setPreview(parsedProducts);
      }
    });
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setLoading(true);
    try {
      await createBulkProducts(preview);
      toast.success(`${preview.length} Produkte importiert!`);
      setOpen(false);
      setPreview([]);
      onSuccess(); 
    } catch (err: any) {
      // ✅ Zeige den genauen Fehler vom Backend in der Konsole
      console.error("Import Error Detail:", err);
      toast.error("Server-Fehler beim Import. Prüfe ob die DB-Spalten existieren.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Hydration Fix
  if (!isMounted) return <Button variant="outline" className="gap-2"><FileSpreadsheet size={16} /> Import CSV</Button>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileSpreadsheet size={16} /> Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Produkte importieren</DialogTitle>
          <DialogDescription>SevenHills CSV Datenbank einlesen.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors">
            <Input type="file" accept=".csv" className="hidden" id="csv-upload" onChange={handleFileChange}/>
            <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">CSV Datei auswählen</span>
            </label>
          </div>
          {preview.length > 0 && (
            <div className="bg-green-50 text-green-700 p-4 rounded border border-green-200">
              <CheckCircle className="inline mr-2" size={18} /> {preview.length} Produkte bereit.
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Abbrechen</Button>
          <Button onClick={handleImport} disabled={loading || preview.length === 0}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Importieren
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
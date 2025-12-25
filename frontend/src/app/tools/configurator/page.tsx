"use client";

import { useState, useEffect, useRef } from "react";
import { getProducts } from "@/lib/api";
import { Product } from "@/types/product";
import { getColorHex } from "@/lib/colorUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, UploadCloud, Download, RotateCcw, Palette, Search, Shirt } from "lucide-react";
import { toast } from "sonner";

export default function ConfiguratorPage() {
  // === STATE ===
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("White");
  
  // Logo Settings
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [logoSrc, setLogoSrc] = useState<string | null>(null); // Für UI Preview
  const [logoPos, setLogoPos] = useState({ x: 0.5, y: 0.3 }); // Relativ (0.5 = 50%)
  const [logoScale, setLogoScale] = useState(0.3); // Größe relativ zur Canvas Breite
  
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // === INIT ===
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getProducts();
      setProducts(data);
      if (data.length > 0) handleSelectProduct(data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // === CANVAS DRAWING LOGIC (The Core) ===
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedProduct) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Determine Product Image URL (Real or Tint-Base)
    const realAsset = selectedProduct.product_assets?.find(a => a.color === selectedColor && a.view === 'front');
    const bgUrl = realAsset ? realAsset.base_image : selectedProduct.image_front_url;

    if (!bgUrl) return;

    // 2. Load Images & Draw
    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous"; // Wichtig für Download
    bgImg.src = bgUrl;

    bgImg.onload = () => {
        // Canvas Größe setzen (High Res)
        canvas.width = 1200; 
        canvas.height = 1500; // 4:5 Ratio

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // A) TINTING LOGIC (Falls kein echtes Bild)
        if (!realAsset) {
            // Temporärer Canvas für Tinting
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext("2d");
            if (tempCtx) {
                // Bild zeichnen
                tempCtx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
                // Farbe drüberlegen (Multiply Mode)
                tempCtx.globalCompositeOperation = "multiply";
                tempCtx.fillStyle = getColorHex(selectedColor);
                tempCtx.fillRect(0, 0, canvas.width, canvas.height);
                // Maskieren (Destination-In), damit nur das Shirt gefärbt bleibt (Simple approach)
                // HINWEIS: Perfektes Tinting braucht Transparenz im PNG. 
                // Wir zeichnen hier vereinfacht das Bild nochmal normal im Hintergrund, falls nötig.
                // Bessere Variante: Einfach drüberzeichnen
                tempCtx.globalCompositeOperation = "destination-in";
                tempCtx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
                
                // Auf Hauptcanvas übertragen
                ctx.drawImage(tempCanvas, 0, 0);
            }
        } else {
            // Echtes Bild einfach zeichnen
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        }

        // B) LOGO ZEICHNEN
        if (logo) {
            const logoWidth = canvas.width * logoScale;
            const logoHeight = logoWidth * (logo.height / logo.width);
            
            const x = (canvas.width * logoPos.x) - (logoWidth / 2);
            const y = (canvas.height * logoPos.y) - (logoHeight / 2);

            ctx.drawImage(logo, x, y, logoWidth, logoHeight);

            // Selection Border (nur wenn nicht gespeichert wird, eigentlich UI Overlay besser)
            // Wir lassen den Border im Canvas weg, damit der Download sauber ist.
        }
    };

  }, [selectedProduct, selectedColor, logo, logoPos, logoScale]);


  // === HANDLERS ===

  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p);
    // Farbe reset oder beibehalten
    if (p.available_colors && p.available_colors.length > 0) {
       if (!p.available_colors.includes(selectedColor)) setSelectedColor(p.available_colors[0]);
    } else {
       setSelectedColor("White");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
            const src = ev.target.result as string;
            setLogoSrc(src);
            
            const img = new Image();
            img.src = src;
            img.onload = () => setLogo(img);
            
            setLogoPos({ x: 0.5, y: 0.3 }); // Reset Position Center
            setLogoScale(0.3);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- DRAG LOGIC (Maus auf dem Canvas Container) ---
  const handleMouseDown = (e: React.MouseEvent) => {
      if (!logo) return;
      setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      // Clamp values 0-1
      const clampedX = Math.max(0, Math.min(1, x));
      const clampedY = Math.max(0, Math.min(1, y));

      setLogoPos({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => setIsDragging(false);

  // --- DOWNLOAD ---
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedProduct) return;

    try {
        const dataUrl = canvas.toDataURL("image/png", 1.0); // High Quality
        const link = document.createElement('a');
        link.download = `Design-${selectedProduct.name}-${selectedColor}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Design gespeichert!");
    } catch (e) {
        console.error(e);
        toast.error("Fehler beim Speichern");
    }
  };


  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-zinc-50 dark:bg-black">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-80 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-20 shadow-xl">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="font-bold text-lg flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-500" /> Konfigurator
            </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
             {/* 1. Produkt */}
             <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-muted-foreground">1. Produkt</Label>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Suchen..." className="h-9 pl-8 text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                    {filteredProducts.map(p => (
                        <div key={p.id} onClick={() => handleSelectProduct(p)} className={`cursor-pointer border rounded-lg p-2 flex flex-col items-center gap-2 text-center transition-all ${selectedProduct?.id === p.id ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                            <div className="w-8 h-8 relative">
                                {p.image_front_url ? <img src={p.image_front_url} alt="t" className="w-full h-full object-contain"/> : <Shirt className="w-full h-full text-zinc-300"/>}
                            </div>
                            <span className="text-[10px] font-medium truncate w-full">{p.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            {/* 2. Farbe */}
            <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-muted-foreground">2. Farbe</Label>
                <div className="flex flex-wrap gap-2">
                    {selectedProduct?.available_colors?.map(c => {
                         const hasReal = selectedProduct.product_assets?.some(a => a.color === c && a.view === 'front');
                         return (
                            <button key={c} onClick={() => setSelectedColor(c)} className={`w-8 h-8 rounded-full border shadow-sm transition-all relative ${selectedColor === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: getColorHex(c) }}>
                                {hasReal && <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-full" />}
                            </button>
                         )
                    })}
                </div>
            </div>

            <Separator />

            {/* 3. Logo */}
            <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-muted-foreground">3. Logo</Label>
                {!logoSrc ? (
                    <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-6 text-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer relative">
                        <Input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleLogoUpload} />
                        <UploadCloud className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
                        <span className="text-xs text-muted-foreground">Upload (PNG/JPG)</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative h-20 bg-zinc-100 dark:bg-zinc-950 rounded border flex items-center justify-center overflow-hidden p-2">
                            <img src={logoSrc} alt="Logo" className="h-full object-contain" />
                            <button onClick={() => { setLogo(null); setLogoSrc(null); }} className="absolute top-1 right-1 p-1 bg-white rounded-full text-red-500 shadow-sm hover:bg-red-50"><RotateCcw className="w-3 h-3" /></button>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs"><span>Größe</span><span>{Math.round(logoScale * 100)}%</span></div>
                            <input type="range" min="0.1" max="0.8" step="0.01" value={logoScale} onChange={(e) => setLogoScale(parseFloat(e.target.value))} className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="p-4 border-t bg-zinc-50 dark:bg-zinc-900">
            <Button className="w-full" onClick={handleDownload} disabled={!selectedProduct}>
                <Download className="w-4 h-4 mr-2" /> Design Speichern
            </Button>
        </div>
      </div>

      {/* CANVAS STAGE */}
      <div className="flex-1 flex items-center justify-center p-8 bg-zinc-100/50 dark:bg-black/50 overflow-hidden relative">
          
          {/* Container für Event Handling & Canvas */}
          <div 
            ref={containerRef}
            className={`relative w-full max-w-[500px] aspect-[4/5] bg-white shadow-2xl rounded-xl overflow-hidden border-4 border-white dark:border-zinc-800 select-none ${logo ? 'cursor-move' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
             {/* Der echte Render Canvas */}
             <canvas 
                ref={canvasRef} 
                className="w-full h-full object-contain pointer-events-none" 
             />

             {/* UI Overlay für Logo Border (damit es beim Download nicht sichtbar ist) */}
             {logo && (
                <div 
                    className="absolute pointer-events-none border-2 border-blue-500/0 transition-colors"
                    style={{
                        left: `${logoPos.x * 100}%`,
                        top: `${logoPos.y * 100}%`,
                        width: `${logoScale * 100}%`,
                        aspectRatio: `${logo.width}/${logo.height}`,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    {/* Visual Guide wenn Dragging */}
                    {isDragging && <div className="absolute inset-0 border-2 border-blue-500 bg-blue-500/10 rounded" />}
                </div>
             )}
          </div>

          <div className="absolute bottom-6 flex items-center gap-2 px-4 py-2 bg-black/70 text-white rounded-full text-xs backdrop-blur-md">
             <Palette className="w-3 h-3" />
             <span>Wähle Produkt & Farbe</span>
          </div>
      </div>

    </div>
  );
}
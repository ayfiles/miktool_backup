"use client";

import ProductImportDialog from "@/components/products/ProductImportDialog";
import { useState, useEffect } from "react";
import { getProducts, deleteProduct } from "@/lib/api"; 
import { Product } from "@/types/product";
import { Search, X, Trash2, CheckCircle2, Box } from "lucide-react"; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CreateProductDialog from "@/components/products/CreateProductDialog";
import ProductImageTint from "@/components/products/ProductImageTint";
import { getColorHex } from "@/lib/colorUtils";
import Image from "next/image"; 
import { toast } from "sonner"; 
import ProductDetailsDialog from "@/components/products/ProductDetailsDialog"; // 👈 NEU

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // 🟢 NEU: Details Dialog State statt nur Stock
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<Product | null>(null);

  // Delete Mode States
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  async function loadData() {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const executeBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Wirklich ${selectedIds.size} Produkte löschen?`)) return;

    try {
        await Promise.all(Array.from(selectedIds).map(id => deleteProduct(id)));
        toast.success(`${selectedIds.size} Produkte gelöscht.`);
        setSelectedIds(new Set());
        setIsDeleteMode(false);
        loadData(); 
    } catch (e) {
        console.error(e);
        toast.error("Fehler beim Löschen.");
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Produkte & Inventar</h1>
           <p className="text-muted-foreground">Katalog verwalten, Lagerbestände prüfen und editieren.</p>
        </div>
        
        <div className="flex gap-2 items-center">
            {isDeleteMode ? (
                <div className="flex gap-2 animate-in fade-in zoom-in duration-200">
                    <Button variant="ghost" onClick={() => { setIsDeleteMode(false); setSelectedIds(new Set()); }}>
                        <X className="mr-2 h-4 w-4" /> Abbrechen
                    </Button>
                    <Button variant="destructive" onClick={executeBatchDelete} disabled={selectedIds.size === 0}>
                        <Trash2 className="mr-2 h-4 w-4" /> 
                        {selectedIds.size} Löschen
                    </Button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsDeleteMode(true)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900">
                        <Trash2 className="mr-2 h-4 w-4" /> Löschen
                    </Button>
                    <ProductImportDialog onSuccess={loadData} />
                    <CreateProductDialog onProductCreated={loadData} />
                </div>
            )}
        </div>
      </div>

      {!isDeleteMode && (
          <div className="flex items-center gap-2">
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Suche..." 
                    className="pl-9" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
             </div>
          </div>
      )}

      {isDeleteMode && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 px-4 py-2 rounded text-sm text-red-600 dark:text-red-400 text-center">
              Produkte auswählen zum Löschen.
          </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
         {filtered.map(product => (
            <ProductCardItem 
                key={product.id} 
                product={product} 
                // 🟢 Wenn man klickt, öffnet sich jetzt der Detail Dialog
                onClick={() => setSelectedProductForDetails(product)}
                
                isDeleteMode={isDeleteMode}
                isSelected={selectedIds.has(product.id)}
                onToggleSelect={() => toggleSelection(product.id)}
            />
         ))}
      </div>

      {/* 🟢 NEU: Der Bento Box Detail Dialog */}
      {selectedProductForDetails && (
          <ProductDetailsDialog 
            open={!!selectedProductForDetails} 
            product={selectedProductForDetails}
            onClose={() => setSelectedProductForDetails(null)}
            onUpdate={loadData}
          />
      )}

    </div>
  );
}

// 🟢 CARD ITEM
function ProductCardItem({ 
    product, 
    onClick, // Genereller Klick auf Karte
    isDeleteMode, 
    isSelected, 
    onToggleSelect 
}: { 
    product: Product, 
    onClick: () => void,
    isDeleteMode?: boolean,
    isSelected?: boolean,
    onToggleSelect?: () => void
}) {
    const [previewColor, setPreviewColor] = useState(
       product.available_colors && product.available_colors.length > 0 
       ? product.available_colors[0] 
       : "White"
    );

    const realAsset = product.product_assets?.find(
        asset => asset.color === previewColor && asset.view === 'front'
    );
    const baseImageToTint = product.image_front_url;
  
    // Handler für Klick auf Karte
    const handleCardClick = () => {
        if (isDeleteMode && onToggleSelect) {
            onToggleSelect();
        } else {
            onClick();
        }
    };

    return (
      <Card 
        className={`flex flex-col overflow-hidden group transition-all relative cursor-pointer
            ${isDeleteMode ? 'hover:ring-2 hover:ring-red-400' : 'hover:border-blue-500/50 hover:shadow-md'}
            ${isSelected ? 'ring-2 ring-red-500 border-red-500 bg-red-50/10' : ''}
        `}
        onClick={handleCardClick}
      >
          
          {isDeleteMode && (
              <div className="absolute top-2 left-2 z-20">
                  <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-red-500 border-red-500 text-white' : 'bg-white/80 border-zinc-300'}`}>
                      {isSelected && <CheckCircle2 className="h-4 w-4" />}
                  </div>
              </div>
          )}

          <div className="h-48 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center relative p-4">
              {realAsset ? (
                  <div className="relative w-full h-full">
                     <Image src={realAsset.base_image} alt="Preview" fill className="object-contain" />
                  </div>
              ) : baseImageToTint ? (
                  <ProductImageTint src={baseImageToTint} colorName={previewColor} alt="Preview" className="w-full h-full" />
              ) : (
                  <div className="text-4xl text-zinc-300 font-bold select-none">{product.name.substring(0,2)}</div>
              )}
  
              {!isDeleteMode && (
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {product.isLowStock ? (
                        <Badge variant="destructive" className="animate-pulse">Low Stock</Badge>
                    ) : (
                        <Badge variant="secondary" className="bg-white/90 dark:bg-black/90 text-xs shadow-sm">
                            {product.stock} Stk.
                        </Badge>
                    )}
                </div>
              )}
          </div>
  
          {/* Color Dots */}
          {!isDeleteMode && product.available_colors && product.available_colors.length > 0 && (
              <div className="px-4 pt-3 flex gap-1.5 overflow-x-auto scrollbar-hide" onClick={(e) => e.stopPropagation()}>
                  {product.available_colors.map(color => {
                      const isReal = product.product_assets?.some(a => a.color === color && a.view === 'front');
                      return (
                          <button
                              key={color}
                              onClick={(e) => { e.stopPropagation(); setPreviewColor(color); }}
                              onMouseEnter={() => setPreviewColor(color)}
                              className={`w-5 h-5 rounded-full border shadow-sm flex-shrink-0 transition-all relative ${previewColor === color ? 'scale-110 ring-2 ring-offset-2 ring-blue-500' : 'hover:scale-110'}`}
                              style={{ backgroundColor: getColorHex(color) }}
                          >
                              {isReal && <div className="absolute inset-0 flex items-center justify-center"><div className="w-1 h-1 bg-white rounded-full shadow-sm"/></div>}
                          </button>
                      );
                  })}
              </div>
          )}
  
          <div className="p-4 flex-1 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                  <div>
                      <div className="font-semibold truncate pr-2" title={product.name}>{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.category}</div>
                  </div>
                  <div className="font-mono text-sm font-medium">{product.base_price.toFixed(2)} €</div>
              </div>
  
              {!isDeleteMode && (
                  <div className="mt-auto pt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="w-full bg-secondary/50 hover:bg-secondary">
                          Details & Editieren
                      </Button>
                  </div>
              )}
          </div>
      </Card>
    );
}
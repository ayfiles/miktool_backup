"use client";

import ProductImportDialog from "@/components/products/ProductImportDialog"; // ✅ Import war schon da
import { useState, useEffect } from "react";
import { getProducts } from "@/lib/api"; 
import { Product } from "@/types/product";
import { Plus, Search, Box, Edit2 } from "lucide-react"; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CreateProductDialog from "@/components/products/CreateProductDialog";
import ProductStockDialog from "@/components/products/ProductStockDialog";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // State für Stock Dialog
  const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);

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

  return (
    <div className="container mx-auto py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Products & Inventory</h1>
           <p className="text-muted-foreground">Manage your catalog and stock levels in one place.</p>
        </div>
        
        {/* 👇 HIER WURDE GEÄNDERT: Beide Buttons nebeneinander */}
        <div className="flex gap-2">
            <ProductImportDialog onSuccess={loadData} />
            <CreateProductDialog onProductCreated={loadData} />
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
         <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search products..." 
                className="pl-9" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
         </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
         {filtered.map(product => (
            <Card key={product.id} className="flex flex-col overflow-hidden group hover:border-blue-500/50 transition-all">
                
                {/* Image Placeholder */}
                <div className="h-40 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center relative">
                    {/* Stock Badge */}
                    <div className="absolute top-2 right-2">
                        {product.isLowStock ? (
                             <Badge variant="destructive" className="animate-pulse">Low Stock</Badge>
                        ) : (
                             <Badge variant="secondary" className="bg-white/90 dark:bg-black/90 text-xs">
                                {product.stock} in Stock
                             </Badge>
                        )}
                    </div>
                    {/* Placeholder Icon */}
                    <div className="text-4xl text-zinc-300 font-bold select-none">
                        {product.name.substring(0,2).toUpperCase()}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="font-semibold truncate pr-2" title={product.name}>{product.name}</div>
                            <div className="text-xs text-muted-foreground">{product.category}</div>
                        </div>
                        <div className="font-mono text-sm">
                            {product.base_price.toFixed(2)} €
                        </div>
                    </div>

                    <div className="mt-auto pt-4 flex gap-2">
                        {/* Stock Button */}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setSelectedProductForStock(product)}
                        >
                            <Box className="mr-2 h-3 w-3" /> Stock
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="px-2">
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                </div>
            </Card>
         ))}
      </div>

      {/* Das Modal wird hier eingebunden */}
      {selectedProductForStock && (
          <ProductStockDialog 
            open={!!selectedProductForStock} 
            product={selectedProductForStock}
            onClose={() => setSelectedProductForStock(null)}
            onUpdate={loadData}
          />
      )}

    </div>
  );
}
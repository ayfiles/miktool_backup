"use client";

import { useState, useEffect } from "react";
import { getProducts, deleteProduct } from "@/lib/api";
import { Product } from "@/types/product";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Package, Trash2, Box, AlertTriangle, Layers
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import CreateProductDialog from "@/components/products/CreateProductDialog"; 
import CsvImportDialog from "@/components/products/CsvImportDialog";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if(!confirm("Delete this product? All linked inventory items will also be removed.")) return;
    try {
      await deleteProduct(id);
      setProducts(p => p.filter(x => x.id !== id));
      toast.success("Product deleted");
    } catch(err) {
      toast.error("Failed to delete product");
    }
  }

  // Erweiterte Suche: Name, Kategorie oder Stoff
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.category?.toLowerCase().includes(query.toLowerCase()) ||
    p.fabric?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-full px-6 md:px-10 py-8 space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Box className="h-8 w-8 text-primary" /> Products
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your textile catalog and track live stock levels.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
            <CsvImportDialog onSuccess={loadProducts} />
            <CreateProductDialog onProductCreated={loadProducts} />
        </div>
      </div>

      <div className="space-y-4">
        {/* SEARCH & STATS */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, fabric or category..."
              className="pl-10 bg-card"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
             <span>Total: <strong>{products.length}</strong> Products</span>
             <span>Low Stock: <strong className="text-orange-600">{products.filter(p => p.isLowStock).length}</strong></span>
          </div>
        </div>

        {/* TABLE */}
        <div className="rounded-md border bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[300px]">Product & Details</TableHead>
                <TableHead>Specifications</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading catalog...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                 <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No products found.</TableCell></TableRow>
              ) : (
                filtered.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-base">{product.name}</span>
                        <span className="text-xs text-primary font-medium">{product.category}</span>
                        {product.branch && (
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                            Sector: {product.branch}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {product.fabric && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Layers size={12} className="text-muted-foreground" />
                            <span>{product.fabric} {product.gsm ? `(${product.gsm})` : ""}</span>
                          </div>
                        )}
                        {product.fit && (
                          <Badge variant="secondary" className="w-fit text-[10px] h-4 px-1">
                            {product.fit} Fit
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="font-mono">
                      {Number(product.base_price).toFixed(2)} €
                    </TableCell>
                    
                    <TableCell>
                      {(() => {
                        const { stock, isLowStock, inventoryCount } = product;

                        if (inventoryCount === 0) {
                          return <Badge variant="outline" className="text-muted-foreground border-dashed">Not Tracked</Badge>;
                        }

                        if (stock <= 0) {
                          return <Badge variant="destructive" className="bg-red-600">Out of Stock</Badge>;
                        }

                        if (isLowStock) {
                          return (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 gap-1 animate-pulse">
                              <AlertTriangle size={12} /> Low Stock: {stock}
                            </Badge>
                          );
                        }

                        return (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                             {stock} Units
                          </Badge>
                        );
                      })()}
                    </TableCell>

                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="hover:text-red-600">
                         <Trash2 className="h-4 w-4"/>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
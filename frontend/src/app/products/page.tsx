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
  Search, Package, Plus, Trash2, Edit, AlertTriangle, Box
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
// Falls du CreateProductDialog hast, hier importieren, sonst Button erstmal dummy
import CreateProductDialog from "@/components/products/CreateProductDialog"; 

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
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
    if(!confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts(p => p.filter(x => x.id !== id));
      toast.success("Product deleted");
    } catch(err) {
      toast.error("Failed to delete");
    }
  }

  // Filter
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase())
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
            Your product catalog linked to live inventory.
          </p>
        </div>
        {/* Create Dialog einbinden */}
        <CreateProductDialog onProductCreated={(p) => setProducts([...products, p])} />
      </div>

      <div className="space-y-4">
        {/* SEARCH */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10 bg-card"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total Stock</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                 <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No products found.</TableCell></TableRow>
              ) : (
                filtered.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium text-base">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      {Number(product.base_price).toFixed(2)} €
                    </TableCell>
                    
                    {/* LIVE STOCK ANZEIGE */}
                    <TableCell>
                      {product.stock > 0 ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                           {product.stock} Units
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-50 text-red-700">
                           No Stock
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-muted-foreground text-sm">
                       {product.inventoryCount > 0 ? (
                         <span className="flex items-center gap-1">
                           <Package size={14}/> {product.inventoryCount} connected items
                         </span>
                       ) : (
                         <span className="opacity-50 italic">No inventory linked</span>
                       )}
                    </TableCell>

                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                         <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-600"/>
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
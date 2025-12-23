import { getProducts } from "@/lib/api";
import { Package, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateProductDialog } from "@/components/products/CreateProductDialog"; // <--- IMPORTED
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ProductsPage() {
  // Lädt die echten Daten aus deiner Supabase DB
  const products = await getProducts();

  return (
    <div className="flex flex-col gap-6">
      
      {/* HEADER BEREICH */}
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Product Catalog</h1>
            <p className="text-muted-foreground">Manage your product definitions and base prices.</p>
        </div>
        {/* REPLACED BUTTON WITH DIALOG */}
        <CreateProductDialog />
      </div>

      {/* FILTER & SUCHE LEISTE (UI only für jetzt) */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 bg-card"
            />
        </div>
        <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* TABELLE */}
      <Card>
        <CardHeader className="px-6 py-4 border-b border-border">
            <CardTitle className="text-base">Inventory Items</CardTitle>
            <CardDescription>
                Overview of all registered products in your system.
            </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                    <div className="bg-muted/30 p-4 rounded-full mb-4">
                        <Package className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">No products found</h3>
                    <p className="max-w-xs mb-4">
                        Your catalog is empty. Start by adding your first product to the database.
                    </p>
                    {/* Updated empty state button as well */}
                     <div className="mt-4">
                        <CreateProductDialog />
                     </div>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="w-[300px]">Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Variants</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id} className="border-border hover:bg-muted/30">
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-md bg-muted/50 border border-border flex items-center justify-center shrink-0">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span>{product.name}</span>
                                            {product.description && (
                                                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                    {product.description}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-normal">
                                        {product.category || "General"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                        {product.available_colors && product.available_colors.length > 0 && (
                                            <div className="flex items-center gap-1">
                                                <span className="w-10">Colors:</span>
                                                <div className="flex gap-1">
                                                    {product.available_colors.map((c) => (
                                                        <div key={c} className="h-2.5 w-2.5 rounded-full border border-border ring-1 ring-border/20" style={{ backgroundColor: c }} title={c} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {product.available_sizes && product.available_sizes.length > 0 && (
                                            <div className="flex items-center gap-1">
                                                 <span className="w-10">Sizes:</span>
                                                 <span className="text-foreground">{product.available_sizes.join(", ")}</span>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-muted-foreground">-</span>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {(product as any).price ? 
                                        new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format((product as any).price) 
                                        : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM7.5 13.625C8.12132 13.625 8.625 13.1213 8.625 12.5C8.625 11.8787 8.12132 11.375 7.5 11.375C6.87868 11.375 6.375 11.8787 6.375 12.5C6.375 13.1213 6.87868 13.625 7.5 13.625Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
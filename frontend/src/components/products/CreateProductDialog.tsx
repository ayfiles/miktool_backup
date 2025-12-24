"use client";

import { useState, useEffect } from "react";
import { createProduct } from "@/lib/api"; 
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Product } from "@/types/product";

type Props = {
  onProductCreated?: (product: Product) => void;
};

export default function CreateProductDialog({ onProductCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // ✅ FIX: Hydration Error verhindern
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    colors: "",
    sizes: "",
    base_price: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Helper: String "Rot, Blau" -> Array ["Rot", "Blau"]
      const cleanArray = (str: string) => 
        str.split(",").map((s) => s.trim()).filter((s) => s !== "");

      const payload = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        available_colors: cleanArray(formData.colors),
        available_sizes: cleanArray(formData.sizes),
        base_price: parseFloat(formData.base_price) || 0,
      };

      const newProduct = await createProduct(payload);

      toast.success("Product created successfully");
      
      if (onProductCreated) {
        onProductCreated(newProduct);
      }

      setOpen(false);
      
      // Reset Form
      setFormData({
        name: "",
        category: "",
        description: "",
        colors: "",
        sizes: "",
        base_price: ""
      });

    } catch (error: any) {
      toast.error("Failed to create product");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Solange nicht "gemountet" (Client-Side), zeigen wir nur einen Button.
  // Das verhindert den ID-Konflikt mit dem Server.
  if (!isMounted) {
    return (
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Add Product
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
            <DialogDescription>
              Add a new item to your catalog.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name *</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => handleChange("name", e.target.value)} 
                className="col-span-3" 
                required 
              />
            </div>

            {/* Category */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Input 
                id="category" 
                value={formData.category} 
                onChange={(e) => handleChange("category", e.target.value)} 
                className="col-span-3" 
                placeholder="e.g. Apparel" 
              />
            </div>

            {/* Price */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="base_price" className="text-right">Price (€)</Label>
              <Input 
                id="base_price" 
                type="number"
                step="0.01"
                value={formData.base_price} 
                onChange={(e) => handleChange("base_price", e.target.value)} 
                className="col-span-3" 
                placeholder="0.00" 
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="colors" className="text-right">Colors</Label>
              <Input 
                id="colors" 
                value={formData.colors} 
                onChange={(e) => handleChange("colors", e.target.value)} 
                className="col-span-3" 
                placeholder="Red, Blue, Black" 
              />
            </div>
            
            {/* Sizes */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sizes" className="text-right">Sizes</Label>
              <Input 
                id="sizes" 
                value={formData.sizes} 
                onChange={(e) => handleChange("sizes", e.target.value)} 
                className="col-span-3" 
                placeholder="S, M, L, XL" 
              />
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">Desc</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={(e) => handleChange("description", e.target.value)} 
                className="col-span-3" 
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
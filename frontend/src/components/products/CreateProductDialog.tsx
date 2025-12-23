"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/lib/api"; // Ensure this is exported in your api.ts
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
import { toast } from "sonner"; // Assuming you have sonner installed, otherwise use your preferred toast

export function CreateProductDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [colors, setColors] = useState(""); 
  const [sizes, setSizes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Helper to clean up array inputs
      const cleanArray = (str: string) => 
        str.split(",").map((s) => s.trim()).filter((s) => s !== "");

      await createProduct({
        name,
        category,
        description,
        available_colors: cleanArray(colors),
        available_sizes: cleanArray(sizes),
      });

      toast.success("Product created successfully");
      setOpen(false);
      router.refresh(); // Refreshes the server component data on the parent page
      
      // Reset form
      setName("");
      setCategory("");
      setDescription("");
      setColors("");
      setSizes("");
    } catch (error) {
      toast.error("Failed to create product");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="col-span-3" placeholder="e.g. Apparel" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="colors" className="text-right">Colors</Label>
              <Input id="colors" value={colors} onChange={(e) => setColors(e.target.value)} className="col-span-3" placeholder="#000000, #FFFFFF (Comma separated)" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sizes" className="text-right">Sizes</Label>
              <Input id="sizes" value={sizes} onChange={(e) => setSizes(e.target.value)} className="col-span-3" placeholder="S, M, L (Comma separated)" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">Desc</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
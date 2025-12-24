"use client"

import * as React from "react"
// 👇 Dieser Import hat gefehlt:
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card" 
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"
import { ConfiguratorCanvas } from "@/components/tools/ConfiguratorCanvas"
import { toast } from "sonner"
// import { getAllProducts, getProductById } from "@/lib/api" 

// --- MOCK DATA ---
const MOCK_PRODUCTS = [
  { 
    id: "p1", 
    name: "Heavy Cotton Tee", 
    assets: [
      { view: "front", color: "white", url: "https://via.placeholder.com/500x500/f0f0f0/000000?text=Tee+Front+White" },
      { view: "back", color: "white", url: "https://via.placeholder.com/500x500/f0f0f0/000000?text=Tee+Back+White" },
      { view: "front", color: "black", url: "https://via.placeholder.com/500x500/1a1a1a/ffffff?text=Tee+Front+Black" },
    ]
  },
  { 
    id: "p2", 
    name: "Premium Hoodie", 
    assets: [
       { view: "front", color: "navy", url: "https://via.placeholder.com/500x500/000080/ffffff?text=Hoodie+Front+Navy" }
    ] 
  },
]

export default function ConfiguratorPage() {
  const [selectedProductId, setSelectedProductId] = React.useState<string>(MOCK_PRODUCTS[0].id)
  const [selectedColor, setSelectedColor] = React.useState<string>("white")
  const [selectedView, setSelectedView] = React.useState<string>("front")
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null)

  const currentProduct = MOCK_PRODUCTS.find(p => p.id === selectedProductId)
  
  const currentAsset = currentProduct?.assets.find(
    a => a.color === selectedColor && a.view === selectedView
  ) || currentProduct?.assets[0]

  const baseImage = currentAsset ? currentAsset.url : null

  const handleProductChange = (id: string) => {
    setSelectedProductId(id)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setLogoUrl(url)
      toast.success("Logo uploaded successfully")
    }
  }

  return (
      <div className="flex flex-1 flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden">
        
        {/* LEFT PANEL: Settings */}
        <div className="w-full lg:w-80 border-r bg-background p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h2 className="text-lg font-semibold mb-1">Configuration</h2>
            <p className="text-sm text-muted-foreground">Customize your product.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={selectedProductId} onValueChange={handleProductChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_PRODUCTS.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label>Color</Label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="black">Black</SelectItem>
                      <SelectItem value="navy">Navy</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <Label>View</Label>
                  <Select value={selectedView} onValueChange={setSelectedView}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="front">Front</SelectItem>
                      <SelectItem value="back">Back</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
            </div>

            <Separator className="my-2" />

            <div className="space-y-2">
              <Label>Upload Logo</Label>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Input 
                  id="logo" 
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </div>
              <p className="text-xs text-muted-foreground">Supported: PNG, JPG, SVG</p>
            </div>
          </div>

          <div className="mt-auto pt-4 flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setLogoUrl(null)}
              >
                  <RefreshCw className="mr-2 h-4 w-4" /> Reset
              </Button>
              <Button className="flex-1">
                  <Download className="mr-2 h-4 w-4" /> Save
              </Button>
          </div>
        </div>

        {/* RIGHT PANEL: Live Preview */}
        <div className="flex-1 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col items-center justify-center p-8">
           <div className="shadow-2xl rounded-lg overflow-hidden border bg-white">
              <ConfiguratorCanvas 
                baseImageUrl={baseImage} 
                logoUrl={logoUrl} 
              />
           </div>
           <p className="text-sm text-muted-foreground mt-6 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Interactive Preview: Drag & resize the logo.
           </p>
        </div>

      </div>
  )
}
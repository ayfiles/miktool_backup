// frontend/src/types/product.ts

export interface ProductAsset {
  id: string;
  product_id: string;
  view: 'front' | 'back' | string;
  base_image: string;
  color?: string;      // ✅ NEU: Farbvariante (z.B. "Navy")
  print_mask?: string; // Optional: Bereich für den Druck
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  base_price: number;
  available_colors: string[];
  available_sizes: string[];

  // Base mockup images (used for digital tint preview)
  image_front_url?: string;
  image_back_url?: string;
  
  // ✅ NEUE FELDER aus der SevenHills CSV
  branch?: string;
  gender?: string;
  fit?: string;
  fabric?: string;
  gsm?: string;
  technical_drawing_url?: string;
  ghost_mannequin_url?: string;
  
  // Berechnete Felder (vom Backend-Service geliefert)
  stock: number;          // Gesamtstückzahl über alle Varianten
  isLowStock: boolean;    // Flag: Ist mindestens eine Variante unter dem Minimum?
  inventoryCount: number; // Anzahl der verknüpften Varianten/Lagerplätze
  created_at?: string;

  // Relation: Verknüpfte Assets (Bilder für den Konfigurator)
  product_assets?: ProductAsset[]; 

  // 👇 WICHTIG: Das Inventory-Feld muss hier definiert sein,
  // damit OrderForm.tsx auf product.inventory zugreifen darf!
  inventory?: {
    id: string;
    product_id: string;
    size: string;
    color: string;
    quantity: number;
    min_quantity?: number;
    sku?: string;
  }[];
}
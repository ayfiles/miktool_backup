export interface ProductAsset {
  id: string;
  product_id: string;
  view: 'front' | 'back' | string;
  base_image: string;
  color?: string;      // NEU: Farbvariante (z.B. "Navy")
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
  
  // NEUE FELDER aus der SevenHills CSV
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
}
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
  stock: number;         // Gesamtstückzahl über alle Varianten
  isLowStock: boolean;   // Flag: Ist mindestens eine Variante unter dem Minimum?
  inventoryCount: number; // Anzahl der verknüpften Varianten/Lagerplätze
  created_at?: string;
}
// frontend/src/lib/colorUtils.ts

// 👇 Änderung: Einfach das ": Record<string, string>" weglassen
export const TEXTILE_COLORS = {
    "White": "#FFFFFF",
    "Black": "#000000", 
    "Grey": "#A0A0A0",
    "Dark Heather": "#333333",
    "Red": "#DC2626",
    "Navy": "#1E3A8A",
    "Royal Blue": "#2563EB",
    "Blue": "#3B82F6",
    "Light Blue": "#93C5FD",
    "Green": "#16A34A",
    "Forest Green": "#14532D",
    "Olive": "#4D7C0F",
    "Yellow": "#FACC15",
    "Gold": "#EAB308",
    "Orange": "#F97316",
    "Purple": "#9333EA",
    "Pink": "#EC4899",
    "Burgundy": "#7F1D1D",
    "Sand": "#D6D3D1",
    "Khaki": "#A8A29E",
    "Brown": "#78350F",
  };
  
  export function getColorHex(colorName: string): string {
    // Wenn der Key existiert, gib ihn zurück (Typ-Sicherheit durch 'as keyof typeof')
    if (TEXTILE_COLORS[colorName as keyof typeof TEXTILE_COLORS]) {
      return TEXTILE_COLORS[colorName as keyof typeof TEXTILE_COLORS];
    }
    
    // Versuche Case-Insensitive Match
    const found = Object.keys(TEXTILE_COLORS).find(k => k.toLowerCase() === colorName.toLowerCase());
    if (found) return TEXTILE_COLORS[found as keyof typeof TEXTILE_COLORS];
  
    // Fallback: Wenn es schon ein Hex-Code ist, gib ihn zurück, sonst Grau
    if (colorName.startsWith("#")) return colorName;
    
    return "#E5E7EB"; // Default Grau
  }
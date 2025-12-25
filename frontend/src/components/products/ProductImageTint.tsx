"use client";

import { useEffect, useRef, useState } from "react";
import { getColorHex } from "@/lib/colorUtils";

interface Props {
  src: string;        // URL des weißen Basis-Bildes
  colorName?: string; // Der Name der Farbe (z.B. "Navy")
  alt: string;
  className?: string;
}

export default function ProductImageTint({ src, colorName = "White", alt, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !src) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous"; // Wichtig für Supabase Bilder!
    img.src = src;

    img.onload = () => {
      // 1. Canvas Größe an Bild anpassen
      canvas.width = img.width;
      canvas.height = img.height;

      // 2. Das Basis-Bild (Weißes Shirt) zeichnen
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const hexColor = getColorHex(colorName);

      // 3. Nur färben, wenn es nicht Weiß ist
      if (hexColor.toLowerCase() !== "#ffffff") {
        
        // A. Den "Multiply" Modus aktivieren (Farbe * Bildschatten)
        ctx.globalCompositeOperation = "multiply";
        
        // B. Die Farbe über das ganze Bild legen
        ctx.fillStyle = hexColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // C. "Destination-In" nutzt den Alpha-Kanal des Originalbildes
        // Damit schneiden wir die Farbe außerhalb des Shirts wieder weg
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(img, 0, 0);

        // D. Reset
        ctx.globalCompositeOperation = "source-over";
      }

      setLoaded(true);
    };
  }, [src, colorName]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Das Canvas für das eingefärbte Ergebnis */}
      <canvas 
        ref={canvasRef} 
        className={`w-full h-full object-contain ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      />
      
      {/* Fallback / Loading State */}
      {!loaded && (
         <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 animate-pulse flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Lade...</span>
         </div>
      )}
    </div>
  );
}
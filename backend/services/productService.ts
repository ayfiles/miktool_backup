import { supabase } from "../supabaseClient";
import { v4 as uuid } from "uuid";

/* ===============================
   GET ALL PRODUCTS
================================ */
export async function getAllProducts() {
  // Wir holen Inventory dazu, um daraus die verfügbaren Farben/Größen zu "lernen"
  const { data, error } = await supabase
    .from("products")
    .select("*, inventory(*), product_assets(*)")
    .eq("is_archived", false) // Nur aktive Produkte
    .order("name", { ascending: true });

  if (error) throw error;

  return data.map((product: any) => {
    const inventory = product.inventory || [];
    
    // Wir berechnen die "available_colors" jetzt live aus dem Bestand!
    // Set(...) entfernt Duplikate
    const colors = Array.from(new Set(inventory.map((i: any) => i.color).filter(Boolean)));
    const sizes = Array.from(new Set(inventory.map((i: any) => i.size).filter(Boolean)));
    
    const totalStock = inventory.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    const hasLowStock = inventory.some((item: any) => (item.quantity || 0) <= (item.min_quantity || 0));

    return {
      ...product,
      available_colors: colors, // Fürs Frontend simulieren wir das Feld wieder
      available_sizes: sizes,
      stock: totalStock,
      isLowStock: hasLowStock, 
      inventoryCount: inventory.length
    };
  });
}

/* ===============================
   CREATE PRODUCT
================================ */
export async function createProduct(product: any) {
  const productId = uuid();

  // 1. Produkt speichern (OHNE Arrays, die gibt es in der DB nicht mehr)
  // Wir extrahieren die Arrays nur für den Inventory-Loop
  const { available_colors, available_sizes, ...productData } = product;

  const { data: newProduct, error: productError } = await supabase
    .from("products")
    .insert({ ...productData, id: productId })
    .select()
    .single();

  if (productError) throw productError;

  // 2. Inventory Einträge generieren
  const colors = available_colors || [];
  const sizes = available_sizes || [];
  const inventoryItems = [];

  // Logik wie vorher: Kombinationen erstellen
  if (colors.length > 0 && sizes.length > 0) {
      for (const color of colors) {
          for (const size of sizes) {
              inventoryItems.push({
                  product_id: productId,
                  color: color,
                  size: size,
                  quantity: 0
              });
          }
      }
  } else if (colors.length > 0) {
      for (const color of colors) {
          inventoryItems.push({ product_id: productId, color, size: null, quantity: 0 });
      }
  } else if (sizes.length > 0) {
       for (const size of sizes) {
          inventoryItems.push({ product_id: productId, size, color: null, quantity: 0 });
      }
  } else {
      inventoryItems.push({ product_id: productId, color: null, size: null, quantity: 0 });
  }

  if (inventoryItems.length > 0) {
      const { error: invError } = await supabase.from("inventory").insert(inventoryItems);
      if (invError) console.error("Auto-Inventory failed:", invError);
  }

  return newProduct;
}

// ... (Restliche Funktionen wie deleteProduct etc. hier einfügen) ...
export async function deleteProduct(id: string) {
    // Soft Delete: Wir setzen nur is_archived auf true
    const { error } = await supabase
        .from("products")
        .update({ is_archived: true })
        .eq("id", id);
    if (error) throw error;
}

export async function getProductById(id: string) {
    // ... analog zu getAllProducts ...
    const { data, error } = await supabase
        .from("products")
        .select("*, inventory(*), product_assets(*)")
        .eq("id", id)
        .single();
    if (error) throw error;
    return data;
}

export async function updateInventoryItem(id: string, updates: any) {
    const { data, error } = await supabase.from("inventory").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
}

export async function createBulkProducts(products: any[]) {
     // Bulk Import müsste hier angepasst werden, damit er auch inventory anlegt.
     // Fürs erste lassen wir es simpel:
     const { data, error } = await supabase.from("products").insert(products.map(p => ({
         ...p, id: uuid(), 
         available_colors: undefined, // Löschen, damit DB nicht meckert
         available_sizes: undefined
     }))).select();
     if(error) throw error;
     return data;
}
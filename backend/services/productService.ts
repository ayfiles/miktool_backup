import { supabase } from "../supabaseClient";
import { v4 as uuid } from "uuid";

/* ===============================
   GET ALL PRODUCTS (Mit Live-Stock & Low-Stock Check)
================================ */
export async function getAllProducts() {
  // WICHTIG: inventory(*) lädt auch Color/Size!
  const { data, error } = await supabase
    .from("products")
    .select("*, inventory(*), product_assets(*)") 
    .order("name", { ascending: true });

  if (error) throw error;

  return data.map((product: any) => {
    const inventory = product.inventory || [];
    
    // Gesamtsumme berechnen
    const totalStock = inventory.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    
    // Check: Ist IRGENDEINE Variante im Low Stock?
    const hasLowStock = inventory.some((item: any) => 
      (item.quantity || 0) <= (item.min_quantity || 0) && (item.quantity !== null)
    );

    return {
      ...product,
      stock: totalStock,
      isLowStock: hasLowStock, 
      inventoryCount: inventory.length,
      product_assets: product.product_assets || [] 
    };
  });
}

/* ===============================
   GET PRODUCT BY ID
================================ */
export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, inventory(*), product_assets(*)") 
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   CREATE PRODUCT (Mit Auto-Inventory)
================================ */
export async function createProduct(product: any) {
  const productId = uuid();

  // 1. Das Produkt selbst anlegen
  const { data: newProduct, error: productError } = await supabase
    .from("products")
    .insert({ ...product, id: productId })
    .select()
    .single();

  if (productError) throw productError;

  // 2. Automatisch Inventory-Plätze generieren
  const colors = product.available_colors || [];
  const sizes = product.available_sizes || [];
  const inventoryItems = [];

  if (colors.length > 0 && sizes.length > 0) {
      // Fall A: Farben UND Größen
      for (const color of colors) {
          for (const size of sizes) {
              inventoryItems.push({
                  product_id: productId,
                  color: color,
                  size: size,
                  quantity: 0,
                  min_quantity: 5
              });
          }
      }
  } else if (colors.length > 0) {
      // Fall B: Nur Farben
      for (const color of colors) {
          inventoryItems.push({
              product_id: productId,
              color: color,
              size: null,
              quantity: 0,
              min_quantity: 5
          });
      }
  } else if (sizes.length > 0) {
       // Fall C: Nur Größen
       for (const size of sizes) {
          inventoryItems.push({
              product_id: productId,
              size: size,
              color: null,
              quantity: 0,
              min_quantity: 5
          });
      }
  } else {
      // Fall D: Weder noch
      inventoryItems.push({
          product_id: productId,
          color: null,
          size: null,
          quantity: 0,
          min_quantity: 5
      });
  }

  // 3. Inventory in die DB schreiben
  if (inventoryItems.length > 0) {
      const { error: invError } = await supabase
          .from("inventory")
          .insert(inventoryItems);
      
      if (invError) {
          console.error("Auto-Inventory failed:", invError);
      }
  }

  return newProduct;
}

/* ===============================
   UPDATE PRODUCT
================================ */
export async function updateProduct(id: string, updates: any) {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   DELETE PRODUCT
================================ */
export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

/* ===============================
   BATCH CREATE PRODUCTS (CSV Import)
================================ */
export async function createBulkProducts(products: any[]) {
  // Hinweis: Hier könnte man theoretisch auch die Auto-Inventory Logik einbauen,
  // aber für den Moment reicht der einfache Import.
  const productsWithIds = products.map(p => ({
    ...p,
    id: uuid(),
    category: p.category || "Uncategorized",
    base_price: p.base_price || 0,
    available_colors: p.available_colors || [],
    available_sizes: p.available_sizes || []
  }));

  const { data, error } = await supabase
    .from("products")
    .insert(productsWithIds)
    .select();

  if (error) throw error;
  return data;
}

/* ===============================
   UPDATE INVENTORY ITEM (Für den Stock Dialog)
================================ */
export async function updateInventoryItem(id: string, updates: any) {
  const { data, error } = await supabase
    .from("inventory")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
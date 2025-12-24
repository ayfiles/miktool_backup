import { supabase } from "../supabaseClient";
import { v4 as uuid } from "uuid";

/* ===============================
   GET ALL PRODUCTS (Mit Live-Stock & Low-Stock Check)
================================ */
export async function getAllProducts() {
  // Wir holen das Produkt UND quantity + min_quantity aus dem Inventory
  const { data, error } = await supabase
    .from("products")
    .select("*, inventory(quantity, min_quantity)") 
    .order("name", { ascending: true });

  if (error) throw error;

  return data.map((product: any) => {
    const inventory = product.inventory || [];
    
    // Gesamtsumme berechnen
    const totalStock = inventory.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    
    // Check: Ist IRGENDEINE Variante im Low Stock?
    // Ein Item ist Low Stock, wenn quantity <= min_quantity
    const hasLowStock = inventory.some((item: any) => 
      (item.quantity || 0) <= (item.min_quantity || 0) && (item.quantity !== null)
    );

    return {
      ...product,
      stock: totalStock,
      isLowStock: hasLowStock, // ✅ Flag für das Frontend Badging
      inventoryCount: inventory.length
    };
  });
}

/* ===============================
   GET PRODUCT BY ID (Updated)
================================ */
export async function getProductById(id: string) {
  // ✅ UPDATE: Wir laden jetzt auch 'product_assets' mit!
  const { data, error } = await supabase
    .from("products")
    .select("*, inventory(*), product_assets(*)") 
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   CREATE PRODUCT
================================ */
export async function createProduct(product: any) {
  const { data, error } = await supabase
    .from("products")
    .insert({ ...product, id: uuid() })
    .select()
    .single();

  if (error) throw error;
  return data;
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
  // Hinweis: Dank "ON DELETE CASCADE" in der DB werden verknüpfte 
  // Inventory-Einträge automatisch mitgelöscht.
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

/* ===============================
   BATCH CREATE PRODUCTS (CSV Import)
================================ */
export async function createBulkProducts(products: any[]) {
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
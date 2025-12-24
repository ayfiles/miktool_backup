import { supabase } from "../supabaseClient";
import { v4 as uuid } from "uuid";

/* ===============================
   GET ALL PRODUCTS (Mit Live-Stock!)
================================ */
export async function getAllProducts() {
  // Wir holen das Produkt UND alle verknüpften Inventory-Items (quantity)
  const { data, error } = await supabase
    .from("products")
    .select("*, inventory(quantity)") 
    .order("name", { ascending: true });

  if (error) throw error;

  // Jetzt rechnen wir die Summe aus
  return data.map((product: any) => {
    const realStock = product.inventory 
      ? product.inventory.reduce((sum: number, item: any) => sum + item.quantity, 0)
      : 0;

    return {
      ...product,
      stock: realStock, // Wir überschreiben den statischen Wert mit dem echten
      inventoryCount: product.inventory?.length || 0 // Wie viele Varianten gibt es?
    };
  });
}

/* ===============================
   GET PRODUCT BY ID
================================ */
export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, inventory(*)")
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
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}
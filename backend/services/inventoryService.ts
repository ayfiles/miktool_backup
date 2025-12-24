import { supabase } from "../supabaseClient";
import { v4 as uuid } from "uuid";

/* ===============================
   GET INVENTORY
   (Jetzt holen wir auch den Produkt-Namen direkt aus der Relation, falls vorhanden)
================================ */
export async function getInventory() {
  const { data, error } = await supabase
    .from("inventory")
    .select("*, product:products(name, id)") // Join mit Products
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

/* ===============================
   ADD ITEM (Updated)
================================ */
export async function addInventoryItem(item: { 
  name: string; 
  category: string; 
  quantity: number; 
  min_quantity: number; 
  sku: string;
  product_id?: string; // ✅ NEU: Optionales Feld für die Verknüpfung
}) {
  const { data, error } = await supabase
    .from("inventory")
    .insert({ 
      id: uuid(),
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      min_quantity: item.min_quantity,
      sku: item.sku,
      product_id: item.product_id || null // ✅ Speichert die ID
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   UPDATE QUANTITY
================================ */
export async function updateInventoryQuantity(id: string, newQuantity: number) {
  const { data, error } = await supabase
    .from("inventory")
    .update({ quantity: newQuantity })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   DELETE ITEM
================================ */
export async function deleteInventoryItem(id: string) {
  const { error } = await supabase.from("inventory").delete().eq("id", id);
  if (error) throw error;
}
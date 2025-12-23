import { supabase } from "../supabaseClient";
import { v4 as uuid } from "uuid";

/* ===============================
   GET INVENTORY
================================ */
export async function getInventory() {
  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

/* ===============================
   ADD ITEM
================================ */
export async function addInventoryItem(item: { name: string; category: string; quantity: number; min_quantity: number; sku: string }) {
  const { data, error } = await supabase
    .from("inventory")
    .insert({ ...item, id: uuid() })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   UPDATE QUANTITY (Stock Adjustment)
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
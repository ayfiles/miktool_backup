import { supabase } from "../supabaseClient";
import { v4 as uuid } from "uuid";

/* ===============================
   GET INVENTORY
================================ */
export async function getInventory() {
  const { data, error } = await supabase
    .from("inventory")
    .select(`
      *,
      product:products(name, id, branch, gender, fit, fabric, gsm)
    `)
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

/* ===============================
   ADD ITEM
================================ */
export async function addInventoryItem(item: { 
  name: string; 
  category: string; 
  quantity: number; 
  min_quantity: number; 
  sku: string;
  product_id?: string;
  branch?: string;
  gender?: string;
  fit?: string;
  fabric?: string;
  gsm?: string;
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
      product_id: item.product_id || null,
      branch: item.branch || null,
      gender: item.gender || null,
      fit: item.fit || null,
      fabric: item.fabric || null,
      gsm: item.gsm || null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   SYNC INVENTORY WITH PRODUCTS (NEU)
   Vergleicht Produkte mit Inventar und fügt fehlende hinzu.
================================ */
export async function syncInventoryWithProducts() {
  // 1. Alle Produkte holen
  const { data: products, error: pError } = await supabase
    .from("products")
    .select("id, name, category, branch, gender, fit, fabric, gsm");
  
  if (pError) throw pError;

  // 2. Bestehende Inventar-Verknüpfungen holen
  const { data: existingInv, error: iError } = await supabase
    .from("inventory")
    .select("product_id");

  if (iError) throw iError;

  const existingProductIds = new Set(existingInv.map(i => i.product_id));

  // 3. Produkte finden, die noch nicht im Inventar sind
  const missingProducts = products.filter(p => !existingProductIds.has(p.id));

  if (missingProducts.length === 0) {
    return { message: "Bereits aktuell", count: 0 };
  }

  // 4. Neue Inventar-Items vorbereiten
  const newInventoryItems = missingProducts.map(p => ({
    id: uuid(),
    product_id: p.id,
    name: p.name,
    category: p.category || "General",
    sku: `AUTO-${p.id.slice(0, 5).toUpperCase()}`,
    quantity: 0, // Startbestand immer 0
    min_quantity: 10,
    branch: p.branch,
    gender: p.gender,
    fit: p.fit,
    fabric: p.fabric,
    gsm: p.gsm
  }));

  // 5. In Datenbank einfügen
  const { data, error: insertError } = await supabase
    .from("inventory")
    .insert(newInventoryItems)
    .select();

  if (insertError) throw insertError;

  return { message: "Sync erfolgreich", count: data.length };
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

// backend/services/inventoryService.ts

export async function updateInventoryItem(id: string, updates: any) {
    const { data, error } = await supabase
      .from("inventory")
      .update({
        name: updates.name,
        category: updates.category,
        sku: updates.sku,
        min_quantity: updates.min_quantity,
        branch: updates.branch,
        gender: updates.gender,
        fit: updates.fit,
        fabric: updates.fabric,
        gsm: updates.gsm,
        quantity: updates.quantity // <--- NEU: Menge darf jetzt bearbeitet werden
      })
      .eq("id", id)
      .select()
      .single();
  
    if (error) throw error;
    return data;
  }
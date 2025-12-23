import { supabase } from "../supabaseClient";

export async function getSettings() {
  const { data, error } = await supabase.from("settings").select("*").single();
  
  // Fallback, wenn DB leer ist
  if (error || !data) {
    return {
      company_name: "Miktool Demo",
      address_line1: "Demo Street 1",
      email: "demo@miktool.com"
    };
  }
  return data;
}

export async function updateSettings(payload: any) {
  // 1. Checken ob schon was existiert
  const { data: current } = await supabase.from("settings").select("id").single();
  
  if (current?.id) {
    // Update existierend
    const { data, error } = await supabase
      .from("settings")
      .update(payload)
      .eq("id", current.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    // Neu anlegen
    const { data, error } = await supabase
      .from("settings")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
import { supabase } from "../supabaseClient";
import { v4 as uuidv4 } from "uuid";

export async function getAllProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*");

  if (error) {
    console.error("❌ SUPABASE ERROR (products):", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }

  console.log("✅ PRODUCTS:", data);
  return data;
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("❌ SUPABASE ERROR (product by id):", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }

  return data;
}

export async function createProduct(productData: {
  name: string;
  category?: string;
  description?: string;
  available_colors?: string[];
  available_sizes?: string[];
}) {
  const newProduct = {
    id: uuidv4(),
    name: productData.name,
    category: productData.category,
    description: productData.description,
    available_colors: productData.available_colors || [],
    available_sizes: productData.available_sizes || [],
  };

  const { data, error } = await supabase
    .from("products")
    .insert([newProduct])
    .select()
    .single();

  if (error) {
    console.error("❌ SUPABASE ERROR (create product):", error);
    throw error;
  }

  return data;
}

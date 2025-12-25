import { Product } from "@/types/product";
import { Client } from "@/types/client"; 
import { createBrowserClient } from "@supabase/ssr";

// API URL (Lokal oder Server)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3001"; 

/* =========================================
   HELPER: FETCH WITH AUTH
========================================= */
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  let token = "";

  // Token holen (Unterscheidung Server vs. Client)
  if (typeof window !== "undefined") {
    // Client Side
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token || "";
  } else {
    // Server Side
    const { cookies } = await import("next/headers");
    const { createServerClient } = await import("@supabase/ssr");
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {} 
        }
      }
    );
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token || "";
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return;
  return res.json();
}

/* =========================================
   CLIENTS
========================================= */

export async function getClients(): Promise<Client[]> {
  return fetchWithAuth("/clients", { cache: "no-store" });
}

export async function getClientById(id: string): Promise<Client> {
  return fetchWithAuth(`/clients/${id}`, { cache: "no-store" });
}

export async function updateClient(id: string, payload: Partial<Client>): Promise<Client> {
  return fetchWithAuth(`/clients/${id}`, {
    method: "PATCH", 
    body: JSON.stringify(payload),
  });
}

export async function createClient(payload: Partial<Client>): Promise<Client> {
  return fetchWithAuth("/clients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteClient(clientId: string) {
  return fetchWithAuth(`/clients/${clientId}`, {
    method: "DELETE",
  });
}

/* =========================================
   PRODUCTS
========================================= */

export async function getProducts(): Promise<Product[]> {
  return fetchWithAuth("/products", { cache: "no-store" });
}

export async function createProduct(payload: Omit<Product, "id">): Promise<Product> {
  return fetchWithAuth("/products", { 
    method: "POST", 
    body: JSON.stringify(payload) 
  });
}

// ✅ BATCH IMPORT (CSV)
export async function createBulkProducts(products: any[]): Promise<any[]> {
  return fetchWithAuth("/products/batch", {
    method: "POST",
    body: JSON.stringify(products),
  });
}

export async function deleteProduct(productId: string) {
  return fetchWithAuth(`/products/${productId}`, { method: "DELETE" });
}

export async function updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
  return fetchWithAuth(`/products/${id}`, { 
    method: "PUT", 
    body: JSON.stringify(payload) 
  });
}

/* =========================================
   ORDERS
========================================= */

export async function getAllOrders() {
  return fetchWithAuth("/orders", { cache: "no-store" });
}

export async function getOrdersByClient(clientId: string) {
  return fetchWithAuth(`/clients/${clientId}/orders`, { 
    cache: "no-store", 
    next: { revalidate: 0 } 
  });
}

export async function createOrder(payload: any) {
  return fetchWithAuth("/orders", { 
    method: "POST", 
    body: JSON.stringify(payload) 
  });
}

export async function deleteOrder(orderId: string) {
  return fetchWithAuth(`/orders/${orderId}`, { method: "DELETE" });
}

export async function updateOrderStatus(orderId: string, status: string) {
  return fetchWithAuth(`/orders/${orderId}/status`, { 
    method: "PATCH", 
    body: JSON.stringify({ status }) 
  });
}

export async function downloadOrderPdf(orderId: string) {
    // PDF braucht eigenen Header-Auth Flow, da response ein Blob ist
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token || "";
    
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/pdf`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error("Failed PDF");
    return res.blob();
}

/* =========================================
   INVENTORY
========================================= */

export async function getInventory() { 
  return fetchWithAuth("/inventory", { cache: "no-store" }); 
}

export async function addInventoryItem(p: any) { 
  return fetchWithAuth("/inventory", { 
    method: "POST", 
    body: JSON.stringify(p) 
  }); 
}

export async function updateInventoryQuantity(id: string, q: number) { 
  return fetchWithAuth(`/inventory/${id}/quantity`, { 
    method: "PATCH", 
    body: JSON.stringify({ quantity: q }) 
  }); 
}

// ✅ Hier richtig einsortiert (war vorher doppelt am Ende)
export async function updateInventoryItem(id: string, payload: any) {
  return fetchWithAuth(`/inventory/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteInventoryItem(id: string) { 
  return fetchWithAuth(`/inventory/${id}`, { method: "DELETE" }); 
}

export async function syncInventory() {
  return fetchWithAuth("/inventory/sync", { method: "POST" });
}

/* =========================================
   DASHBOARD & SETTINGS
========================================= */

export async function getDashboardStats() { 
  return fetchWithAuth("/dashboard/stats", { cache: "no-store" }); 
}

export async function getSettings() { 
  return fetchWithAuth("/settings", { cache: "no-store" }); 
}

export async function updateSettings(p: any) { 
  return fetchWithAuth("/settings", { 
    method: "PUT", 
    body: JSON.stringify(p) 
  }); 
}
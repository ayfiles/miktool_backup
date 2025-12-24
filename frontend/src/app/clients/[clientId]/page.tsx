import { Product } from "@/types/product";
import { Client } from "@/types/client"; // Achte darauf, dass der Pfad stimmt
import { createBrowserClient } from "@supabase/ssr";

// ✅ WICHTIG: 127.0.0.1 nutzen statt localhost für Node/Next.js Fetching
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3001"; 


/* =========================================
   HELPER: FETCH WITH AUTH
   Holt den Token automatisch (Client & Server)
========================================= */
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  let token = "";

  // A) Client Component
  if (typeof window !== "undefined") {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token || "";
  } 
  // B) Server Component
  else {
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
    let errorMessage = `Request failed: ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      const text = await res.text();
      if (text) errorMessage = text;
    }
    
    console.error(`API Error [${endpoint}]:`, errorMessage);
    throw new Error(errorMessage);
  }

  if (res.status === 204) return;
  
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}


/* =========================================
   API FUNCTIONS
========================================= */

/* --- PRODUCTS --- */
export async function getProducts(): Promise<Product[]> {
  return fetchWithAuth("/products", { cache: "no-store" });
}

export async function createProduct(payload: Omit<Product, "id">): Promise<Product> {
  return fetchWithAuth("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(productId: string) {
  return fetchWithAuth(`/products/${productId}`, {
    method: "DELETE",
  });
}

export async function updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
  return fetchWithAuth(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/* --- CLIENTS (UPDATED FOR CRM) --- */

export async function getClients(): Promise<Client[]> {
  return fetchWithAuth("/clients", { cache: "no-store" });
}

// NEU: Einzelnen Client holen
export async function getClientById(id: string): Promise<Client> {
  return fetchWithAuth(`/clients/${id}`, { cache: "no-store" });
}

// UPDATED: Nimmt jetzt ein Payload-Objekt statt nur String
export async function createClient(payload: Partial<Client>): Promise<Client> {
  return fetchWithAuth("/clients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// UPDATED: Nutzt PATCH und Payload-Objekt
export async function updateClient(id: string, payload: Partial<Client>): Promise<Client> {
  return fetchWithAuth(`/clients/${id}`, {
    method: "PATCH", 
    body: JSON.stringify(payload),
  });
}

export async function deleteClient(clientId: string) {
  return fetchWithAuth(`/clients/${clientId}`, {
    method: "DELETE",
  });
}

/* --- ORDERS --- */
export async function getAllOrders() {
  return fetchWithAuth("/orders", { cache: "no-store" });
}

export async function getOrdersByClient(clientId: string) {
  return fetchWithAuth(`/clients/${clientId}/orders`, {
    cache: "no-store",
    next: { revalidate: 0 },
  });
}

export async function createOrder(payload: { clientId: string; items: any[] }) {
  return fetchWithAuth("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteOrder(orderId: string) {
  return fetchWithAuth(`/orders/${orderId}`, {
    method: "DELETE",
  });
}

export async function updateOrderStatus(orderId: string, status: string) {
  return fetchWithAuth(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

/* --- DASHBOARD --- */
export async function getDashboardStats() {
  return fetchWithAuth("/dashboard/stats", { cache: "no-store" });
}

/* --- INVENTORY --- */
export async function getInventory() {
  return fetchWithAuth("/inventory", { cache: "no-store" });
}

export async function addInventoryItem(payload: any) {
  return fetchWithAuth("/inventory", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateInventoryQuantity(id: string, quantity: number) {
  return fetchWithAuth(`/inventory/${id}/quantity`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export async function deleteInventoryItem(id: string) {
  return fetchWithAuth(`/inventory/${id}`, {
    method: "DELETE",
  });
}

/* --- PDF DOWNLOAD --- */
export async function downloadOrderPdf(orderId: string) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token || "";

  // Auch hier nutzen wir API_BASE_URL (127.0.0.1)
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/pdf`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to download PDF");
  }

  return res.blob();
}

/* --- SETTINGS --- */
export async function getSettings() {
  return fetchWithAuth("/settings", { cache: "no-store" });
}

export async function updateSettings(payload: any) {
  return fetchWithAuth("/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
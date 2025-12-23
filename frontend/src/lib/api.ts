import { Product } from "@/types/product";
import { Client } from "@/types/client";
import { createBrowserClient } from "@supabase/ssr";

const API_BASE_URL = "http://localhost:3001";

/* =========================================
   HELPER: FETCH WITH AUTH
   Holt den Token automatisch (Client & Server)
========================================= */
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

  // ✅ FIX: Bessere Fehlerbehandlung
  if (!res.ok) {
    let errorMessage = `Request failed: ${res.status}`;
    try {
      // Versuch JSON zu parsen
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // Falls kein JSON, versuche Text (z.B. bei 404 HTML)
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
   API FUNCTIONS (Jetzt viel sauberer!)
========================================= */

/* --- PRODUCTS --- */
export async function getProducts(): Promise<Product[]> {
  return fetchWithAuth("/products", { cache: "no-store" });
}

/* --- CLIENTS --- */
export async function getClients() {
  return fetchWithAuth("/clients", { cache: "no-store" });
}

export async function createClient(name: string): Promise<Client> {
  return fetchWithAuth("/clients", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function deleteClient(clientId: string) {
  return fetchWithAuth(`/clients/${clientId}`, {
    method: "DELETE",
  });
}

/* --- ORDERS --- */
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

/* --- PDF DOWNLOAD --- */
export async function downloadOrderPdf(orderId: string) {
  // 1. Token holen (nur Client-seitig nötig für diesen Button)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token || "";

  // 2. Request mit Auth-Header
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/pdf`, {
    headers: {
      "Authorization": `Bearer ${token}`, // 🔑 Hier ist der Ausweis
    },
  });

  if (!res.ok) {
    throw new Error("Failed to download PDF");
  }

  // 3. WICHTIG: Wir geben einen Blob (Datei) zurück, kein JSON
  return res.blob();
}
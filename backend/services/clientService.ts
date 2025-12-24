import { supabase } from "../supabaseClient";
import { Client } from "../types/client";

/**
 * Holt alle Clients mit allen neuen Feldern
 */
export async function getAllClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false }); // "Neueste zuerst" ist meistens praktischer

  if (error) throw error;
  return data as Client[];
}

/**
 * NEU: Holt einen einzelnen Client für die Detail-Ansicht
 */
export async function getClientById(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Client;
}

/**
 * UPDATE: Nimmt jetzt 'clientData' statt nur 'name'
 * Damit kannst du Adressen, Telefonnummern etc. speichern.
 */
export async function createClient(clientData: Partial<Client>): Promise<Client> {
  const { data, error } = await supabase
    .from("clients")
    .insert(clientData) // Supabase nimmt das JSON Objekt und verteilt es in die Spalten
    .select()
    .single();

  if (error) throw error;
  return data as Client;
}

/**
 * UPDATE: Nimmt jetzt 'updates' Objekt statt nur 'name'
 */
export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
  const { data, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Client;
}

/* -----------------------------
   DELETE CLIENT (SAFE) - Deine Version behalten!
----------------------------- */
export async function deleteClient(clientId: string) {
  // 🔍 Check if client has any orders
  const { count, error: orderError } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId);

  if (orderError) {
    throw orderError;
  }

  if (count && count > 0) {
    throw new Error(
      "Client has existing orders and cannot be deleted."
    );
  }

  // 🗑️ Delete client
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId);

  if (error) {
    throw error;
  }
}
import { supabase } from "../supabaseClient";
import { v4 as uuid } from "uuid";

/* ===============================
   TYPES
================================ */
interface CreateOrderInput {
  clientId: string;
  items: {
    productId: string;
    color: string;
    size: string;
    quantity: number;
    branding: {
      method: string;
      position: string;
    };
  }[];
}

/* ===============================
   CREATE ORDER
================================ */
export async function createOrder(input: CreateOrderInput) {
  const orderId = uuid();

  // 1. Client laden
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("name")
    .eq("id", input.clientId)
    .single();

  if (clientError || !client) {
    throw clientError ?? new Error("Client not found");
  }

  // 2. Order anlegen
  const { error: orderError } = await supabase.from("orders").insert({
    id: orderId,
    client_id: input.clientId,
    customer_name: client.name,
    status: "draft",
    created_at: new Date().toISOString(),
  });

  if (orderError) throw orderError;

  // 3. Items anlegen
  const orderItems = input.items.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    color: item.color,
    size: item.size,
    quantity: item.quantity,
    branding_method: item.branding.method,
    branding_position: item.branding.position,
    created_at: new Date().toISOString(),
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return { orderId };
}

/* ===============================
   GET ALL ORDERS (NEU! Für die Liste)
================================ */
export async function getAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      client:clients ( id, name ),
      items:order_items ( quantity )
    `)
    .order("created_at", { ascending: false }); // Neueste zuerst

  if (error) throw error;

  // Daten flachklopfen für einfachere Nutzung im Frontend
  return data.map((order) => ({
    ...order,
    clientName: order.client?.name || order.customer_name || "Unknown Client",
    itemsCount: order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0,
  }));
}

/* ===============================
   GET ORDER BY ID
================================ */
export async function getOrderById(orderId: string) {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, client_id, customer_name, status, created_at")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    throw orderError ?? new Error("Order not found");
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select(`
      id, product_id, color, size, quantity, branding_method, branding_position,
      products ( name )
    `)
    .eq("order_id", orderId);

  if (itemsError) throw itemsError;

  return { ...order, items: items ?? [] };
}

/* ===============================
   UPDATE ORDER STATUS
================================ */
export async function updateOrderStatus(orderId: string, newStatus: string) {
  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) {
    throw error;
  }
  return { success: true };
}

/* ===============================
   DELETE ORDER
================================ */
export async function deleteOrder(orderId: string) {
  // Items werden via CASCADE gelöscht, aber sicherheitshalber:
  await supabase.from("order_items").delete().eq("order_id", orderId);
  
  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", orderId);

  if (error) throw error;
}
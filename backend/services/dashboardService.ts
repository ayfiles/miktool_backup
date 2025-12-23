import { supabase } from "../supabaseClient";

export async function getDashboardStats() {
  // 1. Hole alle Orders (wir filtern im Code für MVP, später via DB-Query für Speed)
  const { data: orders, error: orderError } = await supabase
    .from("orders")
    .select("id, status, customer_name, created_at, items:order_items(quantity)");

  if (orderError) throw orderError;

  const { count: clientCount, error: clientError } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true });

  if (clientError) throw clientError;

  // 2. Statistiken berechnen
  const totalOrders = orders?.length || 0;
  const inProduction = orders?.filter((o) => o.status === "production").length || 0;
  const drafts = orders?.filter((o) => o.status === "draft").length || 0;
  const completed = orders?.filter((o) => o.status === "done").length || 0;

  // 3. Die neuesten 5 Orders holen
  const recentOrders = orders
    ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5) || [];

  return {
    stats: {
      totalOrders,
      inProduction,
      drafts,
      completed,
      totalClients: clientCount || 0,
    },
    recentOrders,
  };
}
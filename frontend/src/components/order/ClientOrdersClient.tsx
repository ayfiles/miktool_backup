"use client";

import Link from "next/link";
import DeleteOrderButton from "@/components/order/DeleteOrderButton";
import { updateOrderStatus } from "@/lib/api"; // ✅ NEU: Import der API-Funktion

function getStatusLabel(status: string) {
  switch (status) {
    case "draft": return "Draft";
    case "confirmed": return "Confirmed";
    case "production": return "In Production";
    case "done": return "Done";
    default: return status;
  }
}

export default function ClientOrdersClient({
  clientId,
  initialOrders,
}: {
  clientId: string;
  initialOrders: any[];
}) {
  return (
    <main style={{ padding: 24, maxWidth: 900 }}>
      <h1>Client Orders</h1>

      <Link href={`/orders/new?clientId=${clientId}`}>
        ➕ Create new order
      </Link>

      <div style={{ marginTop: 24 }}>
        {initialOrders.length === 0 && <p>No orders yet.</p>}

        {initialOrders.map((order) => (
          <div
            key={order.id}
            style={{
              padding: 16,
              marginBottom: 12,
              borderRadius: 8,
              background: "#111",
              border: "1px solid #222",
            }}
          >
            <strong>Order #{order.id.slice(0, 8)}</strong>

            <div style={{ fontSize: 14, opacity: 0.7 }}>
              {new Date(order.created_at).toLocaleString()}
            </div>

            {/* STATUS */}
            <div style={{ marginTop: 8, marginBottom: 8 }}>
              <label style={{ marginRight: 8, fontSize: 12 }}>Status:</label>
              <select
                value={order.status}
                onChange={async (e) => {
                  try {
                    // ✅ Hier wird jetzt die API-Funktion genutzt
                    await updateOrderStatus(order.id, e.target.value);
                    
                    // Seite neu laden, um den neuen Status zu bestätigen
                    location.reload(); 
                  } catch (err) {
                    console.error(err);
                    alert("Fehler beim Ändern des Status.");
                  }
                }}
                style={{
                  padding: "4px 8px",
                  borderRadius: 4,
                  border: "1px solid #444",
                  background: "#222",
                  color: "#fff"
                }}
              >
                <option value="draft">Draft</option>
                <option value="confirmed">Confirmed</option>
                <option value="production">Production</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
              <a
                href={`http://localhost:3001/orders/${order.id}/pdf`}
                target="_blank"
                style={{ textDecoration: "underline", color: "#fff" }}
              >
                📄 Download PDF
              </a>

              <DeleteOrderButton orderId={order.id} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
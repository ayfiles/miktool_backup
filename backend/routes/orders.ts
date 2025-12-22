import { Router } from "express";
import PDFDocument from "pdfkit";
import {
  createOrder,
  getOrderById,
  deleteOrder,
  updateOrderStatus, // ✅ Importiert
} from "../services/orderService";

const router = Router();

/* =============================
   CREATE ORDER
============================= */
router.post("/", async (req, res) => {
  const { clientId, items } = req.body;

  if (!clientId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  try {
    const result = await createOrder({ clientId, items });
    res.status(201).json(result);
  } catch (error: any) {
    console.error("❌ Failed to create order:", error);
    res.status(500).json({
      error: error?.message ?? "Failed to create order",
    });
  }
});

/* =============================
   UPDATE ORDER STATUS
============================= */
router.patch("/:orderId/status", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const allowed = ["draft", "confirmed", "production", "done"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    // ✅ Nutzt jetzt den Service
    await updateOrderStatus(orderId, status);
    
    // ✅ WICHTIG: Sendet JSON zurück, damit api.ts res.json() nicht crasht
    res.status(200).json({ success: true }); 
  } catch (error: any) {
    console.error("❌ Failed to update order status:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =============================
   DOWNLOAD PDF (PRODUCTION SHEET)
============================= */
router.get("/:orderId/pdf", async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await getOrderById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=production-sheet-${orderId}.pdf`
    );

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    /* ---------- PDF CONTENT ---------- */

    // Title
    doc.fontSize(20).text("Production Sheet", { align: "center" });
    doc.moveDown(2);

    // Meta
    doc.fontSize(12).text(`Order ID: ${order.id}`);
    doc.text(`Client: ${order.customer_name}`);
    doc.text(`Status: ${order.status}`);
    doc.text(
      `Created: ${new Date(order.created_at).toLocaleString()}`
    );

    doc.moveDown(1.5);

    // Items
    doc.fontSize(14).text("Items");
    doc.moveDown(0.5);

    if (!order.items || order.items.length === 0) {
      doc.fontSize(11).text("No items found.");
    } else {
      order.items.forEach((item: any, index: number) => {
        doc
          .fontSize(11)
          .text(
            `${index + 1}. ${item.products?.name ?? "Unknown product"}`
          );

        doc.text(
          `   Color: ${item.color} | Size: ${item.size} | Qty: ${item.quantity}`
        );

        doc.moveDown(0.5);
      });
    }

    doc.end();
  } catch (error) {
    console.error("❌ Failed to generate PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

/* =============================
   DELETE ORDER
============================= */
router.delete("/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    await deleteOrder(orderId);
    // Hier ist kein JSON-Return nötig, da deleteOrder im Frontend meist void ist,
    // aber JSON schadet nie:
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("❌ Failed to delete order:", error);
    res.status(400).json({
      error: error?.message ?? "Failed to delete order",
    });
  }
});

export default router;
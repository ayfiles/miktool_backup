import { Router } from "express";
// import PDFDocument from "pdfkit"; // ❌ Nicht mehr benötigt
import {
  createOrder,
  getAllOrders, // ✅ NEU: Import hinzugefügt
  getOrderById,
  deleteOrder,
  updateOrderStatus,
} from "../services/orderService";
import { generateHtmlPdf } from "../services/htmlPdfService"; // ✅ NEU: Import

const router = Router();

/* =============================
   GET ALL ORDERS (NEU für die Liste)
============================= */
router.get("/", async (req, res) => {
  try {
    const orders = await getAllOrders();
    res.json(orders);
  } catch (error: any) {
    console.error("Failed to fetch orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

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
    await updateOrderStatus(orderId, status);
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("❌ Failed to update order status:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =============================
   DOWNLOAD PDF (HTML / PUPPETEER)
============================= */
router.get("/:orderId/pdf", async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await getOrderById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // ✅ PDF generieren mit HTML Service
    const pdfBuffer = await generateHtmlPdf(order);

    // Headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=production-sheet-${orderId}.pdf`
    );
    // Wichtig: Länge setzen, damit der Browser den Ladebalken kennt
    res.setHeader("Content-Length", pdfBuffer.length);

    // ✅ Buffer direkt senden
    res.end(pdfBuffer);

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
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("❌ Failed to delete order:", error);
    res.status(400).json({
      error: error?.message ?? "Failed to delete order",
    });
  }
});

export default router;
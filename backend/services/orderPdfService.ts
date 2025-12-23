import { PDFDocument, StandardFonts } from "pdf-lib";
import { getOrderById } from "./orderService";

export async function generateOrderPdf(orderId: string): Promise<Uint8Array> {
  const order = await getOrderById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = 750;

  page.drawText("PRODUCTION SHEET", {
    x: 50,
    y,
    size: 18,
    font,
  });

  y -= 40;

  page.drawText(`Order ID: ${order.id}`, { x: 50, y, size: 12, font });
  y -= 20;
  
  // ✅ FIX 1: Unterstrich statt camelCase
  page.drawText(`Customer: ${order.customer_name}`, { x: 50, y, size: 12, font });
  y -= 20;
  
  // ✅ FIX 2: Unterstrich & als Datum formatieren
  page.drawText(`Created: ${new Date(order.created_at).toLocaleDateString()}`, {
    x: 50,
    y,
    size: 12,
    font,
  });

  y -= 40;
  page.drawText("Items:", { x: 50, y, size: 14, font });
  y -= 20;

  order.items.forEach((item: any, index: number) => {
    // ✅ FIX 3: Produkt-Name anzeigen (falls vorhanden), sonst ID mit Unterstrich
    const productName = item.products?.name || item.product_id;

    page.drawText(
      `${index + 1}. ${productName} | ${item.color} | ${item.size} | Qty: ${item.quantity}`,
      { x: 60, y, size: 12, font }
    );
    y -= 20;
  });

  return await pdfDoc.save();
}
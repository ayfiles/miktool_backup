import express, { Express, Request, Response } from "express";
import cors from "cors";

import ordersRouter from "./routes/orders";
import productsRouter from "./routes/products";
import clientRoutes from "./routes/clients";
import dashboardRouter from "./routes/dashboard";

// ✅ NEU: Middleware importieren
import { requireAuth } from "./middleware/auth";

export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
      // ✅ WICHTIG: "Authorization" muss hier erlaubt sein, sonst blockt CORS den Token!
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json());

  // --- ÖFFENTLICHE ROUTEN ---
  
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // --- GESCHÜTZTE ROUTEN (AB HIER TÜRSTEHER AKTIV) ---
  app.use(requireAuth); 

  app.use("/orders", ordersRouter);
  app.use("/products", productsRouter);
  app.use("/clients", clientRoutes);
  app.use("/dashboard", dashboardRouter);

  return app;
}
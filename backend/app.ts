import express, { Express, Request, Response } from "express";
import cors from "cors";

import ordersRouter from "./routes/orders";
import productsRouter from "./routes/products";
import clientRoutes from "./routes/clients";

export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: "http://localhost:3000",
      // ✅ FIX: "PATCH" muss hier explizit dabei sein!
      methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
    })
  );

  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.use("/orders", ordersRouter);
  app.use("/products", productsRouter);
  app.use("/clients", clientRoutes);

  return app;
}
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Route Imports
import productRoutes from "./routes/products";
import clientRoutes from "./routes/clients";
import orderRoutes from "./routes/orders";
import dashboardRoutes from "./routes/dashboard";
import inventoryRoutes from "./routes/inventory"; 

dotenv.config();

const app = express(); // <--- Hier wird die App erstellt (Express, nicht Vue!)
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes registrieren
app.use("/products", productRoutes);
app.use("/clients", clientRoutes);
app.use("/orders", orderRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/inventory", inventoryRoutes);

// Health Check
app.get("/", (req, res) => {
  res.send("Miktool Backend API is running 🚀");
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
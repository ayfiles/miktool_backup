import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

// Routes
import productRoutes from "./routes/products";
import clientRoutes from "./routes/clients";
import orderRoutes from "./routes/orders";
import dashboardRoutes from "./routes/dashboard";
import inventoryRoutes from "./routes/inventory"; 
import settingsRoutes from "./routes/settings"; 

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/products", productRoutes);
app.use("/clients", clientRoutes);
app.use("/orders", orderRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/settings", settingsRoutes);

app.get("/", (req, res) => {
  res.send("Miktool Backend API is running 🚀");
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
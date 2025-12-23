import { Router } from "express";
import { getDashboardStats } from "../services/dashboardService";

const router = Router();

router.get("/stats", async (req, res) => {
  try {
    const data = await getDashboardStats();
    res.json(data);
  } catch (error: any) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

export default router;
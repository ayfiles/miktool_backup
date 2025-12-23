import { Router } from "express";
import { getSettings, updateSettings } from "../services/settingsService";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/", async (req, res) => {
  try {
    const updated = await updateSettings(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
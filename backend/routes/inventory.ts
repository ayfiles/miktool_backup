import { Router } from "express";
import {
  getInventory,
  addInventoryItem,
  updateInventoryQuantity,
  deleteInventoryItem,
} from "../services/inventoryService";

const router = Router();

// GET ALL
router.get("/", async (req, res) => {
  try {
    const items = await getInventory();
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE
router.post("/", async (req, res) => {
  try {
    const item = await addInventoryItem(req.body);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE QUANTITY
router.patch("/:id/quantity", async (req, res) => {
  const { quantity } = req.body;
  try {
    const item = await updateInventoryQuantity(req.params.id, quantity);
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await deleteInventoryItem(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
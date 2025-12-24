import { Router, Request, Response } from "express";
import { 
  getAllProducts, 
  createProduct, 
  deleteProduct, 
  updateProduct,
  getProductById,
  createBulkProducts // <--- NEU
} from "../services/productService";
const router = Router();

// GET /products
router.get("/", async (_req: Request, res: Response) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (error) {
    // Make Supabase errors debuggable in local dev (no secrets included)
    const e = error as any;
    console.error("Failed to fetch products:", {
      message: e?.message,
      details: e?.details,
      hint: e?.hint,
      code: e?.code,
      raw: e,
    });

    res.status(500).json({
      error: e?.message ?? "Failed to load products",
      code: e?.code,
      details: e?.details,
      hint: e?.hint,
    });
  }
});

// GET /products/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Failed to fetch product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST /products
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, category, description, available_colors, available_sizes } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Product name is required" });
    }

    const newProduct = await createProduct({
      name,
      category,
      description,
      available_colors,
      available_sizes,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    const e = error as any;
    console.error("Failed to create product:", e);
    res.status(500).json({ error: e.message || "Failed to create product" });
  }
});

// BATCH IMPORT
router.post("/batch", async (req, res) => {
  try {
    const products = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "Input must be an array of products" });
    }
    const created = await createBulkProducts(products);
    res.status(201).json(created);
  } catch (error) {
    console.error("Error importing products:", error);
    res.status(500).json({ error: "Failed to import products" });
  }
});

// PUT /products/:id (Update)
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedProduct = await updateProduct(id, updates);
    res.json(updatedProduct);
  } catch (error) {
    const e = error as any;
    console.error("Failed to update product:", e);
    res.status(500).json({ error: e.message || "Failed to update product" });
  }
});

// DELETE /products/:id (Löschen)
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteProduct(id);
    res.status(204).send(); // 204 No Content erfolgreich
  } catch (error) {
    const e = error as any;
    console.error("Failed to delete product:", e);
    res.status(500).json({ error: e.message || "Failed to delete product" });
  }
});

export default router;


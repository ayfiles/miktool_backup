import { Router } from "express";
import { 
  getAllClients, // ✅ Hieß früher getClients
  createClient, 
  getClientById, 
  updateClient,
  deleteClient 
} from "../services/clientService";

const router = Router();

// ==========================================
// GET /clients - Alle holen
// ==========================================
router.get("/", async (req, res) => {
  try {
    const clients = await getAllClients();
    res.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

// ==========================================
// GET /clients/:id - Details für einen Client
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const client = await getClientById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    
    res.json(client);
  } catch (error) {
    console.error("Error fetching client:", error);
    res.status(500).json({ error: "Failed to fetch client details" });
  }
});

// ==========================================
// POST /clients - Neuen Client erstellen
// ==========================================
router.post("/", async (req, res) => {
  try {
    // Wir übergeben jetzt den ganzen Body (Name, Adresse, etc.), nicht nur den Namen
    const newClient = await createClient(req.body);
    res.status(201).json(newClient);
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({ error: "Failed to create client" });
  }
});

// ==========================================
// PATCH /clients/:id - Client bearbeiten
// ==========================================
router.patch("/:id", async (req, res) => {
  try {
    // Auch hier: Wir übergeben das Update-Objekt direkt
    const updatedClient = await updateClient(req.params.id, req.body);
    res.json(updatedClient);
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ error: "Failed to update client" });
  }
});

// ==========================================
// DELETE /clients/:id - Client löschen
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    await deleteClient(req.params.id);
    res.json({ message: "Client deleted successfully" });
  } catch (error: any) {
    // Falls der Fehler "Client has existing orders" ist (siehe Service)
    if (error.message && error.message.includes("existing orders")) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Error deleting client:", error);
    res.status(500).json({ error: "Failed to delete client" });
  }
});

export default router;
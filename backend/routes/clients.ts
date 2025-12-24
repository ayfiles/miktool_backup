import { Router } from "express";
import { 
  getAllClients, 
  createClient, 
  getClientById, 
  updateClient,
  deleteClient 
} from "../services/clientService";
// WICHTIG: Dieser Import muss da sein!
import { getOrdersByClientId } from "../services/orderService"; 

const router = Router();

// 1. Alle Clients
router.get("/", async (req, res) => {
  try {
    const clients = await getAllClients();
    res.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

// 2. Client Details
router.get("/:id", async (req, res) => {
  try {
    const client = await getClientById(req.params.id);
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (error) {
    console.error("Error fetching client:", error);
    res.status(500).json({ error: "Failed to fetch client details" });
  }
});

// 3. Client Orders (Das hat gefehlt!)
router.get("/:id/orders", async (req, res) => {
  try {
    const orders = await getOrdersByClientId(req.params.id);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching client orders:", error);
    res.status(500).json({ error: "Failed to fetch client orders" });
  }
});

// 4. Neuen Client erstellen
router.post("/", async (req, res) => {
  try {
    const newClient = await createClient(req.body);
    res.status(201).json(newClient);
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({ error: "Failed to create client" });
  }
});

// 5. Update
router.patch("/:id", async (req, res) => {
  try {
    const updatedClient = await updateClient(req.params.id, req.body);
    res.json(updatedClient);
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ error: "Failed to update client" });
  }
});

// 6. Delete
router.delete("/:id", async (req, res) => {
  try {
    await deleteClient(req.params.id);
    res.json({ message: "Client deleted successfully" });
  } catch (error: any) {
    if (error.message && error.message.includes("existing orders")) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Error deleting client:", error);
    res.status(500).json({ error: "Failed to delete client" });
  }
});

export default router;
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Client } from "@/types/client";
import { createClient, deleteClient } from "@/lib/api";
import { toast } from "sonner"; // ✅ Toasts
import { Search, Plus, Trash2, ArrowRight, Users } from "lucide-react";

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = {
  initialClients: Client[];
};

export default function ClientsPage({ initialClients }: Props) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  /* --- Filter --- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => c.name.toLowerCase().includes(q));
  }, [clients, query]);

  /* --- Create Client --- */
  async function onCreateClient() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter a client name.");
      return;
    }

    setLoading(true);

    try {
      const created = await createClient(trimmed);
      setClients((prev) => [...prev, created]); // Optimistisch zur Liste
      setName("");
      toast.success("Client created successfully!");
      router.refresh(); // Daten im Hintergrund neu laden
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to create client");
    } finally {
      setLoading(false);
    }
  }

  /* --- Delete Client --- */
  async function onDeleteClient(client: Client) {
    // Einfacher Confirm (können wir später durch Dialog ersetzen)
    const confirmed = window.confirm(
      `⚠️ Delete client "${client.name}"?\n\nOrders associated with this client prevent deletion.`
    );

    if (!confirmed) return;

    try {
      await deleteClient(client.id);
      setClients((prev) => prev.filter((c) => c.id !== client.id));
      toast.success("Client deleted.");
      router.refresh();
    } catch (e: any) {
      console.error(e);
      // Hier wird jetzt der echte Fehler aus api.ts angezeigt (z.B. "Client has orders...")
      toast.error(e.message || "Failed to delete client");
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8" /> Clients
          </h1>
          <p className="text-muted-foreground mt-2">
            Select a client to manage their orders or create a new one.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Client List (Nimmt 2/3 Platz) */}
        <div className="md:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              className="pl-9 bg-zinc-900 border-zinc-800"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="grid gap-3">
            {filtered.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground border border-dashed border-zinc-800 rounded-lg">
                No clients found.
              </div>
            ) : (
              filtered.map((c) => (
                <div 
                  key={c.id} 
                  className="group flex items-center justify-between p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all"
                >
                  <Link href={`/clients/${c.id}`} className="flex-1 font-medium text-lg hover:underline decoration-zinc-500 underline-offset-4">
                    {c.name}
                  </Link>

                  <div className="flex items-center gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/clients/${c.id}`}>
                      <Button variant="outline" size="sm" className="h-8 gap-2">
                        Open <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                      onClick={() => onDeleteClient(c)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Create Client (Nimmt 1/3 Platz) */}
        <div>
          <Card className="bg-zinc-900 border-zinc-800 sticky top-8">
            <CardHeader>
              <CardTitle className="text-lg">New Client</CardTitle>
              <CardDescription>
                Add a new customer folder.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Client Name (e.g. Adidas)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onCreateClient()}
                className="bg-zinc-950 border-zinc-700"
              />
            </CardContent>
            <CardFooter>
              <Button onClick={onCreateClient} disabled={loading} className="w-full">
                {loading ? "Creating..." : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> Create Client
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

      </div>
    </div>
  );
}
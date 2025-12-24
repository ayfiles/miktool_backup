"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Client } from "@/types/client";
import { createClient } from "@/lib/api";
import { toast } from "sonner";
import { Search, Plus, Users, MapPin, Mail, User } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClientActions } from "./ClientActions";

type Props = {
  initialClients: Client[];
};

export default function ClientsPage({ initialClients }: Props) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  /* --- Filter Logic --- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => 
      c.name.toLowerCase().includes(q) || 
      c.contact_person?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
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
      const created = await createClient({ name: trimmed });
      setClients((prev) => [created, ...prev]); 
      setName("");
      toast.success("Client created successfully!");
      router.refresh();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to create client");
    } finally {
      setLoading(false);
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    // ÄNDERUNG: 'max-w-7xl' entfernt, dafür 'w-full' und mehr Padding (px-6 md:px-10)
    <div className="w-full px-6 md:px-10 py-8 space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" /> Client Database
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your customer base, contact details, and order history.
          </p>
        </div>
      </div>

      {/* GRID: ÄNDERUNG hier auf lg:grid-cols-5 für mehr Tabellen-Platz */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* LEFT COLUMN: Database Table (Nimmt jetzt 4 von 5 Spalten) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, contact, email or city..."
              className="pl-10 bg-card"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* TABLE */}
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Company / Name</TableHead>
                  <TableHead className="w-[20%]">Contact Person</TableHead>
                  <TableHead className="hidden md:table-cell">Details</TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No clients found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id} className="group">
                      {/* Name & Avatar */}
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border">
                                <AvatarImage src={c.logo_url} alt={c.name} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {getInitials(c.name)}
                                </AvatarFallback>
                            </Avatar>
                            <Link 
                                href={`/clients/${c.id}`} 
                                className="hover:underline decoration-primary underline-offset-4 font-semibold text-foreground"
                            >
                                {c.name}
                            </Link>
                        </div>
                      </TableCell>
                      
                      {/* Contact Person */}
                      <TableCell>
                        {c.contact_person ? (
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-3 w-3 text-muted-foreground" />
                                {c.contact_person}
                            </div>
                        ) : (
                            <span className="text-muted-foreground/50 text-xs">-</span>
                        )}
                      </TableCell>

                      {/* Details (Email & City) */}
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                            {c.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3 w-3" /> {c.email}
                                </div>
                            )}
                            {c.city && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3" /> {c.city}
                                </div>
                            )}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <ClientActions client={c} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="text-xs text-muted-foreground text-center pt-2">
            Showing {filtered.length} client{filtered.length !== 1 && 's'}
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Create (1 Spalte am Rand) */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8 border-dashed border-2 shadow-none bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5" /> Quick Add
              </CardTitle>
              <CardDescription>
                Add a new client to start tracking orders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Company Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onCreateClient()}
                  className="bg-background"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={onCreateClient} disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create Client"}
              </Button>
            </CardFooter>
          </Card>
        </div>

      </div>
    </div>
  );
}
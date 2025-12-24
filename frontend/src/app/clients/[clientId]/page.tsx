"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation"; 
import Layout from "@/components/Layout";
import { getClientById, updateClient, getOrdersByClient } from "@/lib/api";
import { Client } from "@/types/client"; 
import { 
  User, Phone, Mail, MapPin, 
  Globe, FileText, Save, ArrowLeft, Package, Eye
} from "lucide-react";

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams(); 
  const id = params?.clientId as string; 
  
  const [client, setClient] = useState<Client | null>(null);
  const [orders, setOrders] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({});

  useEffect(() => {
    if (id) {
        loadData(id);
    }
  }, [id]);

  async function loadData(clientId: string) {
    try {
      setLoading(true);
      const [clientData, ordersData] = await Promise.all([
        getClientById(clientId),
        getOrdersByClient(clientId)
      ]);
      
      setClient(clientData);
      setFormData(clientData);
      setOrders(ordersData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!client) return;
    try {
      const updated = await updateClient(client.id, formData);
      setClient(updated);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to save changes");
    }
  }

  if (loading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!client) return <div className="p-8 text-muted-foreground">Client not found.</div>;

  // Helper für Status-Badges (etwas moderner gestaltet)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/15 text-green-700 dark:text-green-400';
      case 'shipped': return 'bg-blue-500/15 text-blue-700 dark:text-blue-400';
      case 'in_production': return 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6"> 
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <button 
            onClick={() => router.push('/clients')} 
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
            <ArrowLeft size={20} className="mr-2"/> Back to List
        </button>
        <div className="flex gap-2">
            {isEditing ? (
                <>
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-muted-foreground hover:bg-muted rounded">Cancel</button>
                    <button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded flex items-center gap-2 shadow-sm">
                        <Save size={18} /> Save Changes
                    </button>
                </>
            ) : (
                <button onClick={() => setIsEditing(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded shadow-sm">
                    Edit Client
                </button>
            )}
        </div>
      </div>

      {/* STAMMDATEN CARD */}
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border border-border flex flex-col md:flex-row md:items-start justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
            <div className="mt-2 text-muted-foreground flex items-center gap-2">
                <Globe size={16}/> 
                {isEditing ? (
                    <input className="bg-background border border-input p-1 text-sm rounded" placeholder="Website URL" value={formData.website || ""} onChange={e => setFormData({...formData, website: e.target.value})} />
                ) : (
                    <a href={client.website} target="_blank" rel="noreferrer" className="hover:underline text-primary">
                        {client.website || "No website"}
                    </a>
                )}
            </div>
        </div>
        <div className="text-right text-sm text-muted-foreground mt-4 md:mt-0">
            <p>Added: {new Date(client.created_at).toLocaleDateString()}</p>
            <p className="font-mono text-xs mt-1 opacity-50">ID: {client.id.slice(0,8)}</p>
        </div>
      </div>

      {/* GRID FÜR DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* KONTAKT */}
        <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border border-border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User size={20} className="text-muted-foreground" /> Contact Info
            </h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs uppercase font-bold text-muted-foreground mb-1">Contact Person</label>
                    {isEditing ? (
                        <input className="bg-background border border-input p-2 w-full rounded focus:ring-2 focus:ring-ring outline-none" value={formData.contact_person || ""} onChange={e => setFormData({...formData, contact_person: e.target.value})} />
                    ) : (
                        <p className="font-medium">{client.contact_person || "-"}</p>
                    )}
                </div>
                <div>
                    <label className="block text-xs uppercase font-bold text-muted-foreground mb-1">Email</label>
                    {isEditing ? (
                        <input className="bg-background border border-input p-2 w-full rounded focus:ring-2 focus:ring-ring outline-none" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} />
                    ) : (
                        <p className="flex items-center gap-2"><Mail size={16} className="text-muted-foreground"/> {client.email || "-"}</p>
                    )}
                </div>
                <div>
                    <label className="block text-xs uppercase font-bold text-muted-foreground mb-1">Phone</label>
                    {isEditing ? (
                        <input className="bg-background border border-input p-2 w-full rounded focus:ring-2 focus:ring-ring outline-none" value={formData.phone || ""} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    ) : (
                        <p className="flex items-center gap-2"><Phone size={16} className="text-muted-foreground"/> {client.phone || "-"}</p>
                    )}
                </div>
            </div>
        </div>

        {/* ADRESSE */}
        <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border border-border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-muted-foreground" /> Address & Billing
            </h2>
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-xs uppercase font-bold text-muted-foreground mb-1">Street</label>
                        {isEditing ? <input className="bg-background border border-input p-2 w-full rounded focus:ring-2 focus:ring-ring outline-none" value={formData.address_line1 || ""} onChange={e => setFormData({...formData, address_line1: e.target.value})} /> : <p>{client.address_line1 || "-"}</p>}
                    </div>
                    <div>
                        <label className="block text-xs uppercase font-bold text-muted-foreground mb-1">City / Zip</label>
                        {isEditing ? (
                             <div className="flex gap-2">
                                <input className="bg-background border border-input p-2 w-2/3 rounded focus:ring-2 focus:ring-ring outline-none" placeholder="City" value={formData.city || ""} onChange={e => setFormData({...formData, city: e.target.value})} />
                                <input className="bg-background border border-input p-2 w-1/3 rounded focus:ring-2 focus:ring-ring outline-none" placeholder="Zip" value={formData.zip_code || ""} onChange={e => setFormData({...formData, zip_code: e.target.value})} />
                             </div>
                        ) : (
                            <p>{client.zip_code} {client.city}</p>
                        )}
                    </div>
                </div>
                <div className="pt-4 border-t border-border">
                    <label className="block text-xs uppercase font-bold text-muted-foreground mb-1">VAT ID (USt-IdNr.)</label>
                    {isEditing ? <input className="bg-background border border-input p-2 w-full rounded focus:ring-2 focus:ring-ring outline-none" value={formData.vat_id || ""} onChange={e => setFormData({...formData, vat_id: e.target.value})} /> : <p className="font-mono bg-muted px-2 py-1 inline-block rounded text-sm">{client.vat_id || "-"}</p>}
                </div>
            </div>
        </div>

        {/* NOTIZEN */}
        <div className="md:col-span-2 bg-card text-card-foreground p-6 rounded-lg shadow-sm border border-border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText size={20} className="text-muted-foreground" /> Internal Notes
            </h2>
            {isEditing ? (
                <textarea 
                    className="w-full bg-background border border-input p-3 rounded h-32 focus:ring-2 focus:ring-ring outline-none" 
                    placeholder="Wichtige Notizen zum Kunden..."
                    value={formData.notes || ""} 
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                />
            ) : (
                <div className="bg-muted/50 p-4 rounded border border-border whitespace-pre-wrap text-sm">
                    {client.notes ? client.notes : <span className="text-muted-foreground italic">No notes yet.</span>}
                </div>
            )}
        </div>
      </div>

      {/* ORDER HISTORY TABELLE */}
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border border-border">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <Package size={20} className="text-muted-foreground" /> Order History
            </h2>
            <span className="text-sm text-muted-foreground">{orders.length} Orders found</span>
        </div>

        {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded border border-dashed border-border">
                No orders found for this client.
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-xs">
                        <tr>
                            <th className="p-3 font-medium">Order ID</th>
                            <th className="p-3 font-medium">Date</th>
                            <th className="p-3 font-medium">Items</th>
                            <th className="p-3 font-medium">Total</th>
                            <th className="p-3 font-medium">Status</th>
                            <th className="p-3 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                                <td className="p-3 font-mono text-muted-foreground">#{order.id.slice(0,8)}</td>
                                <td className="p-3">{new Date(order.created_at).toLocaleDateString()}</td>
                                <td className="p-3">{order.items ? order.items.length : 0} Items</td>
                                <td className="p-3 font-medium">
                                    {(order.items || []).reduce((sum:number, i:any) => sum + (Number(i.price)*i.quantity), 0).toFixed(2)} €
                                </td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    <button 
                                        onClick={() => router.push(`/orders?highlight=${order.id}`)} 
                                        className="text-primary hover:text-primary/80 flex items-center justify-end gap-1"
                                    >
                                        <Eye size={16} /> View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

    </div>
  );
}
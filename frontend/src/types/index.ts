export interface Client {
    id: string;
    name: string;
    email?: string; // Optional
    contact_person?: string;
    phone?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    zip_code?: string;
    country?: string;
    vat_id?: string;
    notes?: string;
    logo_url?: string;
    website?: string;
    created_at: string;
  }
  
  export interface Order {
    id: string;
    client_id: string;
    customer_name: string;
    status: 'draft' | 'confirmed' | 'in_production' | 'shipped' | 'completed';
    total_amount: number;
    created_at: string;
    items: any[];
  }
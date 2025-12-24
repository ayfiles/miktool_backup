export interface Client {
  id: string;
  name: string;
  email?: string;
  // Die neuen Felder (alle optional '?', falls mal was fehlt)
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
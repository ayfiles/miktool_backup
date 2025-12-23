export interface OrderItem {
    id: string;
    product_id: string;
    products?: {
        name: string;
    };
    color: string;
    size: string;
    quantity: number;
    branding_method: string;
    branding_position: string;
}

export interface Order {
    id: string;
    client_id: string;
    customer_name: string;
    status: 'draft' | 'confirmed' | 'in_production' | 'shipped' | 'completed';
    created_at: string;
    items: OrderItem[];
}
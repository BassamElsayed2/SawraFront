import { createClient } from "@/services/supabase";

export interface OrderItem {
  product_id?: string;
  offer_id?: string;
  type: "product" | "offer";
  title_ar: string;
  title_en: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  size?: string;
  size_data?: any;
  variants?: string[];
  notes?: string;
}

export interface Order {
  id: string;
  user_id: string;
  address_id: string;
  delivery_type: "delivery" | "pickup";
  branch_id?: string;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivering"
    | "delivered"
    | "cancelled";
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  address_id: string;
  delivery_type: "delivery" | "pickup";
  branch_id?: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  notes?: string;
}

export const ordersApi = {
  async createOrder(userId: string, orderData: CreateOrderData) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        address_id: orderData.address_id,
        delivery_type: orderData.delivery_type,
        branch_id: orderData.branch_id,
        status: "pending",
        items: orderData.items,
        subtotal: orderData.subtotal,
        delivery_fee: orderData.delivery_fee,
        total: orderData.total,
        notes: orderData.notes,
      })
      .select()
      .single();

    return { data, error };
  },

  async getOrders(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  async getOrder(orderId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    return { data, error };
  },

  async updateOrderStatus(orderId: string, status: Order["status"]) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select()
      .single();

    return { data, error };
  },

  async cancelOrder(orderId: string) {
    return this.updateOrderStatus(orderId, "cancelled");
  },
};

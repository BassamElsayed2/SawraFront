import apiClient from "./api-client";

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
  payment_method?: string;
}

export const ordersApi = {
  async createOrder(orderData: CreateOrderData) {
    try {
      const response: any = await apiClient.post("/orders", orderData);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },

  async getOrders() {
    try {
      const response: any = await apiClient.get("/orders");
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },

  async getOrder(orderId: string) {
    try {
      const response: any = await apiClient.get(`/orders/${orderId}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },

  async updateOrderStatus(orderId: string, status: Order["status"]) {
    try {
      const response: any = await apiClient.put(`/orders/${orderId}/status`, {
        status,
      });
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },

  async cancelOrder(orderId: string) {
    try {
      const response: any = await apiClient.put(`/orders/${orderId}/cancel`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },

  async markOrderAsPaid(orderId: string) {
    try {
      const response: any = await apiClient.put(`/orders/${orderId}/mark-paid`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },
};

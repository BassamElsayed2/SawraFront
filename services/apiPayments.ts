import apiClient from "./api-client";

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled"
    | "refunded";
  provider: string;
  transaction_id?: string;
  reference_number?: string;
  created_at: string;
  updated_at: string;
  order_status?: string;
  order_payment_status?: string;
}

export interface InitiatePaymentData {
  order_id: string;
  amount: number;
  currency?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
}

export interface InitiatePaymentResponse {
  paymentId: string;
  transactionId: string;
  paymentUrl: string;
  expiresAt?: string;
}

export const paymentsApi = {
  /**
   * Initiate a payment for an order
   */
  async initiatePayment(data: InitiatePaymentData) {
    try {
      const response: any = await apiClient.post("/payments/initiate", data);
      return { data: response.data as InitiatePaymentResponse, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },

  /**
   * Get payment status by payment ID
   */
  async getPaymentStatus(paymentId: string) {
    try {
      const response: any = await apiClient.get(
        `/payments/status/${paymentId}`
      );
      return { data: response.data as Payment, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },

  /**
   * Get payment by order ID
   */
  async getPaymentByOrderId(orderId: string) {
    try {
      const response: any = await apiClient.get(`/payments/order/${orderId}`);
      return { data: response.data as Payment, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },

  /**
   * Cancel payment
   */
  async cancelPayment(paymentId: string) {
    try {
      const response: any = await apiClient.post(
        `/payments/cancel/${paymentId}`
      );
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },

  /**
   * Get all payments (admin only)
   */
  async getAllPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    order_id?: string;
  }) {
    try {
      const queryString = new URLSearchParams(
        params as Record<string, string>
      ).toString();
      const response: any = await apiClient.get(
        `/payments${queryString ? `?${queryString}` : ""}`
      );
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },
};

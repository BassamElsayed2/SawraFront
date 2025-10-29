import apiClient from "./api-client-rq";

export interface CalculateDeliveryFeeParams {
  user_latitude: number;
  user_longitude: number;
  branch_id?: string; // Branch ID selected by user
}

export interface CalculateDeliveryFeeResult {
  fee: number;
  distance_km: number;
  nearest_branch: {
    id: string;
    name_ar: string;
    name_en: string;
    address_ar: string;
    address_en: string;
  };
}

export interface DeliveryFeeConfig {
  id: string;
  min_distance_km: number;
  max_distance_km: number;
  fee: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Calculate delivery fee based on user location
 */
export async function calculateDeliveryFee(
  params: CalculateDeliveryFeeParams
): Promise<CalculateDeliveryFeeResult> {
  const response = await apiClient.post<{ data: CalculateDeliveryFeeResult }>(
    "/delivery/calculate-fee",
    params
  );
  return response.data;
}

/**
 * Get all delivery fee configurations (Admin only)
 */
export async function getDeliveryFeeConfigs(): Promise<DeliveryFeeConfig[]> {
  const response = await apiClient.get<{
    data: { configs: DeliveryFeeConfig[] };
  }>("/delivery/fee-configs");
  return response.data.configs;
}

/**
 * Create delivery fee configuration (Admin only)
 */
export async function createDeliveryFeeConfig(config: {
  min_distance_km: number;
  max_distance_km: number;
  fee: number;
}): Promise<DeliveryFeeConfig> {
  const response = await apiClient.post<{
    data: { config: DeliveryFeeConfig };
  }>("/delivery/fee-configs", config);
  return response.data.config;
}

/**
 * Update delivery fee configuration (Admin only)
 */
export async function updateDeliveryFeeConfig(
  id: string,
  config: {
    min_distance_km?: number;
    max_distance_km?: number;
    fee?: number;
    is_active?: boolean;
  }
): Promise<DeliveryFeeConfig> {
  const response = await apiClient.put<{ data: { config: DeliveryFeeConfig } }>(
    `/delivery/fee-configs/${id}`,
    config
  );
  return response.data.config;
}

/**
 * Delete delivery fee configuration (Admin only)
 */
export async function deleteDeliveryFeeConfig(id: string): Promise<void> {
  await apiClient.delete(`/delivery/fee-configs/${id}`);
}

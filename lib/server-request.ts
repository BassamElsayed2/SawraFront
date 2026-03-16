"use server";

import { cookies } from "next/headers";
import { encryptDataApi } from "@/components/shared/encryption";

// ============== API Key Generation ==============

function getApiKeyHeaders(): Record<string, string> {
  const utcTimestamp = parseFloat((Date.now() / 1000).toFixed(3));
  const apiKey = `O9Fybfhn.0bhxrjD5NH5OyZYPTBDsAhf2xSV2RD3R///${utcTimestamp}`;
  const apiKeyEncrypt = encryptDataApi(apiKey, process.env.SECRET_KEY as string);
  
  return {
    "x-api-key": apiKeyEncrypt,
  };
}

// ============== Server Request Function ==============

/**
 * Server-side fetch function with API key support
 * Use this in all server actions/components
 * 
 * Example:
 * import { serverRequestWithApiKey } from "@/lib/server-request";
 * const data = await serverRequestWithApiKey<any>("/endpoint");
 */
export async function serverRequestWithApiKey<T>(
  endpoint: string,
  options: RequestInit = {},
  apiBaseUrl?: string
): Promise<T> {
  const API_BASE_URL = apiBaseUrl || process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:5000/api";
  
  // Get access token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value || null;
  
  // Get API key headers (generated directly, no fetch needed)
  const apiKeyHeaders = getApiKeyHeaders();
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...apiKeyHeaders,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") 
    ? endpoint 
    : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
    // Allow callers to opt into caching/revalidation for non-critical endpoints
    cache: options.cache ?? "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  
  // Handle different response formats
  if (data && typeof data === 'object' && 'data' in data && data.data !== undefined) {
    return data.data as T;
  }
  
  return data as T;
}

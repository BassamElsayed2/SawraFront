import { decryptDataApi, encryptDataApi } from "@/components/shared/encryption";

/**
 * Get API key headers for server-side requests
 */
export async function getApiKeyHeaders(): Promise<Record<string, string>> {
  try {
    const response = await fetch(`/api/utc-time/`);
    const dataTime = await response.json();
    const utcTimestamp = dataTime.fx_dyn;
    const fx_dyn = decryptDataApi(utcTimestamp, process.env.SECRET_KEY as string);
    const apiKey = `O9Fybfhn.0bhxrjD5NH5OyZYPTBDsAhf2xSV2RD3R///${fx_dyn}`;
    const apiKeyEncrypt = encryptDataApi(apiKey, process.env.SECRET_KEY as string);
    return {
      "x-api-key": apiKeyEncrypt,
    };
  } catch (err) {
    // Fallback
    const apiKey = `O9Fybfhn.0bhxrjD5NH5OyZYPTBDsAhf2xSV2RD3R///${Date.now() / 1000}`;
    const apiKeyEncrypt = encryptDataApi(apiKey, process.env.SECRET_KEY as string);
    return {
      "x-api-key": apiKeyEncrypt,
    };
  }
}

/**
 * Get API key headers for client-side requests
 */
export async function getClientApiKeyHeaders(): Promise<Record<string, string>> {
  try {
    // Call API endpoint to get ready-to-use encrypted API key
    const apiKeyResponse = await fetch(`/api/api-key`);
    if (apiKeyResponse.ok) {
      const { apiKey } = await apiKeyResponse.json();
      return {
        "x-api-key": apiKey,
      };
    }
    
    // Fallback: use current timestamp (not ideal but works)
    const apiKey = `O9Fybfhn.0bhxrjD5NH5OyZYPTBDsAhf2xSV2RD3R///${Date.now() / 1000}`;
    return {
      "x-api-key": apiKey,
    };
  } catch (err) {
    // Fallback
    const apiKey = `O9Fybfhn.0bhxrjD5NH5OyZYPTBDsAhf2xSV2RD3R///${Date.now() / 1000}`;
    return {
      "x-api-key": apiKey,
    };
  }
}

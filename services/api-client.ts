// API Client for Express Backend

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface FetchOptions extends RequestInit {
  data?: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { data, headers, ...customConfig } = options;

    const config: RequestInit = {
      method: data ? "POST" : "GET",
      ...customConfig,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      credentials: "include", // Include cookies
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);

      let result;
      const contentType = response.headers.get("content-type");

      try {
        // Only try to parse JSON if content-type is JSON
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          // If not JSON, get text and try to parse it
          const text = await response.text();
          try {
            result = JSON.parse(text);
          } catch {
            // If parsing fails, create error object with text
            result = { message: text || "Request failed" };
          }
        }
      } catch (parseError) {
        // Response parsing failed - using fallback error message
        result = { message: "Invalid response format" };
      }

      if (!response.ok) {
        // Handle validation errors with detailed messages
        if (result.errors && Array.isArray(result.errors)) {
          const errorMessages = result.errors
            .map((err: any) => `${err.field}: ${err.message}`)
            .join(", ");
          throw new Error(
            errorMessages || result.message || "Validation failed"
          );
        }
        throw new Error(result.message || "API request failed");
      }

      return result;
    } catch (error) {
      // Re-throw error to be handled by the caller
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: FetchOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", data });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: FetchOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", data });
  }

  async delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options?: FetchOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", data });
  }

  // Upload file
  async uploadFile(
    endpoint: string,
    file: File,
    folder?: string
  ): Promise<any> {
    const formData = new FormData();
    formData.append("image", file);
    if (folder) {
      formData.append("folder", folder);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Upload failed");
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(API_URL);
export default apiClient;

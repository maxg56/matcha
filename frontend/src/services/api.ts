const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? 'http://localhost:8080' : 'https://localhost:8443'
);

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ApiError extends Error {
  status?: number;
}

class ApiService {
  private baseURL = API_BASE_URL;

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('accessToken');

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      console.log(`Making request to: ${url}`, { config });
      const response = await fetch(url, config);
      
      // Log response details
      console.log(`Response status: ${response.status}`, {
        ok: response.ok,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Get response text first to handle both JSON and non-JSON responses
      const responseText = await response.text();
      console.log('Raw response text:', responseText.substring(0, 500));

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', {
          status: response.status,
          contentType,
          body: responseText.substring(0, 500)
        });
        
        const error: ApiError = new Error(
          `Server returned ${contentType || 'unknown content type'} instead of JSON. Status: ${response.status}. Response: ${responseText.substring(0, 200)}`
        );
        error.status = response.status;
        throw error;
      }

      let data: ApiResponse<T>;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        console.error('Raw response that failed to parse:', responseText.substring(0, 500));
        
        throw new Error(`Invalid JSON response from server. Status: ${response.status}. Response: ${responseText.substring(0, 200)}`);
      }

      if (!response.ok) {
        console.error('API error response:', data);
        const error: ApiError = new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        throw error;
      }

      if (!data.success) {
        console.error('API business logic error:', data);
        throw new Error(data.error || 'API request failed');
      }

      console.log('API request successful:', data);
      return data.data!;
    } catch (error) {
      console.error('API request failed:', { url, error });
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();
export type { ApiError, ApiResponse };
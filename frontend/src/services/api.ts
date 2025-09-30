
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:8443';

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

  private retryCount = 0;
  private maxRetries = 2;
  // Délai de retry pour les futures implémentations
  // private readonly retryDelay = 1000;

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<T> {
    // Réinitialiser le compteur de retry pour chaque nouvelle requête (pas pour les retries)
    if (!isRetry) {
      this.retryCount = 0;
    }
    
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
        console.error('API error response:', { status: response.status, data });
        let errorMessage = data.error || `HTTP ${response.status}: ${response.statusText}`;
        
        // Gérer le rafraîchissement du token en cas d'erreur 401
        if (response.status === 401 && endpoint !== '/api/v1/auth/refresh') {
          if (this.retryCount >= this.maxRetries) {
            // Réinitialiser le compteur et déconnecter l'utilisateur
            console.warn('Max token refresh attempts reached. Logging out user.');
            this.retryCount = 0;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
            throw new Error(errorMessage);
          }
          console.log('Attempting to refresh token...');
          try {
            this.retryCount++;
            
            // Attendre un délai avant de réessayer
            // await new Promise(resolve => setTimeout(resolve, this.retryDelay * this.retryCount));
            
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              // Faire l'appel de refresh directement sans passer par this.post pour éviter la récursion
              const refreshResponse = await fetch(`${this.baseURL}/api/v1/auth/refresh`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token: refreshToken })
              });

              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                // La réponse a la structure { success: true, data: { access_token, refresh_token } }
                const tokenData = refreshData.data;

                // Mettre à jour les tokens de manière sécurisée
                localStorage.setItem('accessToken', tokenData.access_token);
                localStorage.setItem('refreshToken', tokenData.refresh_token);

                // Réessayer la requête originale avec le flag isRetry
                return this.makeRequest<T>(endpoint, options, true);
              } else {
                throw new Error('Refresh token invalid');
              }
            }
          } catch {
            // Si le refresh échoue, on déconnecte l'utilisateur
            this.retryCount = 0;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
          }
        } else if (response.status === 429) {
          errorMessage = 'Trop de requêtes. Veuillez patienter quelques secondes avant de réessayer.';
        } else if (response.status === 500 && data.error && 
                  (data.error.includes('duplicate key') || 
                    data.error.includes('unique constraint') ||
                    data.error.includes('SQLSTATE 23505'))) {
          errorMessage = 'duplicate_interaction';
        }
        
        const error: ApiError = new Error(errorMessage);
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
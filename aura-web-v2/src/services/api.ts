// src/services/api.ts
// Use Vite's environment variable for the API base URL.
// This will be set in Vercel for production and in .env.local for development.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('aura_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * A centralized API client wrapper around fetch.
 * - Automatically prepends the API base URL.
 * - Injects authorization headers.
 * - Throws a detailed error on non-ok HTTP responses.
 * - Parses JSON response bodies.
 */
export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log('Requesting API URL:', fullUrl); // This will log the URL to the browser console

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `API request failed: ${response.status} ${response.statusText}`);
  }

  // Handle responses with no content (e.g., HTTP 204 from a DELETE request)
  return response.status === 204 ? (undefined as T) : response.json();
}
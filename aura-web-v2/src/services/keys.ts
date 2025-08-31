import { API_BASE_URL, getAuthHeaders } from './api';

export interface ProviderKey {
  provider_name: string;
  masked_key: string;
}

export interface ProviderKeyCreate {
  provider_name: string;
  api_key: string;
}

export interface ProviderKeyList {
  keys: ProviderKey[];
}

export const keysApi = {
  async getKeys(): Promise<ProviderKeyList> {
    const response = await fetch(`${API_BASE_URL}/api-keys`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get API keys: ${response.status}`);
    }

    return response.json();
  },

  async createOrUpdateKey(keyData: ProviderKeyCreate): Promise<ProviderKey> {
    const response = await fetch(`${API_BASE_URL}/api-keys`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(keyData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to save API key: ${response.status}`);
    }

    return response.json();
  },

  async deleteKey(providerName: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api-keys/${providerName}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete API key: ${response.status}`);
    }
  }
};
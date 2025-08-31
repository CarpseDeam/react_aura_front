// src/services/api.ts
export const API_BASE_URL = 'http://localhost:8080';

export const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('aura_token')}`,
  'Content-Type': 'application/json'
});